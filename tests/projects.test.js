/**
 * @jest-environment jsdom
 *
 * Testes unitários para ProjectManager (assets/js/projects.js)
 * Story 2.1 — Configurar Ambiente de Testes com Jest
 */

const { ProjectManager } = require('../assets/js/projects');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Monta o DOM mínimo necessário para o ProjectManager funcionar */
function setupDOM() {
    document.body.innerHTML = `
    <div class="projects-filter">
      <button class="filter-btn active" data-filter="all">Todos</button>
      <button class="filter-btn" data-filter="data-analysis">Análise</button>
      <button class="filter-btn" data-filter="machine-learning">ML</button>
      <button class="filter-btn" data-filter="cloud">Cloud</button>
    </div>
    <div class="projects-grid" id="projects-grid"></div>
  `;
}

/** Dados mock de projetos para testes */
const MOCK_PROJECTS = [
    {
        id: 1,
        title: 'Projeto Data Analysis',
        description: 'Desc 1',
        image: 'img1.png',
        category: 'data-analysis',
        tags: ['Python', 'Pandas'],
        codeUrl: 'https://github.com/test/1',
        demoUrl: 'https://demo.test/1',
    },
    {
        id: 2,
        title: 'Projeto ML',
        description: 'Desc 2',
        image: 'img2.png',
        category: 'machine-learning',
        tags: ['TensorFlow'],
        codeUrl: 'https://github.com/test/2',
        demoUrl: 'https://demo.test/2',
    },
    {
        id: 3,
        title: 'Projeto Cloud',
        description: 'Desc 3',
        image: 'img3.png',
        category: 'cloud',
        tags: ['Azure'],
        codeUrl: 'https://github.com/test/3',
        demoUrl: 'https://demo.test/3',
    },
    {
        id: 4,
        title: 'Outro Projeto ML',
        description: 'Desc 4',
        image: 'img4.png',
        category: 'machine-learning',
        tags: ['PyTorch'],
        codeUrl: 'https://github.com/test/4',
        demoUrl: 'https://demo.test/4',
    },
];

/**
 * Cria uma instância de ProjectManager sem fetch (para testes de filtro).
 * Injeta os projetos mock diretamente e renderiza os cards.
 */
function createManagerWithMockData(projects = MOCK_PROJECTS) {
    setupDOM();

    // Stub fetch para evitar chamada de rede no constructor
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(projects),
        })
    );

    const manager = new ProjectManager();

    // Aguardar o init() assíncrono resolver
    return new Promise(resolve => {
        // MicroTask: a Promise do fetch resolve no próximo tick
        setTimeout(() => resolve(manager), 0);
    });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProjectManager', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        document.body.innerHTML = '';
    });

    // -------------------------------------------------------------------------
    // Test 1: filterProjects('all') — Mostra todos os projetos
    // -------------------------------------------------------------------------
    test('filterProjects("all") deve mostrar todos os projetos', async () => {
        const manager = await createManagerWithMockData();

        manager.filterProjects('all');

        const cards = document.querySelectorAll('.project-card');
        const visibleCards = [...cards].filter(
            card => card.style.display !== 'none'
        );

        expect(cards).toHaveLength(4);
        expect(visibleCards).toHaveLength(4);
    });

    // -------------------------------------------------------------------------
    // Test 2: filterProjects('machine-learning') — Filtra por categoria válida
    // -------------------------------------------------------------------------
    test('filterProjects("machine-learning") deve mostrar apenas projetos ML', async () => {
        const manager = await createManagerWithMockData();

        manager.filterProjects('machine-learning');

        const cards = document.querySelectorAll('.project-card');
        const visibleCards = [...cards].filter(
            card => card.style.display !== 'none'
        );
        const hiddenCards = [...cards].filter(
            card => card.style.display === 'none'
        );

        expect(visibleCards).toHaveLength(2);
        expect(hiddenCards).toHaveLength(2);

        // Verificar que os cards visíveis são de ML
        visibleCards.forEach(card => {
            expect(card.classList.contains('machine-learning')).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // Test 3: filterProjects('web-dev') — Categoria sem projetos
    // -------------------------------------------------------------------------
    test('filterProjects com categoria inexistente deve esconder todos os projetos', async () => {
        const manager = await createManagerWithMockData();

        manager.filterProjects('web-dev');

        const cards = document.querySelectorAll('.project-card');
        const visibleCards = [...cards].filter(
            card => card.style.display !== 'none'
        );

        expect(cards).toHaveLength(4);
        expect(visibleCards).toHaveLength(0);
    });

    // -------------------------------------------------------------------------
    // Test 4: loadProjects renderiza o número correto de cards
    // -------------------------------------------------------------------------
    test('loadProjects deve renderizar o número correto de project cards', async () => {
        const manager = await createManagerWithMockData();

        const cards = document.querySelectorAll('.project-card');
        expect(cards).toHaveLength(4);

        // Verificar que cada card tem título
        const titles = document.querySelectorAll('.project-title');
        expect(titles).toHaveLength(4);
        expect(titles[0].textContent).toBe('Projeto Data Analysis');
    });

    // -------------------------------------------------------------------------
    // Test 5: createProjectCard gera estrutura HTML correta
    // -------------------------------------------------------------------------
    test('createProjectCard deve gerar card com todos os elementos', async () => {
        const manager = await createManagerWithMockData();

        const card = manager.createProjectCard(MOCK_PROJECTS[0], 0);

        expect(card.classList.contains('project-card')).toBe(true);
        expect(card.classList.contains('data-analysis')).toBe(true);
        expect(card.querySelector('.project-title').textContent).toBe(
            'Projeto Data Analysis'
        );
        expect(card.querySelector('.project-description').textContent).toBe(
            'Desc 1'
        );
        expect(card.querySelectorAll('.project-tag')).toHaveLength(2);
        expect(card.querySelectorAll('.project-link')).toHaveLength(2);
    });

    // -------------------------------------------------------------------------
    // Test 6: Tratamento de erro no fetch
    // -------------------------------------------------------------------------
    test('deve exibir mensagem de erro quando fetch falha', async () => {
        setupDOM();

        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        new ProjectManager();

        // Aguardar o catch resolver
        await new Promise(resolve => setTimeout(resolve, 0));

        const errorMsg = document.querySelector('.error-message');
        expect(errorMsg).not.toBeNull();
        expect(errorMsg.textContent).toContain('Não foi possível carregar');

        consoleSpy.mockRestore();
    });
});
