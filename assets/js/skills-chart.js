import { Chart } from "@/components/ui/chart"
/**
 * Skills Chart Module
 * Inicializa e gerencia o gráfico de habilidades
 * @author Julio Cesar Okuda
 * @version 1.0.0
 */

// IIFE para evitar poluição do escopo global
;(() => {
  /**
   * Classe SkillsChart para gerenciar o gráfico de habilidades
   */
  class SkillsChart {
    constructor() {
      this.chartElement = document.getElementById("skillsChart")
      this.chartInstance = null

      this.init()
    }

    /**
     * Inicializa o gráfico de habilidades
     */
    init() {
      if (!this.chartElement) {
        console.error("Elemento do gráfico não encontrado")
        return
      }

      if (typeof Chart === "undefined") {
        console.error("Chart.js não está disponível")
        return
      }

      this.createChart()
    }

    /**
     * Cria o gráfico de habilidades
     */
    createChart() {
      // Obter tema atual
      const isDark = document.documentElement.getAttribute("data-theme") === "dark"
      const textColor = isDark ? "#cbd5e1" : "#475569"

      // Configurar dados do gráfico
      const data = {
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
      }

      // Configurar opções do gráfico
      const options = {
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
              font: {
                size: 12,
              },
            },
            ticks: {
              color: textColor,
              backdropColor: "transparent",
              stepSize: 20,
              font: {
                size: 10,
              },
            },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            titleColor: isDark ? "#f8fafc" : "#0f172a",
            bodyColor: isDark ? "#f8fafc" : "#0f172a",
            borderColor: isDark ? "#334155" : "#e2e8f0",
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (context) => `Nível: ${context.raw}/100`,
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      }

      // Criar gráfico
      this.chartInstance = new Chart(this.chartElement, {
        type: "radar",
        data: data,
        options: options,
      })
    }

    /**
     * Atualiza o gráfico quando o tema muda
     * @param {boolean} isDark - Se o tema é escuro
     */
    updateTheme(isDark) {
      if (!this.chartInstance) return

      const textColor = isDark ? "#cbd5e1" : "#475569"

      // Atualizar cores do gráfico
      this.chartInstance.options.scales.r.grid.color = isDark ? "rgba(203, 213, 225, 0.2)" : "rgba(71, 85, 105, 0.2)"

      this.chartInstance.options.scales.r.pointLabels.color = textColor

      this.chartInstance.options.scales.r.ticks.color = textColor

      this.chartInstance.options.plugins.tooltip.backgroundColor = isDark ? "#1e293b" : "#ffffff"

      this.chartInstance.options.plugins.tooltip.titleColor = isDark ? "#f8fafc" : "#0f172a"

      this.chartInstance.options.plugins.tooltip.bodyColor = isDark ? "#f8fafc" : "#0f172a"

      this.chartInstance.options.plugins.tooltip.borderColor = isDark ? "#334155" : "#e2e8f0"

      // Atualizar o gráfico
      this.chartInstance.update()
    }
  }

  // Inicializar quando o DOM estiver carregado
  document.addEventListener("DOMContentLoaded", () => {
    window.skillsChart = new SkillsChart()

    // Adicionar listener para mudanças de tema
    document.addEventListener("themeChanged", (e) => {
      if (window.skillsChart) {
        window.skillsChart.updateTheme(e.detail.isDark)
      }
    })
  })
})()
