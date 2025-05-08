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
})
