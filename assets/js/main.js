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
        e.preventDefault()

        const targetId = this.getAttribute("href")
        const targetElement = document.querySelector(targetId)

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Ajuste para altura do cabeçalho
            behavior: "smooth",
          })

          // Fechar menu mobile se estiver aberto
          const nav = document.querySelector(".nav-links")
          const burger = document.querySelector(".burger")

          if (nav && nav.classList.contains("nav-active")) {
            nav.classList.remove("nav-active")
            burger.classList.remove("toggle")
          }
        }
      })
    })
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

      // Aqui você normalmente enviaria os dados para um servidor
      console.log("Formulário enviado:", { name, email, message })

      // Mostrar mensagem de sucesso
      this.showFormSuccess()

      // Resetar formulário
      contactForm.reset()
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
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  Portfolio.init()
})
