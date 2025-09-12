/**
 * Projects Module
 * Gerencia a exibição e filtragem de projetos
 * @author Julio Cesar Okuda
 * @version 1.0.0
 */
// IIFE para evitar poluição do escopo global
;(() => {
  /**
   * Classe ProjectManager para gerenciar os projetos do portfólio
   */
  class ProjectManager {
    constructor() {
      this.projectsGrid = document.getElementById("projects-grid")
      this.filterButtons = document.querySelectorAll(".filter-btn")
      // Dados dos projetos reais
      this.projects = [
        {
          id: 1,
          title: "Sistema CRM Completo",
          description:
            "Pipeline de dados completo para um CRM de vendas, utilizando Python, SQL, dbt, Gemini e Langchain para automação e análise de dados.",
          image: "assets/images/projects/dashboard.png",
          category: "data-analysis",
          tags: ["Python", "SQL", "dbt", "Langchain"],
          codeUrl: "https://github.com/Jcnok/crm-system",
          demoUrl: "https://github.com/Jcnok/crm-system",
        },
        {
          id: 2,
          title: "Desafio Langflow - LLM Workflow",
          description:
            "Implementação de workflows avançados com Langflow para processamento de linguagem natural e automação de tarefas com LLMs.",
          image: "assets/images/projects/deep-learning.png",
          category: "machine-learning",
          tags: ["Langflow", "LLM", "NLP", "Python"],
          codeUrl: "https://github.com/Jcnok/Desafio-Langflow",
          demoUrl: "https://github.com/Jcnok/Desafio-Langflow",
        },
        {
          id: 3,
          title: "ROI Calculator - Microsoft Innovation Challenge",
          description:
            "Calculadora de ROI desenvolvida para o hackathon da Microsoft Innovation Challenge 2025, focando em análise de retorno sobre investimento.",
          image: "assets/images/projects/data-analysis.png",
          category: "data-analysis",
          tags: ["Python", "Analytics", "ROI", "Microsoft"],
          codeUrl: "https://github.com/Jcnok/MicrosoftInnovationChallange25--ROI-Calculator",
          demoUrl: "https://github.com/Jcnok/MicrosoftInnovationChallange25--ROI-Calculator",
        },
        {
          id: 4,
          title: "Análise de Churn - Stack Labs",
          description:
            "Projeto desenvolvido no Stack Labs para análise e predição de churn de clientes utilizando técnicas avançadas de machine learning.",
          image: "assets/images/projects/machine-learning.png",
          category: "machine-learning",
          tags: ["Machine Learning", "Churn Analysis", "HTML", "Stack Labs"],
          codeUrl: "https://github.com/Jcnok/Stack_Labs_Churn",
          demoUrl: "https://github.com/Jcnok/Stack_Labs_Churn",
        },
        {
          id: 5,
          title: "CRM Skynet Provider - FastAPI",
          description:
            "Sistema CRM completo para provedor de internet usando SQLite, FastAPI e interface moderna para gestão de clientes e serviços.",
          image: "assets/images/projects/cloud-computing.png",
          category: "cloud",
          tags: ["FastAPI", "SQLite", "CRM", "Python"],
          codeUrl: "https://github.com/Jcnok/CRM-Skynet-Provider-SQLite_FastAPI",
          demoUrl: "https://github.com/Jcnok/CRM-Skynet-Provider-SQLite_FastAPI",
        },
        {
          id: 6,
          title: "Portfólio Profissional",
          description:
            "Site portfólio responsivo desenvolvido com HTML5, CSS3 e JavaScript vanilla, apresentando projetos e habilidades em data science.",
          image: "assets/images/projects/default-project.png",
          category: "web-development",
          tags: ["HTML", "CSS", "JavaScript", "Portfólio"],
          codeUrl: "https://github.com/Jcnok/portfolio",
          demoUrl: "https://jcnok.github.io/portfolio/",
        },
      ]
      this.init()
    }
    /**
     * Inicializa o gerenciador de projetos
     */
    init() {
      if (!this.projectsGrid) {
        console.error("Container de projetos não encontrado")
        return
      }
      this.loadProjects()
      this.setupFilters()
    }
    /**
     * Carrega os projetos no grid
     */
    loadProjects() {
      // Limpar grid
      this.projectsGrid.innerHTML = ""
      // Adicionar projetos
      this.projects.forEach((project, index) => {
        const projectCard = this.createProjectCard(project, index)
        this.projectsGrid.appendChild(projectCard)
      })
    }
    /**
     * Cria um card de projeto
     * @param {Object} project - Dados do projeto
     * @param {number} index - Índice para animação
     * @returns {HTMLElement} - Elemento do card
     */
    createProjectCard(project, index) {
      const card = document.createElement("div")
      card.className = `project-card ${project.category} animate-on-scroll`
      card.style.opacity = "0"
      card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`
      card.innerHTML = `
        <div class="project-image">
          <img src="${project.image}" alt="${project.title}"/>
        </div>
        <div class="project-info">
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="project-tags">
            ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("")}
          </div>
          <div class="project-links">
            <a href="${project.codeUrl}" rel="noopener noreferrer" target="_blank">Ver Código <i class="fas fa-code"></i></a>
            <a href="${project.demoUrl}" rel="noopener noreferrer" target="_blank">Demo <i class="fas fa-external-link-alt"></i></a>
          </div>
        </div>
      `
      return card
    }
    /**
     * Configura os filtros de projetos
     */
    setupFilters() {
      if (!this.filterButtons.length) {
        console.error("Botões de filtro não encontrados")
        return
      }
      this.filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
          // Remover classe ativa de todos os botões
          this.filterButtons.forEach((btn) => btn.classList.remove("active"))
          // Adicionar classe ativa ao botão clicado
          button.classList.add("active")
          // Obter valor do filtro
          const filter = button.getAttribute("data-filter")
          // Filtrar projetos
          this.filterProjects(filter)
        })
      })
    }
    /**
     * Filtra os projetos com base na categoria
     * @param {string} filter - Categoria para filtrar
     */
    filterProjects(filter) {
      const projects = document.querySelectorAll(".project-card")
      projects.forEach((project) => {
        if (filter === "all") {
          project.style.display = "block"
        } else if (project.classList.contains(filter)) {
          project.style.display = "block"
        } else {
          project.style.display = "none"
        }
      })
    }
  }
  // Inicializar quando o DOM estiver carregado
  document.addEventListener("DOMContentLoaded", () => {
    new ProjectManager()
  })
})()
