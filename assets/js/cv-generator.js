document.addEventListener('DOMContentLoaded', () => {
    const navLink = document.getElementById('nav-cv-generator');
    const modal = document.getElementById('cv-modal');
    const closeBtn = document.getElementById('cv-modal-close');
    const generateBtn = document.getElementById('cv-generate-btn');
    const cancelBtn = document.getElementById('cv-cancel-btn');
    const downloadRelatorioBtn = document.getElementById('cv-download-relatorio-btn');
    const downloadCvBtn = document.getElementById('cv-download-cv-btn');
    const downloadCartaBtn = document.getElementById('cv-download-carta-btn');

    const step1 = document.getElementById('cv-step-1');
    const loading = document.getElementById('cv-loading');
    const result = document.getElementById('cv-result');

    const jobInput = document.getElementById('job-description-input');
    const outputContent = document.getElementById('cv-output-content');

    let relatorioMarkdown = '';
    let currículoMarkdown = '';
    let cartaMarkdown = '';

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

        step1.style.display = 'none';
        loading.style.display = 'block';

        try {
            const res = await fetch('/api/generate-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobDescription: desc })
            });

            const data = await res.json();

            if (!res.ok) {
                if (window.va) window.va('track', { name: 'cv_generation_failed', data: { error: data.error } });
                throw new Error(data.error || "Erro ao conectar com a IA");
            }

            if (window.va) window.va('track', { name: 'cv_generated' });
            const rawMarkdown = data.reply;

            // Split sections: ---RELATORIO---, ---CURRICULO---, ---CARTA---
            const relatorioSplit = rawMarkdown.split('---RELATORIO---');
            const relatorioAndRest = relatorioSplit.length > 1 ? relatorioSplit[1] : '';

            const currículoSplit = relatorioAndRest.split('---CURRICULO---');
            relatorioMarkdown = currículoSplit[0].trim();
            const currículoAndRest = currículoSplit.length > 1 ? currículoSplit[1] : '';

            const cartaSplit = currículoAndRest.split('---CARTA---');
            currículoMarkdown = cartaSplit[0].trim();
            cartaMarkdown = cartaSplit.length > 1 ? cartaSplit[1].trim() : '';

            // Render combined markdown to HTML for visual preview
            let visualPreview = '';
            visualPreview += '<h2 style="color:var(--accent-primary); border-bottom:1px solid var(--border-color); padding-bottom:10px;">1. Relatório de Avaliação</h2>\n\n' + relatorioMarkdown + '\n\n';
            visualPreview += '<h2 style="color:var(--accent-primary); border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-top:20px;">2. Currículo Personalizado</h2>\n\n' + currículoMarkdown + '\n\n';
            visualPreview += '<h2 style="color:var(--accent-primary); border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-top:20px;">3. Carta de Apresentação</h2>\n\n' + cartaMarkdown + '\n\n';

            if (typeof marked !== 'undefined') {
                outputContent.innerHTML = marked.parse(visualPreview);
            } else {
                outputContent.innerText = visualPreview;
            }

            loading.style.display = 'none';
            result.style.display = 'block';

        } catch (err) {
            console.error(err);
            alert("Erro: " + err.message);
            resetModal();
        }
    });

    // Reset Modal
    function resetModal() {
        jobInput.value = '';
        relatorioMarkdown = '';
        currículoMarkdown = '';
        cartaMarkdown = '';
        step1.style.display = 'block';
        loading.style.display = 'none';
        result.style.display = 'none';
    }

    // Cancel / New Job
    cancelBtn.addEventListener('click', resetModal);

    // Helpers to download Document format
    function downloadDocFile(contentHTML, filename) {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Document</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + contentHTML + footer;

        const blob = new Blob(['\\ufeff', sourceHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Download Actions
    downloadRelatorioBtn.addEventListener('click', () => {
        if (!relatorioMarkdown) return;
        if (window.va) window.va('track', { name: 'download_relatorio' });
        const html = typeof marked !== 'undefined' ? marked.parse(relatorioMarkdown) : relatorioMarkdown;
        downloadDocFile(html, 'Relatorio_ATS_Julio_Okuda');
    });

    downloadCvBtn.addEventListener('click', () => {
        if (!currículoMarkdown) return;
        if (window.va) window.va('track', { name: 'download_cv' });
        const html = typeof marked !== 'undefined' ? marked.parse(currículoMarkdown) : currículoMarkdown;
        downloadDocFile(html, 'Curriculo_ATS_Julio_Okuda');
    });

    downloadCartaBtn.addEventListener('click', () => {
        if (!cartaMarkdown) return;
        const html = typeof marked !== 'undefined' ? marked.parse(cartaMarkdown) : cartaMarkdown;
        downloadDocFile(html, 'Carta_ATS_Julio_Okuda');
    });
});
