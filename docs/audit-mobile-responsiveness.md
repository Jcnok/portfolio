# 🔍 Auditoria de Responsividade Mobile — Portfólio Julio Okuda

**Realizado por:** 🎨 Uma (UX-Design Expert)  
**Data:** 2026-04-08  
**Escopo:** `index.html` + `assets/css/styles.css` — Diagnóstico completo de responsividade, UX, SEO e Performance.

---

## 1. Diagnóstico de Responsividade

### Problema 1: `.about-grid` — Layout de 2 colunas NÃO empilha em telas < 768px
- **Causa:** A regra `grid-template-columns: 1fr 1fr` (L413) não possui media query que a converta para `1fr` em mobile. A regra `@media (max-width: 992px)` altera `.about-content` (L1039), mas `.about-grid` é o container real usado no HTML. O seletor errado é aplicado.
- **Impacto:** "Sobre Mim", "Skills Chart" e "Trajetória Profissional" ficam lado a lado em telas pequenas, forçando rolagem horizontal.
- **Solução:** Adicionar `@media (max-width: 768px) { .about-grid { grid-template-columns: 1fr; } }`.

### Problema 2: `.skills-content` — `minmax(300px, 1fr)` estoura em telas < 320px
- **Causa:** A regra `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` (L523) força itens com mín. 300px. Em viewports de 320px (iPhone SE), o card transborda a tela porque `300px + 40px padding container > 320px`.
- **Impacto:** Rolagem horizontal na seção Skills.
- **Solução:** Alterar para `minmax(min(300px, 100%), 1fr)` ou adicionar media query com `1fr` forçado.

### Problema 3: `.chart-container` — Altura fixa de 350px sem adaptação
- **Causa:** `height: 350px` (L506) é fixo. Em mobile, o canvas do Chart.js não redimensiona proporcionalmente.
- **Impacto:** O gráfico pode ficar cortado ou com espaço excessivo em telas estreitas.
- **Solução:** Usar `height: auto; min-height: 250px; aspect-ratio: 1 / 1;` para mobile.

### Problema 4: Chat Widget posição `right: 20px` sem safe-area
- **Causa:** `.chat-widget { right: 20px }` (L1200) está OK em desktop, mas o `.chat-container { width: 350px }` (L1229) pode ultrapassar a viewport. A media query `@media (max-width: 576px)` define `width: calc(100vw - 30px)` mas mantém `max-width: 350px`.
- **Impacto:** Em dispositivos entre 350px e 576px, o chat pode cortar na lateral esquerda.
- **Solução:** Remover `max-width: 350px` do media query mobile e ajustar posição para `right: -5px` ou centralizar.

### Problema 5: `.hero-text h1` — Font-size 3.5rem sem clamp
- **Causa:** `font-size: 3.5rem` (L271) é reduzido para `2.5rem` apenas em `@media (max-width: 576px)`. Entre 576px-768px o texto pode transbordar.
- **Impacto:** Títulos longos causam overflow horizontal em tablets portrait.
- **Solução:** Usar `font-size: clamp(2rem, 5vw, 3.5rem)` para escalonamento fluido.

### Problema 6: `.projects-grid` — 2 colunas fixas até 576px
- **Causa:** `grid-template-columns: repeat(2, 1fr)` (L626) só vira `1fr` em `@media (max-width: 576px)`. Entre 576px-768px, os cards ficam espremidos.
- **Impacto:** Cards ilegíveis no range tablet-small.
- **Solução:** Mover a quebra para `768px`.

### Problema 7: `.project-image` — Altura fixa 280px
- **Causa:** `height: 280px` (L649) é rígida. Em mobile com card de 1 coluna, a proporção fica desproporcional.
- **Solução:** Usar `height: auto; max-height: 220px;` ou `aspect-ratio: 16/9;` em mobile.

### Problema 8: Nav logo `font-size: 1.8rem` — Overflow com muitos itens
- **Causa:** 7 itens no nav (`Sobre`, `Habilidades`, `Projetos`, `Certificações`, `Gerar CV IA`, `Contato`, `Theme Toggle`) + logo com `1.8rem`. Em tablets (769px-992px), o nav não cabe.
- **Impacto:** Itens podem vazar para fora da viewport antes de ativar o burger menu (que só ativa em ≤768px).
- **Solução:** Ampliar o breakpoint do burger para `992px` ou reduzir font/spacing dos nav items.

### Problema 9: Modal CV Generator — Largura `width: 90%` sem limitar mobile
- **Causa:** `.modal-content { width: 90%; max-width: 800px; }` está OK, mas o `.modal-body { overflow-y: auto }` sem `max-height` pode ultrapassar a viewport.
- **Solução:** Adicionar `max-height: calc(90vh - 80px)` ao `.modal-body`.

### Problema 10: `.github-stats` — `flex-wrap: wrap` mas sem gap em mobile
- **Causa:** Os stats ficam em 3 colunas implícitas. Em mobile estreito, o texto "Transição IA" empurra os demais.
- **Solução:** Adicionar `gap: 15px` e `justify-content: center` em media query mobile.

### Problema 11: Stats Cards — Escalonamento desproporcional
- **Causa:** Valores fixos de `2rem`.
- **Solução:** Implementação de `clamp(1.2rem, 3vw, 1.8rem)` para manter proporção em qualquer tela.

### Problema 12: Gráfico de Habilidades — Corte de labels longas
- **Causa:** Nomes de tecnologias extensas encostam no limite do canvas.
- **Solução:** Interceptor JS no `skills-chart.js` para quebrar strings longas em Arrays (multiline) dinamicamente.

### Problema 13: Filtro de Projetos — Desalinhamento mobile
- **Causa:** Mistura de botões `inline-flex` com larguras variadas.
- **Solução:** Grid de 1 coluna vertical forçado em `< 576px`.

### Problema 14: Descrição de Projetos — Overflow vertical no overlay
- **Causa:** Textos longos ultrapassam o card em mobile.
- **Solução:** Implementação de `line-clamp: 4` para clipping elegante com reticências.

---

## 2. Overview e Recomendações

### UX — Navegação Mobile
1. **Burger menu em ≤ 992px**: Com 7 itens no nav, o breakpoint deve subir de 768px para 992px.
2. **Chat toggle z-index**: Garantir que o FAB do chat não sobreponha o burger menu aberto.
3. **Touch targets**: Todos os botões de ação devem ter no mínimo `44x44px` (WCAG 2.5.8).
4. **Modal mobile**: O modal do CV Generator deve ocupar `100vh` em mobile (`max-width: 100%; border-radius: 0;`).
5. **Scroll restauração**: Ao fechar o menu mobile, restaurar posição de scroll.

### SEO — Mobile-First Index
1. **Google Mobile-First Indexing**: Sites com elementos cortados em mobile perdem posições. Horizontal scroll é penalizado.
2. **Core Web Vitals**: Layout shifts causados por imagens sem `width/height` explícitos afetam CLS.
3. **`<meta viewport>`**: Verificar presença de `<meta name="viewport" content="width=device-width, initial-scale=1">`.
4. **Structured Data**: Adicionar `schema.org/Person` para melhorar rich snippets.

### Performance Mobile
1. **Imagens**: Profile image e project covers devem usar formatos modernos (WebP/AVIF) com `loading="lazy"`.
2. **Font loading**: `Inter` font pode bloquear renderização. Usar `font-display: swap`.
3. **CSS crítico**: Considerar inline do CSS above-the-fold para reduzir FCP.
4. **Chart.js**: Verificar se o bundle inteiro (60KB) é carregado mesmo sem scroll até a seção Skills.

---

## 3. Atualização do PRD (Trecho)

### Requisitos de Responsividade Mobile (v1.1)

**Requisitos Obrigatórios:**
- RR1: Em viewports ≤ 768px, TODAS as seções de conteúdo devem empilhar em coluna única (`grid-template-columns: 1fr`).
- RR2: Nenhum elemento deve causar rolagem horizontal (`overflow-x`) em nenhum breakpoint.
- RR3: O menu hamburger deve ativar em ≤ 992px (atualmente ≤ 768px é insuficiente para 7 nav items).
- RR4: O chat widget deve ser acessível sem rolagem horizontal em qualquer viewport ≥ 320px.
- RR5: Todos os touch targets (botões, links, toggles) devem ter dimensão mínima de 44x44px.
- RR6: Fontes de título devem usar `clamp()` para escalamento fluido.
- RR7: O modal CV Generator deve ocupar tela cheia (fullscreen) em ≤ 576px.
- RR8: Imagens de projeto devem usar proporção fluida (`aspect-ratio` ou `max-height`) em vez de `height` fixo.

---

## 4. Épicos e Histórias

### Epic 7: Correção de Responsividade Mobile

**Objetivo:** Eliminar todos os problemas de overflow horizontal, layout quebrado e elementos inacessíveis em dispositivos móveis, garantindo conformidade com Core Web Vitals e WCAG 2.1 AA.

---

### Story 7.1: Empilhamento de Seções em Mobile
**Status:** To Do 📋

Como visitante acessando pelo celular,
Eu quero que as seções "Sobre Mim" (texto + chart + trajetória), "Skills" e "Projetos" empilhem verticalmente,
Para que eu consiga ler todo o conteúdo sem precisar arrastar a tela para os lados.

**Acceptance Criteria:**
- AC1: Em ≤ 768px, `.about-grid` deve usar `grid-template-columns: 1fr`.
- AC2: Em ≤ 768px, `.skills-content` deve usar `grid-template-columns: 1fr` (override do `minmax(300px)`).
- AC3: Em ≤ 768px, `.projects-grid` deve usar `grid-template-columns: 1fr` (subir de 576px).
- AC4: `.chart-container` deve usar altura fluida em mobile (`height: auto; min-height: 250px`).
- AC5: `.github-stats` deve centralizar e adicionar `gap: 15px` em mobile.
- AC6: Zero horizontal scroll em viewports de 320px a 768px.

**Tarefas Técnicas:**
- [ ] Adicionar media query `@media (max-width: 768px)` para `.about-grid { grid-template-columns: 1fr; }`
- [ ] Alterar `.skills-content` minmax para `minmax(min(300px, 100%), 1fr)` ou override em 768px
- [ ] Mover `.projects-grid` 1fr breakpoint de 576px para 768px
- [ ] Ajustar `.chart-container` e `.project-image` para height fluido
- [ ] Testar com DevTools em 320px, 375px, 414px, 768px

---

### Story 7.2: Correção de Navegação e Chat em Mobile
**Status:** To Do 📋

Como visitante mobile,
Eu quero que o menu hamburger e o widget de chat sejam totalmente acessíveis sem rolagem lateral,
Para navegar e interagir com o chatbot sem frustrações.

**Acceptance Criteria:**
- AC1: O breakpoint do menu burger deve subir de `768px` para `992px`.
- AC2: O chat container deve caber na viewport em qualquer device ≥ 320px, sem `max-width` travado.
- AC3: O FAB (chat toggle) deve ter z-index seguro e não sobrepor o menu aberto.
- AC4: O modal CV Generator deve ser fullscreen em ≤ 576px (border-radius: 0, width: 100%, height: 100%).
- AC5: Touch targets devem ser ≥ 44x44px.

**Tarefas Técnicas:**
- [ ] Mover todas as regras de burger/nav do `@media 768px` para `@media 992px`
- [ ] No `@media 576px` do chat, remover `max-width: 350px` e usar `width: calc(100vw - 20px)`
- [ ] Adicionar media query mobile para `.modal-content { width: 100%; height: 100vh; border-radius: 0; max-width: 100%; }`
- [ ] Adicionar `.modal-body { max-height: calc(100vh - 80px); }` global
- [ ] Verificar touch targets com Lighthouse

---

### Story 7.3: Tipografia Fluida e Otimizações de UX/SEO
**Status:** To Do 📋

Como proprietário do portfólio,
Eu quero que tipografia, imagens e meta dados sejam otimizados para mobile-first indexing,
Para melhorar meu ranqueamento no Google e a experiência em qualquer dispositivo.

**Acceptance Criteria:**
- AC1: Títulos (`h1`, `h2`) devem usar `font-size: clamp(...)` para escalamento fluido sem breakpoints rígidos.
- AC2: `.logo` font-size deve reduzir em tablets (`1.4rem` em ≤ 992px).
- AC3: Imagens de projeto devem incluir `loading="lazy"` e dimensões explícitas (`width`, `height`).
- AC4: Font Inter deve ter `font-display: swap` para evitar FOIT.
- AC5: Sections devem ter padding reduzido em mobile (`padding: 60px 0` → `40px 0`).

**Tarefas Técnicas:**
- [ ] Substituir `font-size: 3.5rem` por `clamp(2rem, 5vw, 3.5rem)` no `.hero-text h1`
- [ ] Substituir `font-size: 1.8rem` por `clamp(1.2rem, 3vw, 1.8rem)` no `.hero-text h2`  
- [ ] Adicionar `font-display: swap` no `@import` ou `<link>` do Google Fonts
- [ ] Adicionar `loading="lazy"` e `width/height` nas `<img>` do HTML
- [ ] Reduzir section padding em `@media ≤ 768px`
- [ ] Verificar presença do `<meta name="viewport">` no `<head>`

---

*— Uma, desenhando com empatia 💝*
