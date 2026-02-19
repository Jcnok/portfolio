document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.querySelector('.chat-container');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const messagesContainer = document.getElementById('chat-messages');

    if (!chatToggle) return;

    // Toggle Chat Visibility
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
        if (!chatContainer.classList.contains('hidden')) {
            setTimeout(() => chatInput.focus(), 100);
        }
    });

    chatClose.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });

    // Send Message Logic
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
                addMessage(data.reply, 'bot-message');
            } else {
                addMessage('Desculpe, erro ao conectar com a IA.', 'bot-message');
            }

        } catch (error) {
            removeMessage(loadingId);
            addMessage('Erro de conexão.', 'bot-message');
        }
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function addMessage(text, className) {
        const div = document.createElement('div');
        div.className = `message ${className}`;
        div.innerText = text;
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
