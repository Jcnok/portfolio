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

      // Dados dos projetos
      this.projects = [
        {
          id: 1,
          title: "Análise de Dados COVID-19",
          description:
            "Análise exploratória de dados sobre a pandemia de COVID-19 utilizando Python, Pandas e Matplotlib.",
          image: "assets/images/projects/data-analysis.png",
          category: "data-analysis",
          tags: ["Análise de Dados", "Python"],
          codeUrl: "https://github.com/Jcnok/covid19-analysis",
          demoUrl: "https://github.com/Jcnok/covid19-analysis",
        },
        {
          id: 2,
          title: "Previsão de Preços de Imóveis",
          description:
            "Modelo de machine learning para prever preços de imóveis com base em características como localização, tamanho e amenidades.",
          image: "assets/images/projects/machine-learning.png",
          category: "machine-learning",
          tags: ["Machine Learning", "Python"],
          codeUrl: "https://github.com/Jcnok/house-price-prediction",
          demoUrl: "https://github.com/Jcnok/house-price-prediction",
        },
        {
          id: 3,
          title: "Aplicação Serverless AWS",
          description: "Implementação de uma aplicação serverless utilizando AWS Lambda, API Gateway e DynamoDB.",
          image: "assets/images/projects/cloud-computing.png",
          category: "cloud",
          tags: ["Cloud Computing", "AWS"],
          codeUrl: "https://github.com/Jcnok/aws-serverless-app",
          demoUrl: "https://github.com/Jcnok/aws-serverless-app",
        },
        {
          id: 4,
          title: "Dashboard de Vendas",
          description: "Dashboard interativo para análise de dados de vendas utilizando Power BI e SQL Server.",
          image: "assets/images/projects/dashboard.png",
          category: "data-analysis",
          tags: ["Análise de Dados", "Power BI"],
          codeUrl: "https://github.com/Jcnok/sales-dashboard",
          demoUrl: "https://github.com/Jcnok/sales-dashboard",
        },
        {
          id: 5,
          title: "Classificação de Imagens",
          description:
            "Sistema de classificação de imagens utilizando redes neurais convolucionais com TensorFlow e Keras.",
          image: "assets/images/projects/deep-learning.png",
          category: "machine-learning",
          tags: ["Machine Learning", "Deep Learning"],
          codeUrl: "https://github.com/Jcnok/image-classification",
          demoUrl: "https://github.com/Jcnok/image-classification",
        },
        {
          id: 6,
          title: "Pipeline de Dados Azure",
          description:
            "Implementação de um pipeline de dados utilizando Azure Data Factory, Azure Databricks e Azure SQL Database.",
          image: "assets/images/projects/azure.png",
          category: "cloud",
          tags: ["Cloud Computing", "Azure"],
          codeUrl: "https://github.com/Jcnok/azure-data-pipeline",
          demoUrl: "https://github.com/Jcnok/azure-data-pipeline",
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
          <img src="${project.image}" alt="${project.title}">
        </div>
        <div class="project-info">
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="project-tags">
            ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("")}
          </div>
          <div class="project-links">
            <a href="${project.codeUrl}" target="_blank" rel="noopener noreferrer">Ver Código <i class="fas fa-code"></i></a>
            <a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer">Demo <i class="fas fa-external-link-alt"></i></a>
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
