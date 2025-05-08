import { Chart } from "@/components/ui/chart"
// Função imediatamente invocada para isolar o código
;(() => {
  // Função para inicializar o tema
  function initTheme() {
    // Obter o botão de alternância de tema
    const themeToggle = document.getElementById("theme-toggle")

    if (!themeToggle) {
      console.error("Botão de tema não encontrado!")
      return
    }

    // Obter o ícone dentro do botão
    const themeIcon = themeToggle.querySelector("i")

    if (!themeIcon) {
      console.error("Ícone do tema não encontrado!")
      return
    }

    // Verificar tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem("theme")
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches

    // Aplicar tema inicial
    if (savedTheme === "dark" || (!savedTheme && prefersDarkScheme)) {
      document.documentElement.setAttribute("data-theme", "dark")
      themeIcon.classList.remove("fa-moon")
      themeIcon.classList.add("fa-sun")
    } else {
      document.documentElement.setAttribute("data-theme", "light")
      themeIcon.classList.remove("fa-sun")
      themeIcon.classList.add("fa-moon")
    }

    // Adicionar evento de clique
    themeToggle.addEventListener("click", () => {
      console.log("Botão de tema clicado")

      // Obter tema atual
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light"
      const newTheme = currentTheme === "light" ? "dark" : "light"

      // Aplicar novo tema
      document.documentElement.setAttribute("data-theme", newTheme)
      localStorage.setItem("theme", newTheme)

      // Atualizar ícone
      if (newTheme === "dark") {
        themeIcon.classList.remove("fa-moon")
        themeIcon.classList.add("fa-sun")
      } else {
        themeIcon.classList.remove("fa-sun")
        themeIcon.classList.add("fa-moon")
      }

      // Atualizar gráfico se existir
      updateChart()
    })
  }

  // Função para atualizar o gráfico quando o tema mudar
  function updateChart() {
    const ctx = document.getElementById("skillsChart")
    if (!ctx || typeof Chart === "undefined") {
      return
    }

    // Tentar obter instância existente do gráfico
    const chartInstance = Chart.getChart(ctx)
    if (chartInstance) {
      chartInstance.destroy()
    }

    // Configurar cores baseadas no tema atual
    const isDark = document.documentElement.getAttribute("data-theme") === "dark"
    const textColor = isDark ? "#cbd5e1" : "#475569"

    new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Python", "Data Analysis", "Machine Learning", "Cloud Computing", "SQL", "Statistics"],
        datasets: [
          {
            label: "Skill Level",
            data: [90, 85, 80, 85, 75, 80],
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgba(59, 130, 246, 1)",
            pointBackgroundColor: "rgba(59, 130, 246, 1)",
            pointBorderColor: isDark ? "#1e293b" : "#ffffff",
            pointHoverBackgroundColor: isDark ? "#1e293b" : "#ffffff",
            pointHoverBorderColor: "rgba(59, 130, 246, 1)",
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
              color: isDark ? "rgba(203, 213, 225, 0.2)" : "rgba(71, 85, 105, 0.2)",
            },
            grid: {
              color: isDark ? "rgba(203, 213, 225, 0.2)" : "rgba(71, 85, 105, 0.2)",
            },
            pointLabels: {
              color: textColor,
            },
            ticks: {
              color: textColor,
              backdropColor: "transparent",
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
  }

  // Inicializar quando o DOM estiver carregado
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme)
  } else {
    initTheme()
  }
})()
