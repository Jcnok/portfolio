/**
 * Theme Toggle Module - Versão simplificada
 * Gerencia a alternância entre temas claro e escuro
 * @author Julio Cesar Okuda
 * @version 1.1.0
 */

// Função imediatamente invocada para evitar poluição do escopo global
(() => {
  // Função para inicializar o tema quando o DOM estiver carregado
  function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
      console.error('Botão de alternância de tema não encontrado');
      return;
    }

    const icon = themeToggle.querySelector('i');
    if (!icon) {
      console.error('Ícone do tema não encontrado');
      return;
    }

    // Verificar o tema atual
    const currentTheme =
      document.documentElement.getAttribute('data-theme') || 'light';

    // Definir o ícone correto com base no tema atual
    updateIcon(icon, currentTheme);

    // Adicionar evento de clique para alternar o tema
    themeToggle.addEventListener('click', () => {
      // Obter o tema atual
      const theme =
        document.documentElement.getAttribute('data-theme') || 'light';

      // Alternar o tema
      const newTheme = theme === 'light' ? 'dark' : 'light';

      // Aplicar o novo tema
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      // Atualizar o ícone
      updateIcon(icon, newTheme);

      console.log('Tema alternado para:', newTheme);
    });
  }

  // Função para atualizar o ícone com base no tema
  function updateIcon(icon, theme) {
    if (theme === 'dark') {
      icon.className = 'fas fa-sun';
    } else {
      icon.className = 'fas fa-moon';
    }
  }

  // Inicializar quando o DOM estiver carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();
