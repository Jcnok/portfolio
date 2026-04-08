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

## Verification Plan

### Automated Tests
- Run `npm test` (to be configured with Jest) to validate data fetching and filtering logic in `projects.js`.

### Manual Verification
- Deploy to Vercel preview environments.
- Verify the chat widget responds accurately to queries in both Light and Dark modes.
- Verify project filtering works seamlessly with the new JSON data source.
