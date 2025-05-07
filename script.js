import { Chart } from '@/components/ui/chart';
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links li');

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

  // Skills Chart
  const ctx = document.getElementById('skillsChart').getContext('2d');
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

  // Project Filter
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectsGrid = document.querySelector('.projects-grid');

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
    try {
      const response = await fetch(
        'https://api.github.com/users/Jcnok/repos?sort=updated&per_page=6'
      );

      if (!response.ok) {
        throw new Error(`GitHub API responded with status: ${response.status}`);
      }

      const repos = await response.json();

      // Clear projects grid
      projectsGrid.innerHTML = '';

      // Add repos to projects grid
      repos.forEach(repo => {
        // Skip forked repositories if you want
        if (repo.fork) return;

        // Determine project category based on topics or language
        let category = 'data-analysis';

        if (repo.topics && repo.topics.length > 0) {
          if (repo.topics.includes('machine-learning')) {
            category = 'machine-learning';
          } else if (repo.topics.includes('cloud')) {
            category = 'cloud';
          }
        } else if (repo.language) {
          // Fallback to language-based categorization
          const lang = repo.language.toLowerCase();
          if (lang === 'python' || lang === 'jupyter notebook') {
            category = 'data-analysis';
          } else if (lang === 'javascript' || lang === 'html') {
            category = 'web';
          }
        }

        // Create project card
        const projectCard = document.createElement('div');
        projectCard.className = `project-card ${category}`;

        // Generate image for project (using repo name as part of the query)
        const imageUrl = `https://source.unsplash.com/300x200/?data,${encodeURIComponent(
          repo.name.replace(/-/g, ',')
        )}`;

        projectCard.innerHTML = `
          <div class="project-image">
            <img src="${imageUrl}" alt="${repo.name}">
          </div>
          <div class="project-info">
            <h3>${repo.name.replace(/-/g, ' ').replace(/_/g, ' ')}</h3>
            <p>${
              repo.description ||
              'Projeto de análise de dados e ciência de dados.'
            }</p>
            <div class="project-tags">
              <span class="project-tag">${category.replace('-', ' ')}</span>
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

      // If no projects were added (all were forks or filtered out)
      if (projectsGrid.children.length === 0) {
        projectsGrid.innerHTML =
          '<p class="no-projects">Nenhum projeto encontrado. Adicione repositórios não-fork ao seu GitHub.</p>';
      }
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      projectsGrid.innerHTML = `
        <p class="error-message">
          Erro ao carregar projetos: ${error.message}. <br>
          Por favor, tente novamente mais tarde ou adicione projetos manualmente.
        </p>`;
    }
  }

  // Load certification images
  loadCertificationImages();

  function loadCertificationImages() {
    // Microsoft Associate
    document.getElementById('microsoft-associate').src =
      'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-associate-badge.svg';

    // Azure AI Fundamentals
    document.getElementById('azure-ai').src =
      'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-fundamentals-badge.svg';

    // Azure Data Fundamentals
    document.getElementById('azure-data').src =
      'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-fundamentals-badge.svg';

    // AWS Cloud Practitioner
    document.getElementById('aws-practitioner').src =
      'https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Cloud-Practitioner_badge.634f8a21af2e0e956ed8905a72366146ba22b74c.png';
  }
});
