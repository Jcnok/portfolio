/**
 * Skills Chart Module
 * Inicializa e gerencia o gráfico de habilidades
 * @author Julio Cesar Okuda
 * @version 1.1.0
 *
 * Changelog:
 * - v1.1.0 (Story 1.2): Substituído setTimeout por MutationObserver para
 *   sincronização de tema. Corrigidas propriedades faltantes no update de tema
 *   (angleLines, pointBorderColor, pointHoverBgColor, tooltip styles).
 */

// IIFE para evitar poluição do escopo global
(() => {
  /**
   * Retorna todas as cores dependentes do tema atual.
   * Centraliza a lógica de cores para evitar duplicação.
   * @returns {Object} Objeto com todas as cores theme-dependent do chart.
   */
  function getThemeColors() {
    const isDark =
      document.documentElement.getAttribute('data-theme') === 'dark';

    return {
      textColor: isDark ? '#cbd5e1' : '#475569',
      gridColor: isDark
        ? 'rgba(203, 213, 225, 0.2)'
        : 'rgba(71, 85, 105, 0.2)',
      pointBorderColor: isDark ? '#1e293b' : '#ffffff',
      pointHoverBgColor: isDark ? '#1e293b' : '#ffffff',
      tooltipBgColor: isDark ? '#1e293b' : '#ffffff',
      tooltipTextColor: isDark ? '#f8fafc' : '#0f172a',
      tooltipBorderColor: isDark ? '#334155' : '#e2e8f0',
    };
  }

  /**
   * Inicializa o gráfico de habilidades
   */
  async function initSkillsChart() {
    const chartElement = document.getElementById('skillsChart');

    if (!chartElement) {
      console.error('Elemento do gráfico não encontrado');
      return;
    }

    if (typeof Chart === 'undefined') {
      console.error('Chart.js não está disponível');
      return;
    }

    // Obter cores do tema atual
    const colors = getThemeColors();

    // Fetch Language Data
    let labels = [];
    let values = [];

    try {
      const response = await fetch('assets/data/languages.json');
      if (response.ok) {
        const langData = await response.json();
        const sortedData = Object.entries(langData)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6);

        labels = sortedData.map(([key]) => key);
        values = sortedData.map(([, val]) => val);
      } else {
        throw new Error('Failed to load');
      }
    } catch (e) {
      console.warn('Using fallback skills data');
      labels = ['Python', 'SQL', 'Data Analysis', 'ML', 'Azure', 'Power BI'];
      values = [90, 80, 85, 75, 70, 85];
    }

    // Configurar dados do gráfico
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Skill Level (Relative)',
          data: values,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: colors.pointBorderColor,
          pointHoverBackgroundColor: colors.pointHoverBgColor,
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
          pointRadius: 4,
          pointHitRadius: 10,
        },
      ],
    };

    // Configurar opções do gráfico
    const options = {
      scales: {
        r: {
          angleLines: {
            display: true,
            color: colors.gridColor,
          },
          grid: {
            color: colors.gridColor,
          },
          pointLabels: {
            color: colors.textColor,
            font: {
              size: 12,
            },
          },
          ticks: {
            color: colors.textColor,
            backdropColor: 'transparent',
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
          backgroundColor: colors.tooltipBgColor,
          titleColor: colors.tooltipTextColor,
          bodyColor: colors.tooltipTextColor,
          borderColor: colors.tooltipBorderColor,
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: context => `Nível: ${context.raw}/100`,
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    };

    // Criar gráfico
    const chart = new Chart(chartElement, {
      type: 'radar',
      data: data,
      options: options,
    });

    // Observar mudanças no atributo data-theme do <html> via MutationObserver.
    // Substitui o antigo setTimeout(100) que causava race condition.
    const themeObserver = new MutationObserver(() => {
      const newColors = getThemeColors();

      // Atualizar cores da escala radial
      chart.options.scales.r.grid.color = newColors.gridColor;
      chart.options.scales.r.angleLines.color = newColors.gridColor;
      chart.options.scales.r.pointLabels.color = newColors.textColor;
      chart.options.scales.r.ticks.color = newColors.textColor;

      // Atualizar cores dos pontos do dataset
      chart.data.datasets[0].pointBorderColor = newColors.pointBorderColor;
      chart.data.datasets[0].pointHoverBackgroundColor =
        newColors.pointHoverBgColor;

      // Atualizar cores do tooltip
      chart.options.plugins.tooltip.backgroundColor = newColors.tooltipBgColor;
      chart.options.plugins.tooltip.titleColor = newColors.tooltipTextColor;
      chart.options.plugins.tooltip.bodyColor = newColors.tooltipTextColor;
      chart.options.plugins.tooltip.borderColor = newColors.tooltipBorderColor;

      chart.update();
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Nota: Em uma SPA com routing, o observer deveria ser desconectado
    // ao destruir o componente do chart (themeObserver.disconnect()).
    // Neste portfólio single-page, o chart vive durante toda a sessão.
  }

  // Inicializar quando o DOM estiver carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkillsChart);
  } else {
    initSkillsChart();
  }
})();
