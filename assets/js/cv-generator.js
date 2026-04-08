document.addEventListener('DOMContentLoaded', () => {
    const navLink = document.getElementById('nav-cv-generator');
    const modal = document.getElementById('cv-modal');
    const closeBtn = document.getElementById('cv-modal-close');
    const generateBtn = document.getElementById('cv-generate-btn');
    const cancelBtn = document.getElementById('cv-cancel-btn');
    const downloadBtn = document.getElementById('cv-download-btn');

    const step1 = document.getElementById('cv-step-1');
    const loading = document.getElementById('cv-loading');
    const result = document.getElementById('cv-result');

    const jobInput = document.getElementById('job-description-input');
    const outputContent = document.getElementById('cv-output-content');

    let rawMarkdown = '';

    // Show Modal
    navLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('hidden');
        resetModal();
    });

    // Close Modal
    const closeModal = () => modal.classList.add('hidden');
    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Handle Generation
    generateBtn.addEventListener('click', async () => {
        const desc = jobInput.value.trim();
        if (!desc) {
            alert("Por favor, cole a descrição da vaga.");
            return;
        }

        step1.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            const res = await fetch('/api/generate-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobDescription: desc })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao conectar com a IA");
            }

            rawMarkdown = data.reply;

            // Render markdown to HTML
            if (typeof marked !== 'undefined') {
                outputContent.innerHTML = marked.parse(rawMarkdown);
            } else {
                outputContent.innerText = rawMarkdown;
            }

            loading.classList.add('hidden');
            result.classList.remove('hidden');

        } catch (err) {
            console.error(err);
            alert("Erro: " + err.message);
            resetModal();
        }
    });

    // Reset Modal
    function resetModal() {
        jobInput.value = '';
        rawMarkdown = '';
        step1.classList.remove('hidden');
        loading.classList.add('hidden');
        result.classList.add('hidden');
    }

    // Cancel / New Job
    cancelBtn.addEventListener('click', resetModal);

    // Download MD
    downloadBtn.addEventListener('click', () => {
        if (!rawMarkdown) return;

        const blob = new Blob([rawMarkdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'julio_okuda_cv_analise.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
