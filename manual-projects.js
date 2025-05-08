// Este arquivo pode ser usado como alternativa se a API do GitHub continuar falhando
document.addEventListener("DOMContentLoaded", () => {
  const projectsGrid = document.querySelector(".projects-grid")

  if (projectsGrid) {
    // Carregar projetos manualmente
    projectsGrid.innerHTML = `
      <!-- Projeto 1 -->
      <div class="project-card data-analysis">
        <div class="project-image">
          <img src="https://source.unsplash.com/300x200/?data,analysis" alt="Análise de Dados COVID-19">
        </div>
        <div class="project-info">
          <h3>Análise de Dados COVID-19</h3>
          <p>Análise exploratória de dados sobre a pandemia de COVID-19 utilizando Python, Pandas e Matplotlib.</p>
          <div class="project-tags">
            <span class="project-tag">Análise de Dados</span>
            <span class="project-tag">Python</span>
          </div>
          <div class="project-links">
            <a href="https://github.com/Jcnok/covid19-analysis" target="_blank">Ver Código <i class="fas fa-code"></i></a>
            <a href="https://github.com/Jcnok/covid19-analysis" target="_blank">Demo <i class="fas fa-external-link-alt"></i></a>
          </div>
        </div>
      </div>
      
      <!-- Projeto 2 -->
      <div class="project-card machine-learning">
        <div class="project-image">
          <img src="https://source.unsplash.com/300x200/?machine,learning" alt="Previsão de Preços de Imóveis">
        </div>
        <div class="project-info">
          <h3>Previsão de Preços de Imóveis</h3>
          <p>Modelo de machine learning para prever preços de imóveis com base em características como localização, tamanho e amenidades.</p>
          <div class="project-tags">
            <span class="project-tag">Machine Learning</span>
            <span class="project-tag">Python</span>
          </div>
          <div class="project-links">
            <a href="https://github.com/Jcnok/house-price-prediction" target="_blank">Ver Código <i class="fas fa-code"></i></a>
            <a href="https://github.com/Jcnok/house-price-prediction" target="_blank">Demo <i class="fas fa-external-link-alt"></i></a>
          </div>
        </div>
      </div>
      
      <!-- Projeto 3 -->
      <div class="project-card cloud">
        <div class="project-image">
          <img src="https://source.unsplash.com/300x200/?cloud,computing" alt="Aplicação Serverless AWS">
        </div>
        <div class="project-info">
          <h3>Aplicação Serverless AWS</h3>
          <p>Implementação de uma aplicação serverless utilizando AWS Lambda, API Gateway e DynamoDB.</p>
          <div class="project-tags">
            <span class="project-tag">Cloud Computing</span>
            <span class="project-tag">AWS</span>
          </div>
          <div class="project-links">
            <a href="https://github.com/Jcnok/aws-serverless-app" target="_blank">Ver Código <i class="fas fa-code"></i></a>
            <a href="https://github.com  target="_blank">Ver Código <i class="fas fa-code"></i></a>
            <a href="https://github.com/Jcnok/aws-serverless-app" target="_blank">Demo <i class="fas fa-external-link-alt"></i></a>
          </div>
        </div>
      </div>
      
      <!-- Projeto 4 -->
      <div class="project-card data-analysis">
        <div class="project-image">
          <img src="https://source.unsplash.com/300x200/?dashboard,data" alt="Dashboard de Vendas">
        </div>
        <div class="project-info">
          <h3>Dashboard de Vendas</h3>
          <p>Dashboard interativo para análise de dados de vendas utilizando Power BI e SQL Server.</p>
          <div class="project-tags">
            <span class="project-tag">Análise de Dados</span>
            <span class="project-tag">Power BI</span>
          </div>
          <div class="project-links">
            <a href="https://github.com/Jcnok/sales-dashboard" target="_blank">Ver Código <i class="fas fa-code"></i></a>
            <a href="https://github.com/Jcnok/sales-dashboard" target="_blank">Demo <i class="fas fa-external-link-alt"></i></a>
          </div>
        </div>
      </div>
      
      <!-- Projeto 5 -->
      <div class="project-card machine-learning">
        <div class="project-image">
          <img src="https://source.unsplash.com/300x200/?neural,network" alt="Classificação de Imagens">
        </div>
        <div class="project-info">
          <h3>Classificação de Imagens</h3>
          <p>Sistema de classificação de imagens utilizando redes neurais convolucionais com TensorFlow e Keras.</p>
          <div class="project-tags">
            <span class="project-tag">Machine Learning</span>
            <span class="project-tag">Deep Learning</span>
          </div>
          <div class="project-links">
            <a href="https://github.com/Jcnok/image-classification" target="_blank">Ver Código <i class="fas fa-code"></i></a>
            <a href="https://github.com/Jcnok/image-classification" target="_blank">Demo <i class="fas fa-external-link-alt"></i></a>
          </div>
        </div>
      </div>
      
      <!-- Projeto 6 -->
      <div class="project-card cloud">
        <div class="project-image">
          <img src="https://source.unsplash.com/300x200/?azure,cloud" alt="Pipeline de Dados Azure">
        </div>
        <div class="project-info">
          <h3>Pipeline de Dados Azure</h3>
          <p>Implementação de um pipeline de dados utilizando Azure Data Factory, Azure Databricks e Azure SQL Database.</p>
          <div class="project-tags">
            <span class="project-tag">Cloud Computing</span>
            <span class="project-tag">Azure</span>
          </div>
          <div class="project-links">
            <a href="https://github.com/Jcnok/azure-data-pipeline" target="_blank">Ver Código <i class="fas fa-code"></i></a>
            <a href="https://github.com/Jcnok/azure-data-pipeline" target="_blank">Demo <i class="fas fa-external-link-alt"></i></a>
          </div>
        </div>
      </div>
    `

    // Configurar filtros de projeto
    const filterButtons = document.querySelectorAll(".filter-btn")

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"))

        // Add active class to clicked button
        button.classList.add("active")

        // Get filter value
        const filter = button.getAttribute("data-filter")

        // Filter projects
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
      })
    })
  }
})
