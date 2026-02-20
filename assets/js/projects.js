// Gerenciador de projetos do portfólio
class ProjectManager {
  constructor() {
    this.projectsGrid = document.querySelector('.projects-grid');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.projects = [
      {
        id: 1,
        title: 'Bootcamp Rocketseat - NLW #17 Pocket JS',
        description:
          'Aplicação completa desenvolvida durante o bootcamp da Rocketseat, utilizando tecnologias modernas de JavaScript para criação de uma pocket application.',
        image: 'assets/images/projects/nlw-pocket-js.png',
        category: 'web-development',
        tags: ['JavaScript', 'Node.js', 'Rocketseat', 'NLW'],
        codeUrl:
          'https://github.com/Jcnok/Bootcamp-Rocketseat-NLW-17-Pocket-JS',
        demoUrl:
          'https://github.com/Jcnok/Bootcamp-Rocketseat-NLW-17-Pocket-JS',
      },
      {
        id: 2,
        title: 'Bootcamp Rocketseat - NLW #17 Pocket Python',
        description:
          'Projeto desenvolvido no bootcamp da Rocketseat focado em Python, explorando as melhores práticas e ferramentas do ecossistema Python moderno.',
        image: 'assets/images/projects/nlw-pocket-python.png',
        category: 'data-analysis',
        tags: ['Python', 'Backend', 'Rocketseat', 'NLW'],
        codeUrl:
          'https://github.com/Jcnok/Bootcamp-Rocketseat-NLW-17-Pocket-Python',
        demoUrl:
          'https://github.com/Jcnok/Bootcamp-Rocketseat-NLW-17-Pocket-Python',
      },
      {
        id: 3,
        title: 'Microsoft Innovation Challenge ROI Calculator',
        description:
          'Calculadora de ROI desenvolvida para o Microsoft Innovation Challenge, permitindo análise de retorno sobre investimento com interface intuitiva e cálculos precisos.',
        image: 'assets/images/projects/microsoft-roi.png',
        category: 'data-analysis',
        tags: ['Python', 'Analytics', 'ROI', 'Microsoft'],
        codeUrl:
          'https://github.com/Jcnok/MicrosoftInnovationChallange25--ROI-Calculator',
        demoUrl:
          'https://github.com/Jcnok/MicrosoftInnovationChallange25--ROI-Calculator',
      },
      {
        id: 4,
        title: 'Análise de Churn - Stack Labs',
        description:
          'Projeto desenvolvido no Stack Labs para análise e predição de churn de clientes utilizando técnicas avançadas de machine learning.',
        image: 'assets/images/projects/stack-labs-churn.png',
        category: 'machine-learning',
        tags: ['Machine Learning', 'Churn Analysis', 'Python', 'Stack Labs'],
        codeUrl: 'https://github.com/Jcnok/Stack_Labs_Churn',
        demoUrl: 'https://github.com/Jcnok/Stack_Labs_Churn',
      },
      {
        id: 5,
        title: 'CRM Skynet Provider - FastAPI',
        description:
          'Sistema CRM completo para provedor de internet usando SQLite, FastAPI e interface moderna para gestão de clientes e serviços.',
        image: 'assets/images/projects/crm-skynet.png',
        category: 'cloud',
        tags: ['FastAPI', 'SQLite', 'CRM', 'Python'],
        codeUrl: 'https://github.com/Jcnok/CRM-Skynet-Provider-SQLite_FastAPI',
        demoUrl: 'https://github.com/Jcnok/CRM-Skynet-Provider-SQLite_FastAPI',
      },
      {
        id: 6,
        title: 'Portfólio Profissional',
        description:
          'Site portfólio responsivo desenvolvido com HTML5, CSS3 e JavaScript vanilla, apresentando projetos e habilidades em data science.',
        image: 'assets/images/projects/portfolio-professional.png',
        category: 'web-development',
        tags: ['HTML', 'CSS', 'JavaScript', 'Portfólio'],
        codeUrl: 'https://github.com/Jcnok/portfolio',
        demoUrl: 'https://jcnok.github.io/portfolio/',
      },
    ];
    this.init();
  }

  /**
   * Inicializa o gerenciador de projetos
   */
  init() {
    if (!this.projectsGrid) {
      console.error('Container de projetos não encontrado');
      return;
    }
    this.loadProjects();
    this.setupFilters();
  }

  /**
   * Carrega os projetos no grid
   */
  loadProjects() {
    // Limpar grid
    this.projectsGrid.innerHTML = '';

    // Adicionar projetos
    this.projects.forEach((project, index) => {
      const projectCard = this.createProjectCard(project, index);
      this.projectsGrid.appendChild(projectCard);
    });
  }

  /**
   * Cria um card de projeto
   * @param {Object} project - Dados do projeto
   * @param {number} index - Índice para animação
   * @returns {HTMLElement} - Elemento do card
   */
  createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = `project-card ${project.category} animate-on-scroll`;
    card.style.opacity = '0';
    card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;

    card.innerHTML = `
      <div class="project-image">
        <img src="${project.image}" alt="${project.title}" loading="lazy" />
      </div>
      <div class="project-info">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-tags">
          ${project.tags
            .map(tag => `<span class="project-tag">${tag}</span>`)
            .join('')}
        </div>
        <div class="project-links">
          <a href="${
            project.codeUrl
          }" target="_blank" rel="noopener noreferrer" class="project-link">
            <i class="fab fa-github"></i>
            Código
          </a>
          <a href="${
            project.demoUrl
          }" target="_blank" rel="noopener noreferrer" class="project-link">
            <i class="fas fa-external-link-alt"></i>
            Demo
          </a>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Configura os filtros de projeto
   */
  setupFilters() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();
        const filter = button.getAttribute('data-filter');
        this.filterProjects(filter);
        this.updateActiveFilter(button);
      });
    });
  }

  /**
   * Filtra projetos por categoria
   * @param {string} filter - Categoria do filtro
   */
  filterProjects(filter) {
    const projectCards = this.projectsGrid.querySelectorAll('.project-card');

    projectCards.forEach((card, index) => {
      const shouldShow = filter === 'all' || card.classList.contains(filter);

      if (shouldShow) {
        card.style.display = 'block';
        card.style.opacity = '0';
        card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;
      } else {
        card.style.display = 'none';
      }
    });
  }

  /**
   * Atualiza o filtro ativo
   * @param {HTMLElement} activeButton - Botão ativo
   */
  updateActiveFilter(activeButton) {
    this.filterButtons.forEach(button => {
      button.classList.remove('active');
    });
    activeButton.classList.add('active');
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new ProjectManager();
});
