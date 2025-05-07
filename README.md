# Portfólio de Ciência de Dados - Julio Cesar Okuda

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Publicado-success)](https://jcnok.github.io/portfolio/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-juliookuda-blue)](https://linkedin.com/in/juliookuda)

## 📊 Visão Geral

Portfólio profissional destacando minha experiência e projetos em Ciência de Dados, Machine Learning e Cloud Computing. Este site foi desenvolvido para apresentar meu trabalho de forma interativa e acessível.

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript
- **Visualização de Dados**: Chart.js
- **Integração**: GitHub API
- **Ícones**: Font Awesome
- **Hospedagem**: GitHub Pages

## 🔍 Funcionalidades

- **Seção Sobre**: Informações profissionais e acadêmicas
- **Habilidades**: Visualização interativa de competências técnicas
- **Projetos**: Galeria dinâmica de projetos com filtros por categoria
- **Certificações**: Exibição de certificações profissionais
- **Contato**: Formulário para mensagens e links para redes sociais

## 🛠️ Estrutura do Projeto

\`\`\`
portfolio/
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── main.js
│   │   └── projects.js
│   └── images/
│       ├── badges/
│       ├── icons/
│       └── profile/
├── index.html
├── 404.html
└── README.md
\`\`\`

## 📋 Pré-requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexão com internet para carregar projetos do GitHub e imagens

## 🚀 Como Executar Localmente

1. Clone este repositório:
   \`\`\`bash
   git clone https://github.com/Jcnok/portfolio.git
   \`\`\`

2. Navegue até o diretório do projeto:
   \`\`\`bash
   cd portfolio
   \`\`\`

3. Abra o arquivo `index.html` em seu navegador

## 📱 Responsividade

O site é totalmente responsivo e otimizado para:
- Desktops
- Tablets
- Smartphones

## 🔄 Integração Contínua

Este projeto utiliza GitHub Actions para implementação contínua no GitHub Pages.

## 📞 Contato

- **GitHub**: [Jcnok](https://github.com/Jcnok)
- **LinkedIn**: [juliookuda](https://linkedin.com/in/juliookuda)
- **Email**: juliookuda@email.com

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
\`\`\`

## Estrutura de Arquivos Refatorada

```html file="index.html"
&lt;!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Portfólio de Ciência de Dados de Julio Cesar Okuda - Especialista em Data Science, Machine Learning e Cloud Computing">
  <meta name="keywords" content="ciência de dados, data science, machine learning, portfolio, python, aws, azure">
  <meta name="author" content="Julio Cesar Okuda">
  
  <title>Julio Cesar Okuda | Data Science Portfolio</title>
  
  &lt;!-- Favicon -->
  <link rel="icon" href="assets/images/icons/favicon.ico" type="image/x-icon">
  
  &lt;!-- CSS -->
  <link rel="stylesheet" href="assets/css/styles.css">
  
  &lt;!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  &lt;!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  &lt;!-- Header & Navigation -->
  <header>
    <div class="container">
      <nav>
        <div class="logo">JCO</div>
        <ul class="nav-links">
          <li><a href="#about">Sobre</a></li>
          <li><a href="#skills">Habilidades</a></li>
          <li><a href="#projects">Projetos</a></li>
          <li><a href="#certifications">Certificações</a></li>
          <li><a href="#contact">Contato</a></li>
        </ul>
        <div class="burger" aria-label="Menu de navegação">
          <div class="line1"></div>
          <div class="line2"></div>
          <div class="line3"></div>
        </div>
      </nav>
    </div>
  </header>

  &lt;!-- Hero Section -->
  <section id="hero">
    <div class="container">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Julio Cesar Okuda</h1>
          <h2>Data Scientist & Cloud Computing Specialist</h2>
          <p>Transformando dados em soluções de valor</p>
          <div class="hero-buttons">
            <a href="#projects" class="btn primary-btn">Ver Projetos</a>
            <a href="#contact" class="btn secondary-btn">Contato</a>
          </div>
        </div>
        <div class="hero-image">
          <img src="assets/images/profile/profile.png" alt="Julio Cesar Okuda" class="profile-image">
        </div>
      </div>
    </div>
  </section>

  &lt;!-- About Section -->
  <section id="about">
    <div class="container">
      <h2 class="section-title">Sobre Mim</h2>
      <div class="about-content">
        <div class="about-text">
          <p>Sou formado em Adm. de redes, com MBAs em Ciência de Dados, Projetos em Cloud Computing e Matemática Financeira e Estatística.</p>
          <p>Fascinado em tudo que envolva dados e entregue alguma solução. Apaixonado por aprendizado contínuo e análise de dados.</p>
          <p>Atualmente baseado em São Paulo, Brasil, trabalho com projetos que envolvem análise de dados, machine learning e cloud computing.</p>
          <div class="social-links">
            <a href="https://github.com/Jcnok" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>
            <a href="https://linkedin.com/in/juliookuda" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="https://dio.me/users/juliookuda" target="_blank" aria-label="DIO"><i class="fas fa-globe"></i></a>
          </div>
        </div>
        <div class="stats-container">
          <div class="github-stats">
            <h3>GitHub Stats</h3>
            <div class="stat-item">
              <span class="stat-value">53</span>
              <span class="stat-label">Repositórios</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">33</span>
              <span class="stat-label">Stars</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">63+</span>
              <span class="stat-label">Contribuições</span>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="skillsChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </section>

  &lt;!-- Skills Section -->
  <section id="skills">
    <div class="container">
      <h2 class="section-title">Habilidades & Tecnologias</h2>
      <div class="skills-content">
        <div class="skill-category">
          <h3>Cloud & DevOps</h3>
          <div class="skill-items">
            <div class="skill-item">
              <i class="fab fa-aws"></i>
              <span>AWS</span>
            </div>
            <div class="skill-item">
              <i class="fab fa-microsoft"></i>
              <span>Azure</span>
            </div>
            <div class="skill-item">
              <i class="fab fa-docker"></i>
              <span>Docker</span>
            </div>
            <div class="skill-item">
              <i class="fab fa-linux"></i>
              <span>Linux</span>
            </div>
          </div>
        </div>
        <div class="skill-category">
          <h3>Linguagens de Programação</h3>
          <div class="skill-items">
            <div class="skill-item">
              <i class="fab fa-python"></i>
              <span>Python</span>
            </div>
            <div class="skill-item">
              <i class="fas fa-database"></i>
              <span>SQL</span>
            </div>
            <div class="skill-item">
              <i class="fab fa-r-project"></i>
              <span>R</span>
            </div>
            <div class="skill-item">
              <i class="fab fa-js"></i>
              <span>JavaScript</span>
            </div>
          </div>
        </div>
        <div class="skill-category">
          <h3>Data Science & ML</h3>
          <div class="skill-items">
            <div class="skill-item">
              <i class="fas fa-brain"></i>
              <span>Machine Learning</span>
            </div>
            <div class="skill-item">
              <i class="fas fa-chart-bar"></i>
              <span>Data Visualization</span>
            </div>
            <div class="skill-item">
              <i class="fas fa-table"></i>
              <span>Pandas</span>
            </div>
            <div class="skill-item">
              <i class="fas fa-calculator"></i>
              <span>NumPy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  &lt;!-- Projects Section -->
  <section id="projects">
    <div class="container">
      <h2 class="section-title">Projetos em Destaque</h2>
      <div class="projects-filter">
        <button class="filter-btn active" data-filter="all">Todos</button>
        <button class="filter-btn" data-filter="data-analysis">Análise de Dados</button>
        <button class="filter-btn" data-filter="machine-learning">Machine Learning</button>
        <button class="filter-btn" data-filter="cloud">Cloud Computing</button>
      </div>
      <div class="projects-grid">
        &lt;!-- Os projetos serão carregados dinamicamente via JavaScript -->
        <div class="loading">Carregando projetos...</div>
      </div>
      <div class="projects-more">
        <a href="https://github.com/Jcnok?tab=repositories" class="btn primary-btn" target="_blank">Ver Todos os Projetos</a>
      </div>
    </div>
  </section>

  &lt;!-- Certifications Section -->
  <section id="certifications">
    <div class="container">
      <h2 class="section-title">Certificações</h2>
      <div class="certifications-grid">
        <div class="certification-card">
          <div class="certification-logo">
            <img src="assets/images/badges/microsoft-certified-associate-badge.png" alt="Microsoft Certified: Associate" id="microsoft-associate">
          </div>
          <div class="certification-info">
            <h3>Microsoft Certified: Associate</h3>
            <p>Microsoft</p>
          </div>
        </div>
        <div class="certification-card">
          <div class="certification-logo">
            <img src="assets/images/badges/microsoft-certified-fundamentals-badge.png" alt="Azure AI Fundamentals" id="azure-ai">
          </div>
          <div class="certification-info">
            <h3>Azure AI Fundamentals</h3>
            <p>Microsoft</p>
          </div>
        </div>
        <div class="certification-card">
          <div class="certification-logo">
            <img src="assets/images/badges/microsoft-certified-fundamentals-badge.png" alt="Azure Data Fundamentals" id="azure-data">
          </div>
          <div class="certification-info">
            <h3>Azure Data Fundamentals</h3>
            <p>Microsoft</p>
          </div>
        </div>
        <div class="certification-card">
          <div class="certification-logo">
            <img src="assets/images/badges/aws-certified-cloud-practitioner-badge.png" alt="AWS Cloud Practitioner" id="aws-practitioner">
          </div>
          <div class="certification-info">
            <h3>AWS Cloud Practitioner</h3>
            <p>Amazon Web Services</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  &lt;!-- Contact Section -->
  <section id="contact">
    <div class="container">
      <h2 class="section-title">Entre em Contato</h2>
      <div class="contact-content">
        <div class="contact-info">
          <div class="contact-item">
            <i class="fas fa-map-marker-alt"></i>
            <p>São Paulo, SP, Brasil</p>
          </div>
          <div class="contact-item">
            <i class="fas fa-envelope"></i>
            <p>juliookuda@email.com</p>
          </div>
          <div class="social-links">
            <a href="https://github.com/Jcnok" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>
            <a href="https://linkedin.com/in/juliookuda" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="https://dio.me/users/juliookuda" target="_blank" aria-label="DIO"><i class="fas fa-globe"></i></a>
          </div>
        </div>
        <div class="contact-form">
          <form id="contactForm">
            <div class="form-group">
              <label for="name">Nome</label>
              <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="message">Mensagem</label>
              <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button type="submit" class="btn primary-btn">Enviar Mensagem</button>
          </form>
        </div>
      </div>
    </div>
  </section>

  &lt;!-- Footer -->
  <footer>
    <div class="container">
      <p>&copy; 2023 Julio Cesar Okuda. Todos os direitos reservados.</p>
    </div>
  </footer>

  &lt;!-- JavaScript -->
  <script src="assets/js/main.js"></script>
  <script src="assets/js/projects.js"></script>
</body>
</html>
