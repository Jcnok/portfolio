import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  // Mobile Navigation
  const burger = document.querySelector(".burger")
  const nav = document.querySelector(".nav-links")
  const navLinks = document.querySelectorAll(".nav-links li")

  if (burger) {
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
  }

  // Smooth Scrolling for Navigation Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href")
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for header height
          behavior: "smooth",
        })

        // Close mobile menu if open
        if (nav.classList.contains("nav-active")) {
          nav.classList.remove("nav-active")
          burger.classList.remove("toggle")
        }
      }
    })
  })

  // Skills Chart
  const ctx = document.getElementById("skillsChart")
  if (ctx && typeof Chart !== "undefined") {
    new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Python", "Data Analysis", "Machine Learning", "Cloud Computing", "SQL", "Statistics"],
        datasets: [
          {
            label: "Skill Level",
            data: [90, 85, 80, 85, 75, 80],
            backgroundColor: "rgba(0, 119, 182, 0.2)",
            borderColor: "rgba(0, 119, 182, 1)",
            pointBackgroundColor: "rgba(0, 119, 182, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(0, 119, 182, 1)",
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
    })
  } else {
    console.error("Chart.js não está disponível ou o elemento canvas não foi encontrado")
  }

  // Project Filter
  const filterButtons = document.querySelectorAll(".filter-btn")
  const projectsGrid = document.querySelector(".projects-grid")

  if (filterButtons.length > 0 && projectsGrid) {
    // Filter Projects
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

  // Contact Form
  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form values
      const name = document.getElementById("name").value
      const email = document.getElementById("email").value
      const message = document.getElementById("message").value

      // Here you would typically send the form data to a server
      // For now, we'll just log it to the console
      console.log("Form submitted:", { name, email, message })

      // Show success message
      alert("Mensagem enviada com sucesso!")

      // Reset form
      contactForm.reset()
    })
  }

  // Carregar imagens das certificações
  loadCertificationImages()

  function loadCertificationImages() {
    const microsoftAssociate = document.getElementById("microsoft-associate")
    const azureAI = document.getElementById("azure-ai")
    const azureData = document.getElementById("azure-data")
    const awsPractitioner = document.getElementById("aws-practitioner")

    // Verificar se as imagens já foram carregadas corretamente
    if (microsoftAssociate && !microsoftAssociate.complete) {
      microsoftAssociate.src = "assets/images/badges/microsoft-certified-associate-badge.png"
    }

    if (azureAI && !azureAI.complete) {
      azureAI.src = "assets/images/badges/microsoft-certified-fundamentals-badge.png"
    }

    if (azureData && !azureData.complete) {
      azureData.src = "assets/images/badges/microsoft-certified-fundamentals-badge.png"
    }

    if (awsPractitioner && !awsPractitioner.complete) {
      awsPractitioner.src = "assets/images/badges/aws-certified-cloud-practitioner-badge.png"
    }
  }
})
