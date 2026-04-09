/**
 * Main JavaScript file for the Data Science Portfolio
 * Handles navigation, smooth scrolling, and form submission
 * @author Julio Cesar Okuda
 * @version 1.0.0
 */

// Namespace para evitar poluição do escopo global
const Portfolio = {
  /**
   * Inicializa todas as funcionalidades do portfólio
   */
  init: function () {
    this.setupMobileNavigation()
    this.setupSmoothScrolling()
    this.setupContactForm()
    this.setupScrollAnimation()
    this.loadExperience()
    this.setupCTANudges()
    this.setupAnalyticsTracking()
    this.loadConfig()
  },

  /**
   * Loads professional experience from JSON
   */
  loadExperience: async function () {
    const timelineContainer = document.querySelector('.experience-timeline');
    if (!timelineContainer) return;

    try {
      const response = await fetch('assets/data/experience.json');
      if (!response.ok) throw new Error('Falha ao carregar experiência');
      const data = await response.json();

      let html = '';
      data.forEach(job => {
        html += `
          <div class="experience-item animate-on-scroll">
            <div class="experience-year">${job.period}</div>
            <div class="experience-content">
              <h4>${job.role} <span style="font-weight:normal; font-size:0.9em; opacity:0.8">@ ${job.company}</span></h4>
              <p>${job.description}</p>
            </div>
          </div>
        `;
      });
      timelineContainer.innerHTML = html;

      if (this.setupScrollAnimation) this.setupScrollAnimation();

    } catch (error) {
      console.error('Erro ao carregar experiência:', error);
      timelineContainer.innerHTML = '<p class="error-message">Não foi possível carregar as informações de experiência.</p>';
    }
  },

  /**
   * Configura a navegação mobile com animações
   */
  setupMobileNavigation: () => {
    const burger = document.querySelector(".burger")
    const nav = document.querySelector(".nav-links")
    const navLinks = document.querySelectorAll(".nav-links li")

    if (!burger) return

    burger.addEventListener("click", () => {
      // Toggle Nav
      nav.classList.toggle("nav-active")

      // Toggle Burger Animation
      burger.classList.toggle("toggle")

      // Animate Links
      navLinks.forEach((link, index) => {
        if (link.style.animation) {
          link.style.animation = ""
        } else {
          link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`
        }
      })
    })
  },

  /**
   * Configura o scroll suave para links de navegação
   */
  setupSmoothScrolling: () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");

        // Se o link foi alterado dinamicamente para uma URL externa, não faz scroll suave
        if (!targetId.startsWith('#') || targetId === '#') {
          return;
        }

        e.preventDefault();
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Ajuste para altura do cabeçalho
            behavior: "smooth",
          });

          // Fechar menu mobile se estiver aberto
          const nav = document.querySelector(".nav-links");
          const burger = document.querySelector(".burger");

          if (nav && nav.classList.contains("nav-active")) {
            nav.classList.remove("nav-active");
            burger.classList.remove("toggle");
          }
        }
      });
    });
  },

  /**
   * Configura o formulário de contato
   */
  setupContactForm: function () {
    const contactForm = document.getElementById("contactForm")

    if (!contactForm) return

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Obter valores do formulário
      const name = document.getElementById("name").value
      const email = document.getElementById("email").value
      const message = document.getElementById("message").value

      // Enviar os dados via AJAX usando FormSubmit
      fetch("https://formsubmit.co/ajax/julio.okuda@gmail.com", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          _subject: "Novo contato via Portfólio!"
        })
      })
        .then(response => response.json())
        .then(data => {
          // Mostrar mensagem de sucesso
          this.showFormSuccess()
          // Resetar formulário
          contactForm.reset()
        })
        .catch(error => {
          console.error("Erro ao enviar formulário:", error)
          alert("Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde ou contate via email.")
        })
    })
  },

  /**
   * Mostra mensagem de sucesso após envio do formulário
   */
  showFormSuccess: () => {
    const formContainer = document.querySelector(".contact-form")

    if (!formContainer) return

    const successMessage = document.createElement("div")
    successMessage.className = "form-success-message"
    successMessage.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <p>Mensagem enviada com sucesso!</p>
    `

    formContainer.appendChild(successMessage)

    // Remover mensagem após 3 segundos
    setTimeout(() => {
      successMessage.classList.add("fade-out")
      setTimeout(() => {
        formContainer.removeChild(successMessage)
      }, 500)
    }, 3000)
  },

  /**
   * Configura animações ao rolar a página
   */
  setupScrollAnimation: () => {
    const animateElements = document.querySelectorAll(".animate-on-scroll")

    if (animateElements.length === 0) return

    const checkScroll = () => {
      animateElements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top
        const screenPosition = window.innerHeight / 1.3

        if (elementPosition < screenPosition) {
          element.classList.add("animate")
        }
      })
    }

    // Verificar posição inicial
    window.addEventListener("load", checkScroll)

    // Verificar ao rolar
    window.addEventListener("scroll", checkScroll)
  },

  /**
   * Configura CTAs inteligentes (Nudges)
   */
  setupCTANudges: function () {
    const cvNavBtn = document.getElementById('nav-cv-generator');
    const projectsSection = document.getElementById('projects');

    if (!cvNavBtn || !projectsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Se a seção de projetos saiu da vista (usuário desceu), ativa o pulse no CTA de CV
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          cvNavBtn.classList.add('pulse-active');
        } else {
          cvNavBtn.classList.remove('pulse-active');
        }
      });
    }, { threshold: 0.1 });

    observer.observe(projectsSection);
  },

  /**
   * Rastreia cliques em links de conversão
   */
  setupAnalyticsTracking: function () {
    const trackClick = (id, name) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          if (window.va) window.va('track', { name: name });
        });
      }
    };

    trackClick('hero-cta-calendly', 'calendly_click_hero');
    trackClick('contact-whatsapp', 'whatsapp_click_contact');
  },

  /**
   * Carrega configurações e links dinâmicos
   */
  loadConfig: async function () {
    try {
      const response = await fetch('assets/data/config.json');
      if (!response.ok) throw new Error('Falha ao carregar config');
      const data = await response.json();

      const { contact } = data;

      // Hero e Contact CTAs
      const calendlyLinks = document.querySelectorAll('[id*="calendly"]');
      calendlyLinks.forEach(el => {
        if (contact.calendly) el.href = contact.calendly;
      });

      const whatsappLink = document.getElementById('contact-whatsapp');
      if (whatsappLink && contact.whatsapp) {
        whatsappLink.href = `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`;
      }

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  Portfolio.init()
})
