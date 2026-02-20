/**
 * Skills Chart Module
 * Inicializa e gerencia o gráfico de habilidades
 * @author Julio Cesar Okuda
 * @version 1.0.0
 */

// IIFE para evitar poluição do escopo global
(() => {
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

    // Obter tema atual
    const isDark =
      document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#475569';

    // Fetch Language Data
    let labels = [];
    let values = [];
    
    try {
        const response = await fetch('assets/data/languages.json');
        if (response.ok) {
            const langData = await response.json();
            const sortedData = Object.entries(langData)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6);
            
            const maxVal = sortedData[0][1];
            labels = sortedData.map(([key]) => key);
            values = sortedData.map(([, val]) => Math.round((val / maxVal) * 100));
        } else {
            throw new Error('Failed to load');
        }
    } catch (e) {
        console.warn("Using fallback skills data");
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
          pointBorderColor: isDark ? '#1e293b' : '#ffffff',
          pointHoverBackgroundColor: isDark ? '#1e293b' : '#ffffff',
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
            color: isDark
              ? 'rgba(203, 213, 225, 0.2)'
              : 'rgba(71, 85, 105, 0.2)',
          },
          grid: {
            color: isDark
              ? 'rgba(203, 213, 225, 0.2)'
              : 'rgba(71, 85, 105, 0.2)',
          },
          pointLabels: {
            color: textColor,
            font: {
              size: 12,
            },
          },
          ticks: {
            color: textColor,
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
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          titleColor: isDark ? '#f8fafc' : '#0f172a',
          bodyColor: isDark ? '#f8fafc' : '#0f172a',
          borderColor: isDark ? '#334155' : '#e2e8f0',
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

    // Adicionar listener para mudanças de tema
    document.addEventListener('click', e => {
      if (e.target.closest('#theme-toggle')) {
        // Esperar um pouco para que o tema seja alterado
        setTimeout(() => {
          const isDarkNow =
            document.documentElement.getAttribute('data-theme') === 'dark';
          const textColorNow = isDarkNow ? '#cbd5e1' : '#475569';

          // Atualizar cores do gráfico
          chart.options.scales.r.grid.color = isDarkNow
            ? 'rgba(203, 213, 225, 0.2)'
            : 'rgba(71, 85, 105, 0.2)';
          chart.options.scales.r.pointLabels.color = textColorNow;
          chart.options.scales.r.ticks.color = textColorNow;

          // Atualizar o gráfico
          chart.update();
        }, 100);
      }
    });
  }

  // Inicializar quando o DOM estiver carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkillsChart);
  } else {
    initSkillsChart();
  }
})();
