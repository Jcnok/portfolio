import { Chart } from "@/components/ui/chart"
/**
 * Theme Toggle Module
 * Gerencia a alternância entre temas claro e escuro
 * @author Julio Cesar Okuda
 * @version 1.0.0
 */

// IIFE para evitar poluição do escopo global
;(() => {
  /**
   * Classe ThemeManager para gerenciar o tema da aplicação
   */
  class ThemeManager {
    constructor() {
      this.themeToggle = document.getElementById("theme-toggle")
      this.icon = this.themeToggle ? this.themeToggle.querySelector("i") : null
      this.currentTheme = document.documentElement.getAttribute("data-theme") || "light"

      this.init()
    }

    /**
     * Inicializa o gerenciador de tema
     */
    init() {
      if (!this.themeToggle || !this.icon) {
        console.error("Elementos de tema não encontrados")
        return
      }

      // Configurar ícone inicial
      this.updateIcon()

      // Adicionar evento de clique
      this.themeToggle.addEventListener("click", () => this.toggleTheme())

      // Registrar para mudanças de preferência do sistema
      this.setupSystemPreferenceListener()
    }

    /**
     * Alterna entre os temas claro e escuro
     */
    toggleTheme() {
      // Alternar tema
      this.currentTheme = this.currentTheme === "light" ? "dark" : "light"

      // Aplicar tema
      document.documentElement.setAttribute("data-theme", this.currentTheme)
      localStorage.setItem("theme", this.currentTheme)

      // Atualizar ícone
      this.updateIcon()

      // Atualizar gráficos se existirem
      this.updateCharts()

      console.log(`Tema alternado para: ${this.currentTheme}`)
    }

    /**
     * Atualiza o ícone com base no tema atual
     */
    updateIcon() {
      if (this.currentTheme === "dark") {
        this.icon.className = "fas fa-sun"
      } else {
        this.icon.className = "fas fa-moon"
      }
    }

    /**
     * Configura listener para mudanças na preferência de tema do sistema
     */
    setupSystemPreferenceListener() {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

      // Apenas reagir se não houver preferência salva
      mediaQuery.addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          this.currentTheme = e.matches ? "dark" : "light"
          document.documentElement.setAttribute("data-theme", this.currentTheme)
          this.updateIcon()
        }
      })
    }

    /**
     * Atualiza os gráficos quando o tema muda
     */
    updateCharts() {
      // Verificar se Chart.js está disponível
      if (typeof Chart === "undefined") return

      // Atualizar gráfico de habilidades
      const skillsChart = Chart.getChart("skillsChart")
      if (skillsChart) {
        const isDark = this.currentTheme === "dark"

        // Atualizar cores do gráfico
        skillsChart.options.scales.r.grid.color = isDark ? "rgba(203, 213, 225, 0.2)" : "rgba(71, 85, 105, 0.2)"

        skillsChart.options.scales.r.pointLabels.color = isDark ? "#cbd5e1" : "#475569"

        skillsChart.update()
      }
    }
  }

  // Inicializar quando o DOM estiver carregado
  document.addEventListener("DOMContentLoaded", () => {
    new ThemeManager()
  })
})()
