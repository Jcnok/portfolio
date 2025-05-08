// Solução alternativa super simples para o alternador de tema
document.addEventListener("DOMContentLoaded", () => {
  var themeToggle = document.getElementById("theme-toggle")

  if (!themeToggle) {
    console.error("Botão de tema não encontrado!")
    return
  }

  // Aplicar tema inicial
  var currentTheme = localStorage.getItem("theme") || "light"
  document.documentElement.setAttribute("data-theme", currentTheme)

  // Atualizar ícone inicial
  var icon = themeToggle.querySelector("i")
  if (currentTheme === "dark") {
    icon.className = "fas fa-sun"
  } else {
    icon.className = "fas fa-moon"
  }

  // Adicionar evento de clique
  themeToggle.onclick = () => {
    // Obter tema atual
    var theme = document.documentElement.getAttribute("data-theme")

    // Alternar tema
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "dark")
      localStorage.setItem("theme", "dark")
      icon.className = "fas fa-sun"
    } else {
      document.documentElement.setAttribute("data-theme", "light")
      localStorage.setItem("theme", "light")
      icon.className = "fas fa-moon"
    }
  }
})
