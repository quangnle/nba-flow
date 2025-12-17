import { DiagramManager } from './diagram.js';
import { InfoPanel } from './infoPanel.js';
import { SheetsManager } from './sheetsManager.js';
import { AddressSearch } from './addressSearch.js';
import { CrudPanel } from './crudPanel.js';

class App {
    constructor() {
        this.diagramManager = new DiagramManager();
        this.infoPanel = new InfoPanel();
        this.sheetsManager = new SheetsManager();
        this.addressSearch = new AddressSearch();
        this.crudPanel = new CrudPanel(this.diagramManager);
        this.diagramData = null;
        
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
            this.diagramData = await response.json();
            
            // Initialize components
            this.diagramManager.init(this.diagramData, (item, type) => {
                this.infoPanel.show(item, type);
                this.showInfoPanel();
            });
            
            // Initialize info panel with save callback
            this.infoPanel.init(async (item, type, oldName) => {
                await this.handleSave(item, type, oldName);
            });
            
            // Initialize Sheets Manager
            this.sheetsManager.init();
            
            // Initialize Address Search
            this.addressSearch.init(this.diagramData);
            
            this.crudPanel.init();
            
            // Setup UI controls
            this.setupControls();
        } catch (error) {
            console.error('Error initializing app:', error);
            alert('Error loading diagram data. Please refresh the page.');
        }
    }

    async handleSave(item, type, oldName) {
        if (type === 'node') {
            // Find and update node in diagram data
            const nodeIndex = this.diagramData.nodes.findIndex(n => n.node_name === oldName);
            if (nodeIndex !== -1) {
                this.diagramData.nodes[nodeIndex] = item;
            }
            
            // Update any links that reference the old node name
            if (oldName !== item.node_name) {
                this.diagramData.links.forEach(link => {
                    if (link.from === oldName) link.from = item.node_name;
                    if (link.to === oldName) link.to = item.node_name;
                });
            }
        } else if (type === 'link') {
            // Find and update link in diagram data
            const linkIndex = this.diagramData.links.findIndex(l => l.name === oldName);
            if (linkIndex !== -1) {
                this.diagramData.links[linkIndex] = item;
            }
        }
        
        // Save to server
        await this.saveDiagram();
        
        // Refresh diagram
        this.diagramManager.updateData(this.diagramData);
    }

    async saveDiagram() {
        const response = await fetch('/api/diagram', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.diagramData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save diagram');
        }
        
        return response.json();
    }

    setupControls() {
        const tabDiagramBtn = document.getElementById('tab-diagram');
        const tabEditorBtn = document.getElementById('tab-editor');
        const tabSheetsBtn = document.getElementById('tab-sheets');
        const tabSearchBtn = document.getElementById('tab-search');
        const togglePanelBtn = document.getElementById('toggle-panel');
        const infoPanel = document.getElementById('info-panel');

        // Tab switching
        tabDiagramBtn?.addEventListener('click', () => {
            this.switchTab('diagram');
        });

        tabEditorBtn?.addEventListener('click', () => {
            this.switchTab('editor');
        });

        tabSheetsBtn?.addEventListener('click', () => {
            this.switchTab('sheets');
        });

        tabSearchBtn?.addEventListener('click', () => {
            this.switchTab('search');
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
        const tabSheetsBtn = document.getElementById('tab-sheets');
        const tabSearchBtn = document.getElementById('tab-search');
        const diagramTab = document.getElementById('diagram-tab');
        const editorTab = document.getElementById('editor-tab');
        const sheetsTab = document.getElementById('sheets-tab');
        const searchTab = document.getElementById('search-tab');

        // Remove active from all tabs
        [tabDiagramBtn, tabEditorBtn, tabSheetsBtn, tabSearchBtn].forEach(btn => {
            if (btn) {
                btn.classList.remove('bg-gray-700', 'border-b-2', 'border-blue-500');
                btn.classList.add('hover:bg-gray-700');
            }
        });

        // Hide all tab contents
        [diagramTab, editorTab, sheetsTab, searchTab].forEach(tab => {
            if (tab) tab.classList.add('hidden');
        });

        // Activate selected tab
        if (tabName === 'diagram') {
            tabDiagramBtn?.classList.add('bg-gray-700', 'border-b-2', 'border-blue-500');
            tabDiagramBtn?.classList.remove('hover:bg-gray-700');
            diagramTab?.classList.remove('hidden');
        } else if (tabName === 'editor') {
            tabEditorBtn?.classList.add('bg-gray-700', 'border-b-2', 'border-blue-500');
            tabEditorBtn?.classList.remove('hover:bg-gray-700');
            editorTab?.classList.remove('hidden');
        } else if (tabName === 'sheets') {
            tabSheetsBtn?.classList.add('bg-gray-700', 'border-b-2', 'border-blue-500');
            tabSheetsBtn?.classList.remove('hover:bg-gray-700');
            sheetsTab?.classList.remove('hidden');
        } else if (tabName === 'search') {
            tabSearchBtn?.classList.add('bg-gray-700', 'border-b-2', 'border-blue-500');
            tabSearchBtn?.classList.remove('hover:bg-gray-700');
            searchTab?.classList.remove('hidden');
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
