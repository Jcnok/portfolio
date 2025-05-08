document.addEventListener('DOMContentLoaded', () => {
  // Fetch GitHub Repositories
  //fetchGitHubRepos()

  // Carregar projetos manualmente
  loadProjects();

  // Configurar filtros de projeto
  setupProjectFilters();

  function loadProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = `
      <!-- Projeto 1 -->
      <div class="project-card data-analysis">
        <div class="project-image">
          <img src="assets/images/projects/data-analysis.png" alt="Análise de Dados COVID-19">
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
          <img src="assets/images/projects/machine-learning.png" alt="Previsão de Preços de Imóveis">
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
          <img src="assets/images/projects/cloud-computing.png" alt="Aplicação Serverless AWS">
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
            <a href="https://github.com/Jcnok/aws-serverless-app" target="_blank">Demo <i class="fas fa-external-link-alt"></i></a>
          </div>
        </div>
      </div>
      
      <!-- Projeto 4 -->
      <div class="project-card data-analysis">
        <div class="project-image">
          <img src="assets/images/projects/dashboard.png" alt="Dashboard de Vendas">
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
          <img src="assets/images/projects/deep-learning.png" alt="Classificação de Imagens">
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
          <img src="assets/images/projects/azure.png" alt="Pipeline de Dados Azure">
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
    `;

    // Adicionar animação de fade-in aos projetos
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;
    });
  }

  function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        button.classList.add('active');

        // Get filter value
        const filter = button.getAttribute('data-filter');

        // Filter projects
        const projects = document.querySelectorAll('.project-card');
        projects.forEach(project => {
          if (filter === 'all') {
            project.style.display = 'block';
          } else if (project.classList.contains(filter)) {
            project.style.display = 'block';
          } else {
            project.style.display = 'none';
          }
        });
      });
    });
  }

  // Função para buscar repositórios do GitHub
  async function fetchGitHubRepos() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    // Mostrar indicador de carregamento
    projectsGrid.innerHTML =
      '<div class="loading">Carregando projetos...</div>';

    try {
      console.log('Iniciando busca de repositórios...');

      // Usar a API pública do GitHub com parâmetros para obter mais informações
      const response = await fetch(
        'https://api.github.com/users/Jcnok/repos?sort=updated&per_page=10'
      );

      if (!response.ok) {
        throw new Error(`GitHub API respondeu com status: ${response.status}`);
      }

      const repos = await response.json();
      console.log('Repositórios obtidos:', repos.length);

      // Verificar se temos repositórios
      if (!repos || repos.length === 0) {
        projectsGrid.innerHTML =
          '<p class="no-projects">Nenhum repositório encontrado.</p>';
        loadFallbackProjects(projectsGrid);
        return;
      }

      // Limpar grid de projetos
      projectsGrid.innerHTML = '';

      // Filtrar repositórios que não são forks e têm descrição
      const filteredRepos = repos.filter(repo => !repo.fork).slice(0, 6); // Limitar a 6 projetos

      if (filteredRepos.length === 0) {
        projectsGrid.innerHTML =
          '<p class="no-projects">Nenhum repositório não-fork encontrado.</p>';
        loadFallbackProjects(projectsGrid);
        return;
      }

      console.log('Repositórios filtrados:', filteredRepos.length);

      // Adicionar repositórios ao grid de projetos
      filteredRepos.forEach(repo => {
        // Determinar categoria do projeto
        const category = determineCategory(repo);

        // Criar card do projeto
        const projectCard = document.createElement('div');
        projectCard.className = `project-card ${category}`;
        projectCard.setAttribute('data-aos', 'fade-up');

        // Gerar URL da imagem baseada no nome e descrição do repositório
        const imageQuery = encodeURIComponent(
          (repo.name + ' ' + (repo.description || ''))
            .replace(/[^\w\s]/gi, ' ')
            .substring(0, 30)
        );
        const imageUrl = `https://source.unsplash.com/300x200/?${imageQuery}`;

        // Formatar nome do repositório para exibição
        const displayName = repo.name
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        // Criar HTML do card
        projectCard.innerHTML = `
          <div class="project-image">
            <img src="${imageUrl}" alt="${displayName}" onerror="this.src='assets/images/projects/default-project.png'">
          </div>
          <div class="project-info">
            <h3>${displayName}</h3>
            <p>${
              repo.description ||
              'Projeto de análise de dados e ciência de dados.'
            }</p>
            <div class="project-tags">
              <span class="project-tag">${formatCategory(category)}</span>
              <span class="project-tag">${repo.language || 'Python'}</span>
            </div>
            <div class="project-links">
              <a href="${
                repo.html_url
              }" target="_blank">Ver Código <i class="fas fa-code"></i></a>
              <a href="${
                repo.homepage || repo.html_url
              }" target="_blank">Demo <i class="fas fa-external-link-alt"></i></a>
            </div>
          </div>
        `;

        projectsGrid.appendChild(projectCard);
        console.log('Adicionado projeto:', displayName);
      });
    } catch (error) {
      console.error('Erro ao buscar repositórios do GitHub:', error);
      projectsGrid.innerHTML = `
        <p class="error-message">
          Erro ao carregar projetos: ${error.message}. <br>
          Carregando projetos de exemplo...
        </p>`;

      // Carregar projetos de fallback em caso de erro
      setTimeout(() => {
        loadFallbackProjects(projectsGrid);
      }, 1500);
    }
  }

  // Função para carregar projetos de fallback
  function loadFallbackProjects(container) {
    container.innerHTML = `
      <!-- Projeto 1 -->
      <div class="project-card data-analysis">
        <div class="project-image">
          <img src="assets/images/projects/data-analysis.png" alt="Análise de Dados COVID-19">
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
          <img src="assets/images/projects/machine-learning.png" alt="Previsão de Preços de Imóveis">
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
          <img src="assets/images/projects/cloud-computing.png" alt="Aplicação Serverless AWS">
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
            <a href="https://github.com/Jcnok/aws-serverless-app" target="_blank">Demo <i class="fas fa-external-link-alt"></i></a>
          </div>
        </div>
      </div>
      
      <!-- Projeto 4 -->
      <div class="project-card data-analysis">
        <div class="project-image">
          <img src="assets/images/projects/dashboard.png" alt="Dashboard de Vendas">
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
          <img src="assets/images/projects/deep-learning.png" alt="Classificação de Imagens">
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
          <img src="assets/images/projects/azure.png" alt="Pipeline de Dados Azure">
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
    `;
  }

  // Função para determinar a categoria do projeto
  function determineCategory(repo) {
    // Verificar tópicos do repositório
    if (repo.topics && repo.topics.length > 0) {
      if (
        repo.topics.includes('machine-learning') ||
        repo.topics.includes('ml') ||
        repo.topics.includes('deep-learning') ||
        repo.topics.includes('neural-network')
      ) {
        return 'machine-learning';
      }

      if (
        repo.topics.includes('cloud') ||
        repo.topics.includes('aws') ||
        repo.topics.includes('azure') ||
        repo.topics.includes('gcp')
      ) {
        return 'cloud';
      }

      if (
        repo.topics.includes('data-analysis') ||
        repo.topics.includes('data-science') ||
        repo.topics.includes('analytics')
      ) {
        return 'data-analysis';
      }
    }

    // Verificar linguagem do repositório
    if (repo.language) {
      const lang = repo.language.toLowerCase();

      if (lang === 'jupyter notebook' || lang === 'python') {
        // Verificar nome e descrição para determinar categoria
        const nameAndDesc = (
          repo.name +
          ' ' +
          (repo.description || '')
        ).toLowerCase();

        if (
          nameAndDesc.includes('machine') ||
          nameAndDesc.includes('ml') ||
          nameAndDesc.includes('predict') ||
          nameAndDesc.includes('model') ||
          nameAndDesc.includes('neural') ||
          nameAndDesc.includes('deep learning')
        ) {
          return 'machine-learning';
        }

        if (
          nameAndDesc.includes('cloud') ||
          nameAndDesc.includes('aws') ||
          nameAndDesc.includes('azure') ||
          nameAndDesc.includes('gcp')
        ) {
          return 'cloud';
        }

        return 'data-analysis';
      }

      if (lang === 'javascript' || lang === 'typescript' || lang === 'html') {
        return 'web';
      }
    }

    // Categoria padrão
    return 'data-analysis';
  }

  // Função para formatar nome da categoria
  function formatCategory(category) {
    const categoryMap = {
      'data-analysis': 'Análise de Dados',
      'machine-learning': 'Machine Learning',
      cloud: 'Cloud Computing',
      web: 'Web Development',
    };

    return categoryMap[category] || category.replace('-', ' ');
  }
});
