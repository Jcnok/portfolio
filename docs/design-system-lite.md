# Design System Lite - Julio Okuda Portfolio

## 🎨 Paleta de Cores (Unified Tokens)

O projeto utiliza um sistema de cores semântico para suportar Light/Dark mode.

| Token | Light Mode | Dark Mode | Uso |
| :--- | :--- | :--- | :--- |
| `--bg-primary` | `#ffffff` | `#0f172a` | Fundo principal da página |
| `--text-primary` | `#0f172a` | `#f8fafc` | Títulos e corpo principal |
| `--accent-primary` | `#3b82f6` | `#3b82f6` | Botões, ícones e destaques |
| `--border-color` | `#e2e8f0` | `#334155` | Divisores e bordas de cards |

---

## 📐 Tipografia Fluida (Clamp System)

Implementamos tipografia responsiva sem a necessidade de múltiplos media queries para tamanhos de fonte.

### Cabeçalhos
- **H1 (Hero):** `font-size: clamp(2rem, 5vw, 3.5rem)`
- **H2 (Section Titles):** `font-size: clamp(1.5rem, 4vw, 2.5rem)`
- **H3 (Cards):** `font-size: clamp(1.2rem, 3vw, 1.5rem)`

### Corpo e UI
- **Body:** `font-size: 1rem (16px)`
- **Stats Labels:** `font-size: clamp(0.8rem, 2vw, 1rem)`

---

## 🧩 Componentes Atômicos

### Botões (`.btn`)
- **Primary:** Gradient Blue, White Text.
- **Secondary:** Transparent/White, Blue Border/Text.
- **Interaction:** `transition: all 0.3s ease`, `transform: translateY(-2px)` no hover.

### Cards (`.project-card`, `.certification-card`)
- **Radius:** `var(--border-radius-lg)` (1rem).
- **Shadow:** Suave no Light Mode, profunda (20% opacity) no Dark Mode.
- **Glassmorphism:** Aplicado nos tooltips de IA e Modais.

---

## ✨ Micro-interações e UX

### Pulse Nudge (`.pulse-active`)
Animação de "atenção" para CTAs críticos (CV Generator).
- **Trigger:** Intersection Observer (quando o usuário termina a leitura de projetos).
- **Estilo:** Escalonamento suave (1.05x) com sombra pulsante azul.

### Empty States
Exibição amigável redirecionando para "Todos" quando uma categoria de filtro está vazia.

---

## ♿ Acessibilidade (WCAG 2.1 AA)

- **Contraste:** Todas as cores de texto seguem a proporção mínima de **4.5:1**.
- **Touch Targets:** Botões e links possuem área mínima de **44x44px**.
- **Aria Labels:** Aplicado em todos os ícones e links puramente visuais.
