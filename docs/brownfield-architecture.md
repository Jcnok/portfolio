# Portfolio Brownfield Architecture Document

## Introduction
This document captures the CURRENT STATE of the Julio Cesar Okuda Portfolio codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents (focusing on `@dev`, `@architect`, and `@qa`) working on enhancements such as code modularization, automated tests, and adding new data science case studies.

### Document Scope
Comprehensive documentation of the entire system as an active prospecting tool for Data Science and Data Engineering roles.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-18 | 1.0 | Initial brownfield analysis | @analyst |

---

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System
- **Main Entry (HTML)**: `index.html` - The single-page portfolio layout, including dynamic template rendering anchors.
- **Main Entry (JS)**: `assets/js/main.js` - Contains the `Portfolio` namespace handling navigation, smooth scrolling, and form submission.
- **Gemini API Chat**: `api/chat.js` - Vercel Serverless Function that proxies calls to the Google Gemini API (gemini-1.5-flash-latest).
- **Chat UI Logic**: `assets/js/chat.js` - Client-side logic for the chat widget interacting with `/api/chat`.
- **Dynamic Projects**: `assets/js/projects.js` - Contains the `ProjectManager` class handling project rendering and filtering.
- **Dynamic Skills Chart**: `assets/js/skills-chart.js` - IIFE managing Chart.js radar chart rendering and fetching dynamic data.

---

## High Level Architecture

### Technical Summary
The application is a Vanilla Web Application relying on Vercel Serverless Functions for backend capabilities (AI chat). It heavily manipulates the DOM directly and uses basic CSS vars for theming.

### Actual Tech Stack
| Category | Technology | Version | Notes |
|----------|------------|---------|--------|
| Runtime / Serverless | Node.js (Vercel) | - | Vercel Serverless Functions (`/api/*`) |
| Frontend Core | HTML5, CSS3, JS Vanilla | ES6+ | No frontend framework (React/Vue). DOM manipulation is manual. |
| Icons | Font Awesome | 6.4.0 (CDN) | - |
| Data Viz | Chart.js | Latest (CDN) | Used in `skills-chart.js` for radar charts. |
| AI Integration | Google Gemini API | 1.5-flash | Proxied via `api/chat.js` to protect `GEMINI_API_KEY`. |
| Hosting / CI/CD | Vercel | - | Auto-deploys via GitHub. |

### Repository Structure Reality Check
- **Type**: Monolith (Single Page Application structure)
- **Package Manager**: None (Vanilla JS front-end without bundlers like Webpack/Vite in the root workspace; Vercel handles the `/api` directory natively).
- **Notable**: Heavy reliance on CDN links in `index.html`. Modules are loaded as standard scripts without `type="module"`, meaning scope pollution is managed via manual Namespaces/IIFEs.

---

## Source Tree and Module Organization

### Project Structure (Actual)
```text
portfolio/
├── api/
│   └── chat.js                 # Vercel Serverless Function for Gemini
├── assets/
│   ├── css/
│   │   └── styles.css          # Main stylesheet including theme variables
│   ├── data/
│   │   ├── experience.json     # Dynamic load data (referenced in main.js)
│   │   └── languages.json      # Dynamic load data (referenced in skills-chart.js)
│   ├── images/                 # Static assets (badges, icons, profile, projects)
│   └── js/
│       ├── chat.js             # Chat widget UI logic
│       ├── main.js             # General UI (nav, scroll, form)
│       ├── projects.js         # Project grid and filtering logic
│       ├── skills-chart.js     # Chart.js radar chart logic
│       └── theme-toggle.js     # Dark/Light mode logic
├── .env.example
├── index.html                  # Main entry point SPA
└── README.md
```

### Key Modules and Their Purpose
- **`Portfolio` (main.js)**: A namespace object initializing mobile navigation, scroll animations, the contact form overlay, and dynamically loading experience data from `assets/data/experience.json`.
- **`ProjectManager` (projects.js)**: A class managing a hardcoded array of `projects`. It handles DOM injection into `.projects-grid` and the category filtering (`.filter-btn`).
- **`initSkillsChart` (skills-chart.js)**: An async IIFE that fetches `assets/data/languages.json`, builds a Chart.js radar chart, and handles theme switching for the chart canvas.
- **`chat.js` (frontend)**: Handles the floating chat widget UI, DOM injection for messages, and HTTP POST to `/api/chat`.

---

## Technical Debt and Known Issues

### Critical Technical Debt
1. **Hardcoded Data in JS**: The `projects` array is completely hardcoded inside `assets/js/projects.js`, violating separation of concerns (data vs logic). This should be moved to a JSON fetch similar to `experience.json`.
2. **Missing Build Step / Bundler**: Scripts are loaded globally in `index.html`. While IIFEs and Classes are used to limit scope pollution, dependency management is fragile.
3. **Missing Automated Tests**: There are zero tests (no Jest, Cypress, or Playwright). UI interactions and API responses are untested.
4. **Vercel API Error Handling**: `api/chat.js` has basic try/catch but lacks rate limiting or advanced error parsing from the Gemini API.
5. **Chart.js Fallback**: In `skills-chart.js`, if the fetch to `languages.json` fails, it falls back to hardcoded arrays.

### Workarounds and Gotchas
- **Theme Toggle Synchronization**: The `skills-chart.js` file relies on a `setTimeout(..., 100)` to wait for `theme-toggle.js` to change the `data-theme` attribute before updating the chart colors. This is a fragile race condition workaround.
- **No JS Modules (`type="module"`)**: The scripts share global objects instead of using ES6 `import`/`export`. E.g., `Chart` is expected to be loaded globally via the CDN before `skills-chart.js` runs.
- **Local Dev vs Vercel**: Using `api/chat.js` requires the project to be run via `vercel dev` locally, otherwise the `/api/chat` route will 404 on standard standard static servers (like Live Server).

---

## Integration Points and External Dependencies

### External Services
| Service | Purpose | Integration Type | Key Files |
|---------|---------|------------------|-----------|
| Google Gemini API | AI Chat Assistant | REST API | `api/chat.js` |
| Chart.js | Radar Data Viz | CDN Script | `index.html`, `assets/js/skills-chart.js` |
| Font Awesome | UI Icons | CDN Stylesheet | `index.html` |

### Internal Integration Points
- **Frontend to Serverless**: `assets/js/chat.js` calls `POST /api/chat` using native fetch.
- **JSON Data Fetching**: `main.js` fetches `assets/data/experience.json`. `skills-chart.js` fetches `assets/data/languages.json`.

---

## Development and Deployment

### Local Development Setup
1. Define env vars: Create `.env` containing `GEMINI_API_KEY=your_key`
2. Run via Vercel CLI to support serverless functions:
   ```bash
   npm i -g vercel
   vercel dev
   ```

### Build and Deployment Process
- **Build Command**: None. Static files + Vercel Functions.
- **Deployment**: Automatic upon git push to `main` branch via Vercel CI/CD.

## Testing Reality
### Current Test Coverage
- **Unit Tests**: 0%
- **Integration Tests**: 0%
- **E2E Tests**: 0%
- **Manual Testing**: Sole verification method.

---

## Enhancement Impact Analysis (For AI Agents)

**Expected Future AI Agent Tasks:**
- Modularization
- New cases of study (Projects)
- Adding automated tests

### Files That Will Need Modification
- `assets/js/projects.js`: To decouple the hardcoded data into a JSON fetch.
- `assets/js/skills-chart.js`: To fix the race condition in the theme toggle listener.
- `index.html`: To potentially switch scripts to `type="module"` if modularization is pursued, or to add test hooks.

### New Files/Modules Needed
- `assets/data/projects.json`: Target file for decoupled project data.
- **Testing Directory**: E.g., `tests/` or `cypress/` to fulfill the automated testing goals. Jest/Playwright setup config files (`package.json`, `jest.config.js`).

### Integration Considerations
- Introducing tests and bundlers will change the project from a pure static vanilla structure to a Node.js-based frontend workflow (adding `package.json`, build scripts, etc.).
- The `vercel dev` environment requirement means any End-to-End testing (like Playwright) must be able to boot, or mock, the Vercel API routes.
