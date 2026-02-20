# Portfólio de AI Automation Engineer - Julio Cesar Okuda

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJcnok%2Fportfolio)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-juliookuda-blue)](https://linkedin.com/in/juliookuda)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 📋 Índice

- [Portfólio de AI Automation Engineer - Julio Cesar Okuda](#portfólio-de-ai-automation-engineer---julio-cesar-okuda)
  - [📋 Índice](#-índice)
  - [📊 Visão Geral](#-visão-geral)
  - [🚀 Tecnologias Utilizadas](#-tecnologias-utilizadas)
  - [🔍 Funcionalidades](#-funcionalidades)
  - [🏗️ Arquitetura do Projeto](#️-arquitetura-do-projeto)
  - [🛠️ Estrutura do Projeto](#️-estrutura-do-projeto)
  - [📋 Pré-requisitos](#-pré-requisitos)
  - [🚀 Como Executar Localmente](#-como-executar-localmente)
    - [Pré-requisitos](#pré-requisitos)
    - [Passo a Passo](#passo-a-passo)
  - [📱 Responsividade](#-responsividade)
  - [☁️ Deploy na Vercel (Recomendado)](#️-deploy-na-vercel-recomendado)
  - [🧩 Padrões de Projeto Aplicados](#-padrões-de-projeto-aplicados)
  - [📝 Boas Práticas Implementadas](#-boas-práticas-implementadas)
  - [🔍 SEO e Acessibilidade](#-seo-e-acessibilidade)
  - [🔮 Próximos Passos](#-próximos-passos)
  - [📞 Contato](#-contato)
  - [📄 Licença](#-licença)

## 📊 Visão Geral

Portfólio profissional focado em **Automação com IA Generativa, Agentes Autônomos (MCP) e Engenharia de Dados**.

## 🚀 Tecnologias Utilizadas

- **Front-end**: HTML5, CSS3, JavaScript (Vanilla)
- **Visualização**: Chart.js
- **IA Integration**: Google Gemini API (via Vercel Serverless Functions)
- **Hospedagem**: Vercel (CI/CD Automático)

## 🔍 Funcionalidades

- **Design Moderno**: Interface limpa e contemporânea com animações sutis
- **Modo Escuro/Claro**: Alternância de tema com persistência de preferência do usuário
- **Seção Sobre**: Informações profissionais, acadêmicas e estatísticas do GitHub
- **Habilidades**: Visualização interativa de competências técnicas com gráfico radar
- **Projetos**: Galeria de projetos com filtros por categoria (Análise de Dados, Machine Learning, Cloud)
- **Certificações**: Exibição de certificações profissionais com logos e descrições
- **Contato**: Formulário para mensagens e links para redes sociais
- **Responsivo**: Adaptado para todos os tamanhos de tela (mobile, tablet, desktop)
- **Animações**: Elementos animados ao scroll para melhor engajamento
- **Acessibilidade**: Implementação de práticas de acessibilidade para inclusão

## 🏗️ Arquitetura do Projeto

```mermaid title="Arquitetura do Projeto" type="diagram"
graph TD;
    A["index.html"]-->B["assets/css/styles.css"]
    A-->C["assets/js/main.js"]
    A-->D["assets/js/theme-toggle.js"]
    A-->E["assets/js/projects.js"]
    A-->F["assets/js/skills-chart.js"]
    G["Componentes"]-->H["Header & Navigation"]
    G-->I["Hero Section"]
    G-->J["About Section"]
    G-->K["Skills Section"]
    G-->L["Projects Section"]
    G-->M["Certifications Section"]
    G-->N["Contact Section"]
    G-->O["Footer"]
    P["Funcionalidades JS"]-->Q["Theme Toggle"]
    P-->R["Project Filtering"]
    P-->S["Skills Chart"]
    P-->T["Mobile Navigation"]
    P-->U["Form Handling"]
    P-->V["Smooth Scrolling"]
```

O projeto segue uma arquitetura modular, com separação clara entre:

1. **Estrutura (HTML)**: Organização semântica do conteúdo
2. **Apresentação (CSS)**: Estilização e responsividade
3. **Comportamento (JS)**: Interatividade e funcionalidades dinâmicas

Cada módulo JavaScript é responsável por uma funcionalidade específica, seguindo o princípio de responsabilidade única.

## 🛠️ Estrutura do Projeto

```
portfolio/
├── assets/
│   ├── css/
│   │   └── styles.css              # Estilos principais
│   ├── js/
│   │   ├── main.js                 # Funcionalidades principais
│   │   ├── theme-toggle.js         # Alternância de tema
│   │   ├── projects.js             # Gerenciamento de projetos
│   │   └── skills-chart.js         # Gráfico de habilidades
│   └── images/
│       ├── badges/                 # Imagens de certificações
│       │   ├── aws-certified-cloud-practitioner-badge.png
│       │   ├── microsoft-certified-associate-badge.png
│       │   └── microsoft-certified-fundamentals-badge.png
│       ├── icons/
│       │   └── favicon.ico
│       ├── profile/
│       │   └── profile.jpg
│       └── projects/               # Imagens dos projetos
│           ├── data-analysis.png
│           ├── machine-learning.png
│           ├── cloud-computing.png
│           ├── dashboard.png
│           ├── deep-learning.png
│           └── azure.png
├── index.html                      # Página principal
├── 404.html                        # Página de erro
└── README.md                       # Documentação
```

## 📋 Pré-requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexão com internet para carregar fontes e ícones

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js instalado
- Chave de API do Google Gemini (para o chat)

### Passo a Passo

1. Clone o repositório:
   ```bash
   git clone https://github.com/Jcnok/portfolio.git
   cd portfolio
   ```

2. Instale a Vercel CLI (Opcional, para testar a API localmente):
   ```bash
   npm i -g vercel
   ```

3. Configure as Variáveis de Ambiente. Crie um arquivo `.env` na raiz:
   ```
   GEMINI_API_KEY=sua_chave_aqui
   ```

4. Execute o projeto:
   ```bash
   vercel dev
   ```
   Ou apenas o front-end:
   ```bash
   npx serve .
   ```

## 📱 Responsividade

O site é totalmente responsivo e otimizado para:

- **Desktops** (1200px+)
- **Laptops** (992px - 1199px)
- **Tablets** (768px - 991px)
- **Smartphones** (320px - 767px)

A responsividade é implementada usando:
- Media queries
- Unidades relativas (rem, %, vh/vw)
- Flexbox e Grid para layouts adaptáveis
- Imagens responsivas

## ☁️ Deploy (Vercel)

Este projeto **requer** a Vercel (ou host similar com suporte a Node.js Serverless Functions) para que o Chat com IA funcione. O GitHub Pages suporta apenas sites estáticos e não executará a API.

1. Crie uma conta na [Vercel](https://vercel.com).
2. Importe este repositório.
3. Nas configurações do projeto (Environment Variables), adicione:
   - `GEMINI_API_KEY`: Sua chave da API do Google Gemini.
4. O deploy será feito automaticamente.

## 🧩 Padrões de Projeto Aplicados

- **Module Pattern**: Encapsulamento de funcionalidades em módulos JavaScript
- **Namespace Pattern**: Evita poluição do escopo global
- **Revealing Module Pattern**: Expõe apenas as funcionalidades necessárias
- **Observer Pattern**: Para eventos e comunicação entre componentes
- **Factory Pattern**: Criação de elementos DOM
- **Singleton Pattern**: Instâncias únicas para gerenciadores (ex: ThemeManager)

## 📝 Boas Práticas Implementadas

- **Código Limpo**: Nomes descritivos, funções pequenas, comentários úteis
- **Semântica HTML**: Uso apropriado de tags semânticas (header, nav, section, etc.)
- **CSS Modular**: Variáveis CSS para temas e reutilização
- **JavaScript Modular**: Separação de responsabilidades
- **Performance**: Otimização de imagens, carregamento eficiente
- **Versionamento**: Controle de versão com Git
- **Documentação**: Comentários de código e README detalhado

## 🔍 SEO e Acessibilidade

- **Meta Tags**: Descrição, palavras-chave, autor
- **Semântica**: Estrutura HTML semântica para melhor indexação
- **Acessibilidade**: Atributos ARIA, contraste adequado, navegação por teclado
- **Performance**: Otimização para melhor ranqueamento
- **Responsividade**: Adaptação para todos os dispositivos

## 🔮 Próximos Passos

- [ ] Implementar PWA (Progressive Web App)
- [ ] Adicionar blog com artigos técnicos
- [ ] Integrar Google Analytics
- [ ] Implementar internacionalização (i18n)
- [ ] Adicionar mais projetos e categorias
- [ ] Melhorar acessibilidade (WCAG 2.1 AA)
- [ ] Otimizar performance (Core Web Vitals)
- [ ] Adicionar testes automatizados

## 📞 Contato

- **GitHub**: [Jcnok](https://github.com/Jcnok)
- **LinkedIn**: [juliookuda](https://linkedin.com/in/juliookuda)
- **Email**: julio.okuda@gmail.com
- **Website**: [seu-app.vercel.app](https://seu-app.vercel.app/)

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido com ❤️ por Julio Cesar Okuda com IA v0
