# Portfolio Brownfield PRD

## Goal Description
Enhance the existing Vanilla JS/Vercel portfolio to act as a more robust, modular, and testable active prospecting tool for Data Science and Engineering roles.

---

## Epic 1: Refatoração e Modularização do Core

**Objetivo:** Eliminar os débitos técnicos mais críticos do codebase, tornando-o mais robusto, manutenível e preparado para a adição de novos conteúdos por agentes de IA.

### Story 1.1: Desacoplar Dados de Projetos para JSON Externo

**Status:** Done ✅

Como desenvolvedor usando o portfólio,
Eu quero que os dados dos projetos estejam em um arquivo `assets/data/projects.json`
Para que novos projetos possam ser adicionados sem alterar a lógica JavaScript.

**Acceptance Criteria:**
- AC1: Criar `assets/data/projects.json` com os 6 projetos existentes (dados atuais de `projects.js`).
- AC2: Refatorar `assets/js/projects.js` para fazer fetch assíncrono de `assets/data/projects.json`.
- AC3: Exibir estado de loading enquanto o fetch ocorre.
- AC4: Exibir mensagem de erro adequada se o fetch falhar.
- AC5: A funcionalidade de filtro por categoria deve continuar funcionando após a refatoração.

---

### Story 1.2: Corrigir Race Condition no Tema do Chart.js

**Status:** Done ✅

Como usuário do portfólio,
Eu quero que o gráfico radar de habilidades atualize suas cores corretamente ao trocar entre modo claro e escuro
Para que a experiência visual seja consistente e sem bugs.

**Acceptance Criteria:**
- AC1: Substituir o `setTimeout(..., 100)` em `skills-chart.js` por um `MutationObserver` no atributo `data-theme` do `<html>`.
- AC2: As cores do gráfico (grid, labels, pontos) devem ser atualizadas imediatamente ao trocar o tema.
- AC3: Não deve haver flash ou atraso visual visível na atualização do gráfico.

---

### Story 1.3: Melhorar Error Handling e Rate Limiting na API de Chat

**Status:** Done ✅

Como proprietário do portfólio,
Eu quero que a Vercel Serverless Function `/api/chat` seja mais robusta
Para proteger contra abuso e fornecer feedback mais claro ao usuário em caso de erros da API Gemini.

**Acceptance Criteria:**
- AC1: Adicionar cabeçalho de `Content-Type: application/json` na validação de corpo da requisição.
- AC2: Capturar e retornar erros específicos da API Gemini (ex: `QUOTA_EXCEEDED`, `SAFETY`).
- AC3: Implementar um rate limit básico por IP (ex: máximo de 15 requisições por minuto) usando a memória da função serverless ou um header de resposta.
- AC4: O frontend (`assets/js/chat.js`) deve exibir mensagem amigável para todos os tipos de erro mapeados.

---

## Epic 2: Qualidade e Testes Automatizados

**Objetivo:** Introduzir uma fundação de testes que permita que agentes de IA realizem refatorações com confiança.

### Story 2.1: Configurar Ambiente de Testes com Jest

**Status:** Done ✅

Como equipe de desenvolvimento,
Eu quero um ambiente de testes unitários configurado com Jest
Para que a lógica de `projects.js` e `skills-chart.js` possa ser validada automaticamente.

**Acceptance Criteria:**
- AC1: Criar `package.json` na raiz do projeto com scripts `npm test`.
- AC2: Configurar Jest para ambiente de browser (jsdom).
- AC3: Escrever pelo menos 3 testes unitários para `filterProjects` em `projects.js` (filtro `all`, filtro por categoria válida, filtro por categoria vazia).
- AC4: O comando `npm test` deve passar com todos os testes.
- AC5: Adicionar `node_modules/` ao `.gitignore` se não estiver lá.

---

### Story 2.2: Configurar CI/CD com GitHub Actions

**Status:** Done ✅

Como equipe de desenvolvimento,
Eu quero que os testes sejam executados automaticamente em cada push via GitHub Actions
Para garantir que o deploy na Vercel seja precedido de validação de qualidade.

**Acceptance Criteria:**
- AC1: Criar `.github/workflows/ci.yml`.
- AC2: O workflow deve executar `npm install` e `npm test` em cada push para `main` e em Pull Requests.
- AC3: O workflow deve falhar se algum teste falhar, impedindo merge.
- AC4: O runtime a ser usado é Node.js 20.x.

---

## Epic 3: Portfólio Dinâmico — GitHub Pinned Repos + Agente Gemini

**Objetivo:** Tornar a seção de projetos 100% autônoma e dinâmica. O portfólio deve refletir automaticamente os repositórios pinados do GitHub, eliminando a necessidade de atualização manual do `projects.json`. Um agente Gemini analisa cada repositório e gera conteúdo estratégico e criativo para maximizar o impacto visual e informativo.

### Seleção de Modelos de IA (Free Tier)

| Caso de Uso | Modelo | RPM | RPD | Justificativa |
|-------------|--------|-----|-----|---------------|
| **Chat Widget** | `gemini-3.1-flash-lite` | 15 | 500 | Baixa latência, quota generosa para interação com visitantes |
| **Agente Criativo** | `gemini-2.5-flash` | 5 | 20 | Modelo mais capaz, 250K TPM para processar READMEs em batch. Roda apenas 1-2x/dia no Actions |
| **Capas Fallback** | `imagen-4-ultra-generate` | - | 25 | Qualidade máxima, latência irrelevante (build-time) |

### Arquitetura — Build-time via GitHub Actions

```
┌─────────────────────────────────────────────────────────────────┐
│              FLUXO AUTÔNOMO (GitHub Actions)                    │
│                                                                 │
│  Trigger: cron diário (06:00 UTC) + workflow_dispatch           │
│        │                                                        │
│        ▼                                                        │
│  scripts/generate-projects.mjs                                  │
│        │                                                        │
│        ├─► GitHub GraphQL API → repos pinados (metadata)        │
│        │     - name, description, url, language, topics          │
│        │     - homepageUrl, openGraphImageUrl                    │
│        │                                                        │
│        ├─► GitHub REST API → README.md de cada repo             │
│        │     - Extrair primeira imagem real (não badges)         │
│        │     - Converter paths relativos → URLs absolutas        │
│        │     - Fallback: openGraphImageUrl → null                │
│        │                                                        │
│        ├─► Gemini 2.5 Flash → Agente de Análise Criativa        │
│        │     - Input: batch de todos os repos + READMEs          │
│        │     - Output: summary, category, highlightTags          │
│        │                                                        │
│        ├─► Imagen 4 Ultra → Capas para repos sem imagem         │
│        │     (apenas se coverImage === null)                     │
│        │                                                        │
│        ▼                                                        │
│  assets/data/projects.json (commit + push se houve mudanças)    │
│        │                                                        │
│        ▼                                                        │
│  Vercel auto-deploy → Frontend renderiza via fetch estático     │
└─────────────────────────────────────────────────────────────────┘
```


---

### Story 3.1: Criar Serverless Function `/api/projects` com GitHub API

**Status:** Done ✅

Como desenvolvedor do portfólio,
Eu quero uma Vercel Serverless Function que consulte os repositórios pinados do meu perfil GitHub via GraphQL API,
Para que o portfólio sempre reflita os projetos que eu escolhi destacar, sem edição manual.

**Acceptance Criteria:**
- AC1: Criar `api/projects.js` que faça query GraphQL para o endpoint `https://api.github.com/graphql` buscando os `pinnedItems` do usuário `Jcnok`.
- AC2: Para cada repositório pinado, retornar: `name`, `description`, `url`, `homepageUrl`, `primaryLanguage`, `repositoryTopics`, `openGraphImageUrl`.
- AC3: Buscar o conteúdo do `README.md` de cada repo via GitHub REST API (`GET /repos/{owner}/{repo}/readme`).
- AC4: Extrair a primeira imagem (png, jpg, jpeg, gif, webp) do conteúdo do README com regex. Se não encontrar, usar `openGraphImageUrl`. Se não houver nenhum, retornar `null` (o frontend usará um placeholder).
- AC5: Implementar cache de 15 minutos (in-memory ou `Cache-Control` header) para evitar rate limit da API do GitHub.
- AC6: Autenticar via `GITHUB_TOKEN` (env var no Vercel) para aumentar o rate limit de 60 para 5000 req/hora.
- AC7: Retornar resposta com estrutura JSON padronizada:
```json
{
  "projects": [
    {
      "id": "repo-name",
      "title": "Repo Name",
      "description": "Descrição do GitHub",
      "url": "https://github.com/Jcnok/repo",
      "homepageUrl": "https://demo.vercel.app",
      "language": "Python",
      "topics": ["fastapi", "llm", "automation"],
      "coverImage": "https://raw.githubusercontent.com/.../cover.png",
      "readme": "conteúdo do README em markdown (truncado a 2000 chars)"
    }
  ]
}
```

**Dev Notes:**
- A GraphQL query para pinned repos é:
```graphql
{
  user(login: "Jcnok") {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          description
          url
          homepageUrl
          primaryLanguage { name }
          repositoryTopics(first: 10) { nodes { topic { name } } }
          openGraphImageUrl
        }
      }
    }
  }
}
```
- O `GITHUB_TOKEN` precisa ser um Personal Access Token (classic) com escopo `public_repo` (somente leitura).

---

### Story 3.2: Criar Agente Gemini para Análise Criativa dos Repositórios

**Status:** Done ✅

Como proprietário do portfólio,
Eu quero que um agente de IA (Gemini) analise cada repositório pinado e gere conteúdo estratégico,
Para que as descrições, categorias e resumos dos projetos sejam profissionais e otimizados para recrutadores.

**Acceptance Criteria:**
- AC1: Criar `api/enrich-projects.js` (ou integrar em `/api/projects`) que receba os dados brutos do GitHub e envie ao Gemini para enriquecimento.
- AC2: O prompt do agente deve receber para cada repo: `name`, `description`, `topics`, `language` e `readme` (truncado a 2000 chars).
- AC3: O agente deve retornar para cada repo:
  - `summary`: Resumo estratégico de 2-3 frases, focado em impacto e tecnologias — será exibido no hover/tooltip do card.
  - `category`: Categoria sugerida para o filtro do portfólio (uma entre: `data-analysis`, `machine-learning`, `cloud`, `web-development`, `ai-automation`).
  - `highlightTags`: Array de 3-5 tags priorizadas (vindas dos topics mas curadas pelo agente).
- AC4: Se a API Gemini falhar, utilizar fallback: `description` original como `summary`, `language` como `category` base, e `topics` como `highlightTags`.
- AC5: O agente deve ser instruído para retornar as respostas em formato JSON parseable, não em markdown.

**Dev Notes (Resiliência & Ops):**
- Reutilizar a env var `GEMINI_API_KEY` (Obrigatório ser persistida como `Repository Secret` no GitHub Configs, evitando isolamento de `Environment Secrets`).
- Devido às falhas crônicas de limite RPM no Free-Tier (Rate Limiting e *Error 503 HTTP: Spikes in High Demand*), todo o bloco isolado de consumo REST para os modelos do Gemini DEVE possuir uma barreira impenetrável de retentativas. Foi imposto um Wrapper `fetchWithRetry` em JavaScript aplicando um *Exponential Backoff* e delays de "Sleep" (Ex: `sleep(15000)` entre rejeições) evitando Crash de CI.
- O modelo primário ideal para manter consistência sem Timeout de geração é o `gemini-3.1-flash-lite-preview` que apresenta um JSON object-array nativo sem falhas. 
- O prompt deve incluir instruções claras (ex: "Você é um consultor...", "Responda APENAS em JSON").

---

### Story 3.3: Refatorar Frontend para Consumir `/api/projects` Dinâmico

**Status:** Done ✅

Como usuário do portfólio,
Eu quero que a seção de projetos carregue dados diretamente da API `/api/projects` em vez do arquivo estático `projects.json`,
Para que os projetos sejam sempre atualizados automaticamente.

**Acceptance Criteria:**
- AC1: Refatorar `assets/js/projects.js` para fazer fetch de `/api/projects` em vez de `assets/data/projects.json`.
- AC2: Manter `assets/data/projects.json` como fallback estático caso a API falhe (graceful degradation).
- AC3: Mapear os campos da API para o formato esperado pelo `ProjectManager`:
  - `name` → `title` (formatado: kebab-case → Title Case)
  - `topics` / `highlightTags` → `tags`
  - `url` → `codeUrl`
  - `homepageUrl` → `demoUrl` (se existir, senão usar `url`)
  - `coverImage` → `image`
  - `category` → `category` (vinda do Gemini)
- AC4: Exibir o `summary` do Gemini como tooltip ao passar o mouse sobre o card do projeto (CSS `::after` ou `title` attribute aprimorado).
- AC5: Os filtros por categoria devem funcionar com as categorias dinâmicas retornadas pelo agente.
- AC6: Manter o estado de loading e error handling existente.
- AC7: Se `coverImage` for `null`, exibir uma imagem placeholder padrão (`assets/images/projects/default-project.png` com design neutro).

**Dev Notes:**
- A transição deve ser transparente — o visual do portfólio não deve mudar, apenas a fonte de dados.
- Manter backward compatibility: se `/api/projects` retornar erro, o frontend faz fetch de `assets/data/projects.json` como segunda tentativa.

---

### Story 3.4: Pipeline Automático — GitHub Actions para Regenerar Cache

**Status:** Done ✅

Como proprietário do portfólio,
Eu quero que um GitHub Actions workflow atualize o fallback `projects.json` periodicamente,
Para que mesmo com a API dinâmica, exista sempre uma snapshot estática atualizada como backup.

**Acceptance Criteria:**
- AC1: Criar `.github/workflows/update-projects.yml` que rode diariamente (cron: `0 6 * * *`) e em `workflow_dispatch`.
- AC2: O workflow deve chamar a API `/api/projects` do Vercel deploy e salvar o resultado em `assets/data/projects.json`.
- AC3: Se houve mudanças no JSON, o workflow faz commit e push automaticamente (usando `actions/checkout` + `git commit`).
- AC4: Se não houve mudanças, o workflow termina sem commit.
- AC5: O workflow deve rodar com o `GITHUB_TOKEN` do repositório (sem necessidade de PAT adicional).

**Dev Notes:**
- Este workflow funciona como "cache pré-aquecido" — o portfólio sempre tem dados recentes no fallback estático.
- Benefício extra: o git log mostra o histórico de mudanças nos projetos pinados ao longo do tempo.
- Considerar usar `peter-evans/create-pull-request@v6` em vez de push direto para main (mais seguro).

---

## Epic 4: Automação Preditiva e Perfil Data-Driven

**Objetivo:** Evoluir os componentes estáticos remanescentes (como gráficos de hard-skills) para painéis orientados a dados extraídos verdadeiramente das atividades globais de desenvolvimento do usuário na nuvem (GitHub), chancelados com insights da I.A.

### Story 4.1: Gráfico de Radar de Habilidades Autônomo (Data-Driven)

**Status:** Done ✅

Como proprietário do portfólio,
Eu quero que meu Gráfico Radar de habilidades (Chart.js) reflita 100% da minha stack atual real
Para que a demonstração de conhecimento técnico não dependa de atualizações manuais no frontend e impressione recrutadores por sua veracidade arquitetônica.

**Acceptance Criteria:**
- AC1: Criar um executável autônomo `scripts/generate-skills.mjs`.
- AC2: O script deve minerar TODOS os repositórios públicos atrelados ao GitHub do usuário de uma só vez (via API GraphQL).
- AC3: O script deve consolidar matematicamente o peso de cada linguagem e ferramenta em "Total Size Bytes" e contagem de "Topics" associados a cada micro-serviço da stack.
- AC4: Todo esse "Big Data" de repositórios extraído da rede deve ser empacotado em Prompt Seguro e despachado pro Agente LLM Gemini 3.1.
- AC5: O Agente deverá retornar um Output Estrito (`JSON-only`) com categorias normalizadas (0 a 100).
- AC6: Incluir no workflow primário (`update-projects.yml`) o disparo dessa pipeline diária.

---

## Verification Plan

### Automated Tests
- Run `npm test` to validate data fetching, filtering logic, and error handling in `projects.js`.
- Testes unitários para a lógica de extração de imagem do README (regex).
- Testes unitários para o mapeamento de dados da API para o formato do `ProjectManager`.

### Manual Verification
- Deploy to Vercel preview environments.
- Verify the chat widget responds accurately to queries in both Light and Dark modes.
- Verify project filtering works seamlessly with the new JSON data source.
- Pinar/despinar um repositório no GitHub e verificar que o portfólio reflete a mudança após o cache expirar (15 min).
- Verificar que os resumos gerados pelo Gemini são profissionais e estratégicos.
- Verificar que capas são extraídas do README corretamente, com fallback para OG image e placeholder.
- Testar em dispositivos móveis (responsive) que tooltips/hovers do summary funcionam (tap to show em mobile).

