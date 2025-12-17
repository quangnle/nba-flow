import { DiagramManager } from './diagram.js';
import { InfoPanel } from './infoPanel.js';
import { CrudPanel } from './crudPanel.js';

class App {
    constructor() {
        this.diagramManager = new DiagramManager();
        this.infoPanel = new InfoPanel();
        this.crudPanel = new CrudPanel(this.diagramManager);
        
        this.init();
    }

    async init() {
        // Load diagram data
        try {
            const response = await fetch('/api/diagram');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }
            const data = await response.json();
            
            // Initialize components
            this.diagramManager.init(data, (item, type) => {
                this.infoPanel.show(item, type);
                this.showInfoPanel();
            });
            
            this.infoPanel.init();
            this.crudPanel.init();
            
            // Setup UI controls
            this.setupControls();
        } catch (error) {
            console.error('Error initializing app:', error);
            alert('Error loading diagram data. Please refresh the page.');
        }
    }

    setupControls() {
        const tabDiagramBtn = document.getElementById('tab-diagram');
        const tabEditorBtn = document.getElementById('tab-editor');
        const diagramTab = document.getElementById('diagram-tab');
        const editorTab = document.getElementById('editor-tab');
        const togglePanelBtn = document.getElementById('toggle-panel');
        const infoPanel = document.getElementById('info-panel');

        // Tab switching
        tabDiagramBtn?.addEventListener('click', () => {
            this.switchTab('diagram');
        });

        tabEditorBtn?.addEventListener('click', () => {
            this.switchTab('editor');
        });

        // Toggle info panel từ nút bên trong panel
        togglePanelBtn?.addEventListener('click', () => {
            const resizer = document.getElementById('info-panel-resizer');
            infoPanel.classList.toggle('hidden');
            if (resizer) {
                resizer.classList.toggle('hidden');
            }
        });
    }

    switchTab(tabName) {
        const tabDiagramBtn = document.getElementById('tab-diagram');
        const tabEditorBtn = document.getElementById('tab-editor');
        const diagramTab = document.getElementById('diagram-tab');
        const editorTab = document.getElementById('editor-tab');

        if (tabName === 'diagram') {
            // Activate Diagram tab
            tabDiagramBtn.classList.add('bg-gray-700', 'border-b-2', 'border-blue-500');
            tabDiagramBtn.classList.remove('hover:bg-gray-700');
            tabEditorBtn.classList.remove('bg-gray-700', 'border-b-2', 'border-blue-500');
            tabEditorBtn.classList.add('hover:bg-gray-700');
            
            diagramTab.classList.remove('hidden');
            editorTab.classList.add('hidden');
        } else if (tabName === 'editor') {
            // Activate Editor tab
            tabEditorBtn.classList.add('bg-gray-700', 'border-b-2', 'border-blue-500');
            tabEditorBtn.classList.remove('hover:bg-gray-700');
            tabDiagramBtn.classList.remove('bg-gray-700', 'border-b-2', 'border-blue-500');
            tabDiagramBtn.classList.add('hover:bg-gray-700');
            
            editorTab.classList.remove('hidden');
            diagramTab.classList.add('hidden');
        }
    }

    showInfoPanel() {
        const infoPanel = document.getElementById('info-panel');
        const resizer = document.getElementById('info-panel-resizer');
        infoPanel.classList.remove('hidden');
        if (resizer) {
            resizer.classList.remove('hidden');
        }
    }
}

// Initialize app when DOM is ready
function initApp() {
    // Wait a bit to ensure SVG is rendered
    setTimeout(() => {
        new App();
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

