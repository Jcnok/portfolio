/**
 * Chat Widget Module
 * UI e lógica do chat widget com tratamento de erros amigável.
 * @version 2.0.0 (Story 1.3)
 */
document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.querySelector('.chat-container');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const messagesContainer = document.getElementById('chat-messages');

    if (!chatToggle) return;

    // -----------------------------------------------------------------------
    // Mapeamento de errorCode → mensagem amigável em português
    // -----------------------------------------------------------------------
    const ERROR_MESSAGES = {
        RATE_LIMITED: '⏳ Muitas mensagens! Aguarde um momento antes de enviar outra.',
        QUOTA_EXCEEDED: '🔄 O serviço de IA está sobrecarregado. Tente mais tarde.',
        MESSAGE_TOO_LONG: '📝 Mensagem muito longa. Tente uma pergunta mais curta (máx. 500 caracteres).',
        EMPTY_MESSAGE: '💬 Por favor, digite uma mensagem.',
        INVALID_CONTENT_TYPE: '❌ Erro técnico ao enviar mensagem.',
        CONFIG_ERROR: '⚙️ O assistente está temporariamente fora do ar.',
        SERVICE_UNAVAILABLE: '🔄 Serviço de IA temporariamente indisponível. Tente novamente em instantes.',
        NETWORK_ERROR: '🌐 Erro de conexão. Verifique sua internet e tente novamente.',
        INVALID_ARGUMENT: '❌ Não foi possível processar sua mensagem.',
    };

    const DEFAULT_ERROR = '❌ Erro ao conectar com a IA. Tente novamente.';

    /**
     * Extrai mensagem amigável a partir da resposta de erro da API.
     * @param {Object} data - Parsed JSON da resposta
     * @returns {string} Mensagem amigável para exibir no chat
     */
    function getFriendlyError(data) {
        if (data?.errorCode && ERROR_MESSAGES[data.errorCode]) {
            return ERROR_MESSAGES[data.errorCode];
        }
        return data?.error || DEFAULT_ERROR;
    }

    // -----------------------------------------------------------------------
    // Toggle Chat Visibility
    // -----------------------------------------------------------------------
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
        if (!chatContainer.classList.contains('hidden')) {
            setTimeout(() => chatInput.focus(), 100);
        }
    });

    chatClose.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });

    // -----------------------------------------------------------------------
    // Send Message Logic
    // -----------------------------------------------------------------------
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // User Message UI
        addMessage(text, 'user-message');
        chatInput.value = '';

        // Typing Indicator UI
        const loadingId = addTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();

            removeMessage(loadingId);

            if (response.ok) {
                addMessage(data.reply, 'bot-message', true);

                // RAG: Exibir fontes verificadas se disponíveis
                if (data.sources && data.sources.length > 0) {
                    const sourceLabels = data.sources.map(s => {
                        const icon = s.type === 'certificate' ? '🎓' : '📂';
                        return `${icon} ${s.title} (${s.score}%)`;
                    }).join(' · ');
                    addMessage(`📎 Fontes: ${sourceLabels}`, 'bot-message sources-tag', false);
                }
            } else {
                addMessage(getFriendlyError(data), 'bot-message', true);
            }

        } catch (error) {
            removeMessage(loadingId);
            addMessage('🌐 Erro de conexão. Verifique sua internet e tente novamente.', 'bot-message', true);
        }
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // -----------------------------------------------------------------------
    // Sanitizer — remove tags perigosas, preserva formatação segura
    // -----------------------------------------------------------------------
    const ALLOWED_TAGS = ['B', 'I', 'EM', 'STRONG', 'P', 'BR', 'UL', 'OL', 'LI', 'CODE', 'PRE', 'BLOCKQUOTE', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    function sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Remove scripts, iframes, objects, embeds, forms
        temp.querySelectorAll('script, iframe, object, embed, form, style, link, meta, base').forEach(el => el.remove());

        // Remove event handlers from all elements
        temp.querySelectorAll('*').forEach(el => {
            for (const attr of [...el.attributes]) {
                if (attr.name.startsWith('on') || attr.name === 'srcdoc' || (attr.name === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:'))) {
                    el.removeAttribute(attr.name);
                }
            }
        });

        // Ensure links open in new tab safely
        temp.querySelectorAll('a').forEach(a => {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        });

        return temp.innerHTML;
    }

    // -----------------------------------------------------------------------
    // UI Helpers
    // -----------------------------------------------------------------------
    function addMessage(text, className, isMarkdown = false) {
        const div = document.createElement('div');
        div.className = `message ${className}`;

        if (isMarkdown && typeof marked !== 'undefined') {
            div.innerHTML = sanitizeHTML(marked.parse(text));
        } else {
            div.innerText = text;
        }

        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        const id = 'msg-' + Date.now();
        div.id = id;
        return id;
    }

    function addTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.innerHTML = '<span>.</span><span>.</span><span>.</span>';
        const id = 'typing-' + Date.now();
        div.id = id;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
});

