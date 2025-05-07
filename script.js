import { Chart } from '@/components/ui/chart';
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links li');

  if (burger) {
    burger.addEventListener('click', () => {
      // Toggle Nav
      nav.classList.toggle('nav-active');

      // Toggle Burger Animation
      burger.classList.toggle('toggle');

      // Animate Links
      navLinks.forEach((link, index) => {
        if (link.style.animation) {
          link.style.animation = '';
        } else {
          link.style.animation = `navLinkFade 0.5s ease forwards ${
            index / 7 + 0.3
          }s`;
        }
      });
    });
  }

  // Skills Chart
  const ctx = document.getElementById('skillsChart');
  if (ctx) {
    // Verificar se Chart.js está disponível
    if (typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'radar',
        data: {
          labels: [
            'Python',
            'Data Analysis',
            'Machine Learning',
            'Cloud Computing',
            'SQL',
            'Statistics',
          ],
          datasets: [
            {
              label: 'Skill Level',
              data: [90, 85, 80, 85, 75, 80],
              backgroundColor: 'rgba(0, 119, 182, 0.2)',
              borderColor: 'rgba(0, 119, 182, 1)',
              pointBackgroundColor: 'rgba(0, 119, 182, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(0, 119, 182, 1)',
              pointRadius: 4,
              pointHitRadius: 10,
            },
          ],
        },
        options: {
          scales: {
            r: {
              angleLines: {
                display: true,
              },
              suggestedMin: 0,
              suggestedMax: 100,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    } else {
      console.error(
        'Chart.js não está disponível. Verifique se o script foi carregado corretamente.'
      );
    }
  }

  // Project Filter
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectsGrid = document.querySelector('.projects-grid');

  if (filterButtons.length > 0 && projectsGrid) {
    // Fetch GitHub Repositories
    fetchGitHubRepos();

    // Filter Projects
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

  // Contact Form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      // Get form values
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      // Here you would typically send the form data to a server
      // For now, we'll just log it to the console
      console.log('Form submitted:', { name, email, message });

      // Show success message
      alert('Mensagem enviada com sucesso!');

      // Reset form
      contactForm.reset();
    });
  }

  // Fetch GitHub Repositories
  async function fetchGitHubRepos() {
    if (!projectsGrid) return;

    // Mostrar indicador de carregamento
    projectsGrid.innerHTML =
      '<div class="loading">Carregando projetos...</div>';

    try {
      // Usar a API pública do GitHub com parâmetros para obter mais informações
      const response = await fetch(
        'https://api.github.com/users/Jcnok/repos?sort=updated&per_page=10&type=owner'
      );

      if (!response.ok) {
        throw new Error(`GitHub API respondeu com status: ${response.status}`);
      }

      const repos = await response.json();

      // Verificar se temos repositórios
      if (!repos || repos.length === 0) {
        projectsGrid.innerHTML =
          '<p class="no-projects">Nenhum repositório encontrado.</p>';
        return;
      }

      // Limpar grid de projetos
      projectsGrid.innerHTML = '';

      // Filtrar repositórios que não são forks e têm descrição
      const filteredRepos = repos.filter(repo => !repo.fork).slice(0, 6); // Limitar a 6 projetos

      if (filteredRepos.length === 0) {
        projectsGrid.innerHTML =
          '<p class="no-projects">Nenhum repositório não-fork encontrado.</p>';
        return;
      }

      // Adicionar repositórios ao grid de projetos
      filteredRepos.forEach(repo => {
        // Determinar categoria do projeto
        const category = determineCategory(repo);

        // Criar card do projeto
        const projectCard = document.createElement('div');
        projectCard.className = `project-card ${category}`;

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
            <img src="${imageUrl}" alt="${displayName}" onerror="this.src='https://source.unsplash.com/300x200/?data,code'">
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
      });
    } catch (error) {
      console.error('Erro ao buscar repositórios do GitHub:', error);
      projectsGrid.innerHTML = `
        <p class="error-message">
          Erro ao carregar projetos: ${error.message}. <br>
          Por favor, tente novamente mais tarde ou adicione projetos manualmente.
        </p>`;
    }
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

  // Carregar imagens das certificações
  loadCertificationImages();

  function loadCertificationImages() {
    const microsoftAssociate = document.getElementById('microsoft-associate');
    const azureAI = document.getElementById('azure-ai');
    const azureData = document.getElementById('azure-data');
    const awsPractitioner = document.getElementById('aws-practitioner');

    if (microsoftAssociate) {
      microsoftAssociate.src =
        'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-associate-badge.svg';
    }

    if (azureAI) {
      azureAI.src =
        'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-fundamentals-badge.svg';
    }

    if (azureData) {
      azureData.src =
        'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-fundamentals-badge.svg';
    }

    if (awsPractitioner) {
      awsPractitioner.src =
        'https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Cloud-Practitioner_badge.634f8a21af2e0e956ed8905a72366146ba22b74c.png';
    }
  }
});
