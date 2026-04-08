// Gerenciador de projetos do portfólio
class ProjectManager {
  constructor() {
    this.projectsGrid = document.querySelector('.projects-grid');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    // this.projects será preenchido após o fetch
    this.projects = [];
    this.init(); // inicia o fluxo assíncrono
  }

  /** Inicializa o gerenciador de projetos */
  async init() {
    if (!this.projectsGrid) {
      console.error('Container de projetos não encontrado');
      return;
    }

    // Exibir estado de loading
    this.projectsGrid.innerHTML = `
      <div class="loading-message">Carregando projetos...</div>
    `;

    try {
      const response = await fetch('assets/data/projects.json');
      if (!response.ok) {
        throw new Error(`Erro ao carregar projetos (status ${response.status})`);
      }
      this.projects = await response.json();

      // Limpar mensagem de loading e renderizar projetos
      this.loadProjects();
      this.setupFilters();
    } catch (error) {
      console.error('Falha ao buscar projetos:', error);
      this.projectsGrid.innerHTML = `
        <p class="error-message">
          Não foi possível carregar os projetos. Por favor, tente novamente mais tarde.
        </p>
      `;
    }
  }

  /** Carrega os projetos no grid */
  loadProjects() {
    // Limpar grid (remove a mensagem de loading ou erro)
    this.projectsGrid.innerHTML = '';

    // Adicionar projetos
    this.projects.forEach((project, index) => {
      const projectCard = this.createProjectCard(project, index);
      this.projectsGrid.appendChild(projectCard);
    });
  }

  /** Cria um card de projeto */
  createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = `project-card ${project.category} animate-on-scroll`;
    card.style.opacity = '0';
    card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;

    card.innerHTML = `
      <div class="project-image">
        <img src="${project.image}" alt="${project.title}" loading="lazy" />
        <div class="ai-tooltip">
          <i class="fas fa-robot"></i>
          <strong>AI Analysis:</strong>
          <p>${project.resume}</p>
        </div>
      </div>
      <div class="project-info">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description line-clamp-2">${project.description}</p>
        <div class="project-tags">
          ${project.tags
        .map(tag => `<span class="project-tag">${tag}</span>`)
        .join('')}
        </div>
        <div class="project-links">
          <a href="${project.codeUrl}" target="_blank" rel="noopener noreferrer" class="project-link">
            <i class="fab fa-github"></i> Código
          </a>
          <a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="project-link">
            <i class="fas fa-external-link-alt"></i> Demo
          </a>
        </div>
      </div>
    `;

    return card;
  }

  /** Configura os filtros de projeto */
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

  /** Filtra projetos por categoria */
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

  /** Atualiza o filtro ativo */
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

// Exportação condicional para testes (Jest/Node.js).
// No browser, `module` é undefined, então este bloco é ignorado.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProjectManager };
}
