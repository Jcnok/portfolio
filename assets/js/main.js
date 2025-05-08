import { Chart } from '@/components/ui/chart';
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');
    const htmlElement = document.documentElement; // Declared here

    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme)) {
      htmlElement.setAttribute('data-theme', 'dark');
      themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', () => {
      console.log('Theme toggle clicked');
      const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      // Update icon
      if (newTheme === 'dark') {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
      } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
      }
    });
  } else {
    console.error('Theme toggle button not found');
  }

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

  // Smooth Scrolling for Navigation Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for header height
          behavior: 'smooth',
        });

        // Close mobile menu if open
        if (nav.classList.contains('nav-active')) {
          nav.classList.remove('nav-active');
          burger.classList.remove('toggle');
        }
      }
    });
  });

  // Skills Chart
  const ctx = document.getElementById('skillsChart');
  if (ctx && typeof Chart !== 'undefined') {
    // Set chart colors based on current theme
    const updateChartColors = () => {
      const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#cbd5e1' : '#475569';

      return new Chart(ctx, {
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
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderColor: 'rgba(59, 130, 246, 1)',
              pointBackgroundColor: 'rgba(59, 130, 246, 1)',
              pointBorderColor: isDark ? '#1e293b' : '#ffffff',
              pointHoverBackgroundColor: isDark ? '#1e293b' : '#ffffff',
              pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
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
                color: isDark
                  ? 'rgba(203, 213, 225, 0.2)'
                  : 'rgba(71, 85, 105, 0.2)',
              },
              grid: {
                color: isDark
                  ? 'rgba(203, 213, 225, 0.2)'
                  : 'rgba(71, 85, 105, 0.2)',
              },
              pointLabels: {
                color: textColor,
              },
              ticks: {
                color: textColor,
                backdropColor: 'transparent',
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
    };

    // Initialize chart
    let skillsChart = updateChartColors();

    // Update chart when theme changes
    themeToggle.addEventListener('click', () => {
      skillsChart.destroy();
      skillsChart = updateChartColors();
    });
  } else {
    console.error(
      'Chart.js não está disponível ou o elemento canvas não foi encontrado'
    );
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
});
