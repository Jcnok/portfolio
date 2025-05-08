// Script super simples para alternar o tema e o ícone
document.addEventListener("DOMContentLoaded", () => {
  // Obter o botão de alternância de tema
  const themeToggle = document.getElementById("theme-toggle")

  if (!themeToggle) {
    console.error("Botão de tema não encontrado!")
    return
  }

  // Obter o ícone dentro do botão
  const icon = themeToggle.querySelector("i")

  if (!icon) {
    console.error("Ícone do tema não encontrado!")
    return
  }

  // Verificar o tema atual e ajustar o ícone
  const currentTheme = document.documentElement.getAttribute("data-theme")

  // Definir o ícone correto com base no tema atual
  if (currentTheme === "dark") {
    // Se estiver no modo escuro, mostrar o ícone do sol
    icon.className = "fas fa-sun"
  } else {
    // Se estiver no modo claro, mostrar o ícone da lua
    icon.className = "fas fa-moon"
  }

  // Adicionar evento de clique para alternar o tema
  themeToggle.addEventListener("click", () => {
    // Obter o tema atual
    const theme = document.documentElement.getAttribute("data-theme")

    // Alternar o tema
    if (theme === "dark") {
      // Mudar para tema claro
      document.documentElement.setAttribute("data-theme", "light")
      localStorage.setItem("theme", "light")
      // Mudar para ícone da lua
      icon.className = "fas fa-moon"
    } else {
      // Mudar para tema escuro
      document.documentElement.setAttribute("data-theme", "dark")
      localStorage.setItem("theme", "dark")
      // Mudar para ícone do sol
      icon.className = "fas fa-sun"
    }

    console.log("Tema alternado para:", document.documentElement.getAttribute("data-theme"))
    console.log("Ícone atual:", icon.className)
  })
})
