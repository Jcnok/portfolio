#!/usr/bin/env node
/**
 * ingest-certificates.mjs
 * Pipeline autônomo: Google Drive PDFs → Gemini Vision → certificates.json
 *
 * Fluxo:
 *   1. Autentica na Google Drive API via Service Account (JSON key em env var)
 *   2. Lista PDFs na pasta configurada (GOOGLE_DRIVE_FOLDER_ID)
 *   3. Compara com certificates.json existente (ingestão incremental por fileId)
 *   4. Baixa cada PDF novo em memória (Buffer)
 *   5. Envia bytes para Gemini 1.5 Flash (Vision) para transcrição estruturada
 *   6. Salva resultado incremental em assets/data/certificates.json
 *
 * Uso local:
 *   GEMINI_API_KEY=xxx GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}' \
 *   GOOGLE_DRIVE_FOLDER_ID=xxx node scripts/ingest-certificates.mjs
 *
 * @version 1.0.0 (Story 9.1)
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createSign } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CERTS_JSON_PATH = resolve(__dirname, '../assets/data/certificates.json');

// ---------------------------------------------------------------------------
// Load .env fallback for local execution
// ---------------------------------------------------------------------------
const envPath = resolve(__dirname, '../.env');
if (existsSync(envPath)) {
    const envFile = readFileSync(envPath, 'utf8');
    for (const line of envFile.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            value = value.replace(/^(['"])(.*)\\1$/, '$2').trim();
            if (process.env[key] === undefined) {
                process.env[key] = value;
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// Service Account JSON key (stored as env var or GitHub Secret)
let SERVICE_ACCOUNT_KEY = null;
try {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (raw) {
        SERVICE_ACCOUNT_KEY = JSON.parse(raw);
    }
} catch (e) {
    console.error('⚠️ Falha ao parsear GOOGLE_SERVICE_ACCOUNT_KEY:', e.message);
}

// ---------------------------------------------------------------------------
// Google OAuth2 — JWT self-signed token (no googleapis dependency)
// ---------------------------------------------------------------------------
function base64url(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function getAccessToken(serviceAccount) {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
    };

    const segments = [
        base64url(Buffer.from(JSON.stringify(header))),
        base64url(Buffer.from(JSON.stringify(payload))),
    ];

    const sign = createSign('RSA-SHA256');
    sign.update(segments.join('.'));
    const signature = sign.sign(serviceAccount.private_key);
    segments.push(base64url(signature));

    const jwt = segments.join('.');

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`OAuth2 token error: ${JSON.stringify(err)}`);
    }

    const data = await response.json();
    return data.access_token;
}

// ---------------------------------------------------------------------------
// Fetch with Retry (Exponential Backoff) — mesma estratégia do generate-projects
// ---------------------------------------------------------------------------
async function fetchWithRetry(url, options, retries = 3, delayMs = 15000) {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, options);
        if (response.ok) return response;

        let errBody;
        try { errBody = await response.json(); } catch { errBody = {}; }
        const code = errBody?.error?.code || response.status;

        if (code !== 429 && code !== 503) {
            throw new Error(errBody?.error?.message || `HTTP ${response.status}`);
        }

        if (i < retries - 1) {
            console.log(`   ⏳ API ocupada (Erro ${code}). Tentando novamente em ${delayMs / 1000}s...`);
            await new Promise(r => setTimeout(r, delayMs));
        } else {
            throw new Error(`Falha persistente após ${retries} tentativas: ${errBody?.error?.message}`);
        }
    }
}

// ---------------------------------------------------------------------------
// 1. Google Drive — Listar PDFs na pasta
// ---------------------------------------------------------------------------
async function listDrivePDFs(accessToken, folderId) {
    console.log('📂 Listando PDFs no Google Drive...');

    const query = encodeURIComponent(
        `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`
    );
    const fields = encodeURIComponent('files(id,name,createdTime,modifiedTime,size)');

    const response = await fetchWithRetry(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=name&pageSize=100`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'User-Agent': 'portfolio-cert-ingestor',
            },
        }
    );

    const data = await response.json();
    const files = data.files || [];
    console.log(`   ✅ ${files.length} PDFs encontrados na pasta`);
    return files;
}

// ---------------------------------------------------------------------------
// 2. Google Drive — Baixar conteúdo do PDF (bytes)
// ---------------------------------------------------------------------------
async function downloadPDF(accessToken, fileId, fileName) {
    console.log(`   📥 Baixando: ${fileName}...`);

    const response = await fetchWithRetry(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'User-Agent': 'portfolio-cert-ingestor',
            },
        }
    );

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

// ---------------------------------------------------------------------------
// 3. Gemini Vision — Transcrição estruturada do PDF
// ---------------------------------------------------------------------------
async function transcribeWithGemini(pdfBuffer, fileName) {
    console.log(`   🤖 Transcrevendo via Gemini Vision: ${fileName}...`);

    const base64Data = pdfBuffer.toString('base64');

    const prompt = `Você é um especialista em análise de certificados profissionais.
Analise este certificado em PDF e extraia as seguintes informações de forma PRECISA.
Se algum campo não estiver presente no documento, retorne null para ele.

Retorne APENAS um JSON válido com esta estrutura (sem markdown, sem code fences):
{
  "title": "Nome completo do curso/certificação",
  "institution": "Nome da instituição emissora",
  "hours": 40,
  "completionDate": "2024-03-15",
  "skills": ["skill1", "skill2", "skill3"],
  "category": "uma entre: data-science, cloud, ai-ml, programming, devops, soft-skills, other",
  "description": "Breve resumo do conteúdo do certificado em 1-2 frases em português"
}

REGRAS:
- "hours" deve ser um número inteiro (carga horária). Se não encontrar, retorne null.
- "completionDate" deve estar no formato ISO (YYYY-MM-DD). Se não encontrar, retorne null.
- "skills" deve conter de 3 a 8 tecnologias/competências mencionadas ou implícitas no certificado.
- "category" deve ser UMA das categorias listadas, escolhida com base no conteúdo.
- Use português do Brasil para "description".
- Responda APENAS com o JSON, sem nenhum texto adicional.`;

    const response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'application/pdf',
                                data: base64Data,
                            },
                        },
                        { text: prompt },
                    ],
                }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: 'application/json',
                },
            }),
        }
    );

    if (!response.ok) {
        const err = await response.json();
        console.error(`   ❌ Gemini erro para ${fileName}:`, err.error?.message);
        return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        console.error(`   ⚠️ Gemini retornou resposta vazia para ${fileName}`);
        return null;
    }

    try {
        const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        console.log(`   ✅ Transcrito: "${parsed.title || fileName}"`);
        return parsed;
    } catch (parseErr) {
        console.error(`   ❌ Falha ao parsear JSON do Gemini para ${fileName}:`, parseErr.message);
        return null;
    }
}

// ---------------------------------------------------------------------------
// 4. Carregar certificates.json existente
// ---------------------------------------------------------------------------
function loadExistingCerts() {
    try {
        const raw = readFileSync(CERTS_JSON_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

// ---------------------------------------------------------------------------
// 5. Pipeline Principal
// ---------------------------------------------------------------------------
async function main() {
    console.log('🚀 Iniciando pipeline de ingestão de certificados...\n');

    // Validações
    if (!GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY não configurada!');
        process.exit(1);
    }
    if (!SERVICE_ACCOUNT_KEY) {
        console.error('❌ GOOGLE_SERVICE_ACCOUNT_KEY não configurada!');
        console.error('   Configure a variável com o JSON da Service Account do Google Cloud.');
        process.exit(1);
    }
    if (!GOOGLE_DRIVE_FOLDER_ID) {
        console.error('❌ GOOGLE_DRIVE_FOLDER_ID não configurado!');
        console.error('   Configure com o ID da pasta do Google Drive contendo os certificados.');
        process.exit(1);
    }

    // Step 1: Autenticar na Google Drive API
    console.log('🔑 Autenticando na Google Drive API...');
    const accessToken = await getAccessToken(SERVICE_ACCOUNT_KEY);
    console.log('   ✅ Token obtido com sucesso\n');

    // Step 2: Listar PDFs
    const driveFiles = await listDrivePDFs(accessToken, GOOGLE_DRIVE_FOLDER_ID);

    if (driveFiles.length === 0) {
        console.log('\n✅ Nenhum PDF encontrado na pasta. Nada a fazer.');
        return;
    }

    // Step 3: Carregar certificados existentes e identificar novos
    const existingCerts = loadExistingCerts();
    const existingFileIds = new Set(existingCerts.map(c => c.driveFileId));

    const newFiles = driveFiles.filter(f => !existingFileIds.has(f.id));
    console.log(`\n📋 Status: ${existingCerts.length} já indexados, ${newFiles.length} novos para processar`);

    if (newFiles.length === 0) {
        console.log('\n✅ Todos os certificados já foram ingeridos. Nada a fazer.');
        return;
    }

    // Step 4: Processar novos PDFs
    console.log(`\n📄 Processando ${newFiles.length} novos certificados...\n`);
    const newCerts = [];
    let nextId = existingCerts.length > 0
        ? Math.max(...existingCerts.map(c => c.id)) + 1
        : 1;

    for (const file of newFiles) {
        try {
            // Download PDF
            const pdfBuffer = await downloadPDF(accessToken, file.id, file.name);

            // Transcrição via Gemini Vision
            const transcription = await transcribeWithGemini(pdfBuffer, file.name);

            if (transcription) {
                newCerts.push({
                    id: nextId++,
                    driveFileId: file.id,
                    fileName: file.name,
                    title: transcription.title || file.name.replace('.pdf', ''),
                    institution: transcription.institution || null,
                    hours: transcription.hours || null,
                    completionDate: transcription.completionDate || null,
                    skills: transcription.skills || [],
                    category: transcription.category || 'other',
                    description: transcription.description || '',
                    ingestedAt: new Date().toISOString(),
                });
            } else {
                // Fallback: registra o arquivo mesmo sem transcrição para não reprocessar
                newCerts.push({
                    id: nextId++,
                    driveFileId: file.id,
                    fileName: file.name,
                    title: file.name.replace('.pdf', ''),
                    institution: null,
                    hours: null,
                    completionDate: null,
                    skills: [],
                    category: 'other',
                    description: 'Transcrição automática falhou. Revisão manual necessária.',
                    ingestedAt: new Date().toISOString(),
                });
            }

            // Rate limit entre requisições ao Gemini (Free Tier: 15 RPM)
            if (newFiles.indexOf(file) < newFiles.length - 1) {
                console.log('   ⏳ Aguardando 5s (rate limit)...');
                await new Promise(r => setTimeout(r, 5000));
            }
        } catch (err) {
            console.error(`   ❌ Erro ao processar ${file.name}:`, err.message);
        }
    }

    // Step 5: Merge e salvar
    const allCerts = [...existingCerts, ...newCerts];
    const newJson = JSON.stringify(allCerts, null, 2) + '\n';

    writeFileSync(CERTS_JSON_PATH, newJson);
    console.log(`\n✅ certificates.json atualizado: ${allCerts.length} certificados total (${newCerts.length} novos)`);
    console.log('   Arquivo: assets/data/certificates.json');

    // Log resumo
    console.log('\n📋 Novos certificados ingeridos:');
    newCerts.forEach(c => {
        console.log(`   🎓 ${c.title} — ${c.institution || 'Instituição N/A'} [${c.category}]`);
    });
}

main().catch((err) => {
    console.error('\n💥 Erro fatal:', err.message);
    process.exit(1);
});
