export class InfoPanel {
    constructor() {
        this.contentElement = null;
        this.panelElement = null;
        this.resizerElement = null;
        this.isResizing = false;
        this.startX = 0;
        this.startWidth = 0;
        this.currentNode = null;
        this.currentLink = null;
        this.currentType = null;
        this.selectedAddressIdx = null;
        this.onSaveCallback = null;
        this.allResources = [];

        // Bind methods to preserve reference for event listeners
        this.handleResize = this.handleResize.bind(this);
        this.stopResize = this.stopResize.bind(this);
    }

    init(onSaveCallback) {
        this.contentElement = document.getElementById('info-content');
        this.panelElement = document.getElementById('info-panel');
        this.resizerElement = document.getElementById('info-panel-resizer');
        this.onSaveCallback = onSaveCallback;

        // Load saved width from localStorage
        const savedWidth = localStorage.getItem('infoPanelWidth');
        if (savedWidth && this.panelElement) {
            this.panelElement.style.width = savedWidth + 'px';
        }

        // Setup resize functionality
        this.setupResize();

        // Load resources data
        this.loadResources();

        // Inject custom styles
        this.injectStyles();
    }

    async loadResources() {
        try {
            const response = await fetch('/api/diagram');
            if (response.ok) {
                const data = await response.json();
                if (data.resources) {
                    this.allResources = data.resources;
                }
            }
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    }

    injectStyles() {
        if (document.getElementById('info-panel-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'info-panel-styles';
        styles.textContent = `
            /* Token Badge Colors */
            .token-badge {
                display: inline-flex;
                align-items: center;
                padding: 2px 8px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .token-wbtc { background: linear-gradient(135deg, #f7931a 0%, #c77800 100%); color: white; }
            .token-weth { background: linear-gradient(135deg, #627eea 0%, #3c5bd8 100%); color: white; }
            .token-arb { background: linear-gradient(135deg, #28a0f0 0%, #1a7fc7 100%); color: white; }
            .token-usdc, .token-usdc-e { background: linear-gradient(135deg, #2775ca 0%, #1a5ca0 100%); color: white; }
            .token-usdt { background: linear-gradient(135deg, #26a17b 0%, #1a8065 100%); color: white; }
            .token-default { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; }
            
            /* Strategy Label Badge */
            .strategy-badge {
                display: inline-flex;
                align-items: center;
                padding: 3px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
            }
            .strategy-1 { background: #dbeafe; color: #1e40af; }
            .strategy-2 { background: #dcfce7; color: #166534; }
            .strategy-3 { background: #fef3c7; color: #92400e; }
            .strategy-4 { background: #fce7f3; color: #9d174d; }
            .strategy-5 { background: #e0e7ff; color: #3730a3; }
            .strategy-6 { background: #f3e8ff; color: #6b21a8; }
            
            /* Farm Badge */
            .farm-badge {
                display: inline-flex;
                align-items: center;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
            }
            .farm-1 { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
            .farm-2 { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
            
            /* Card Styles */
            .info-card {
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                overflow: hidden;
                margin-bottom: 16px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                transition: box-shadow 0.2s;
            }
            .info-card:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .info-card-header {
                background: linear-gradient(to right, #f8fafc, #f1f5f9);
                padding: 12px 16px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .info-card-body {
                padding: 0;
            }
            
            /* Address Row Styles */
            .address-item {
                padding: 14px 16px;
                border-bottom: 1px solid #f3f4f6;
                transition: background 0.15s;
                cursor: pointer;
            }
            .address-item:last-child {
                border-bottom: none;
            }
            .address-item:hover {
                background: #f8fafc;
            }
            .address-item.expanded {
                background: #f1f5f9;
            }
            
            /* Address Text */
            .address-text {
                font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
                font-size: 12px;
                color: #374151;
                background: #f3f4f6;
                padding: 4px 8px;
                border-radius: 4px;
                word-break: break-all;
            }
            .address-text:hover {
                background: #e5e7eb;
            }
            
            /* Pool Pair Display */
            .pool-pair {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                color: white;
            }
            .pool-pair .divider {
                color: #94a3b8;
            }
            
            /* Meta Info Grid */
            .meta-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
                margin-top: 10px;
            }
            .meta-item {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .meta-label {
                font-size: 10px;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .meta-value {
                font-size: 12px;
                color: #374151;
                font-weight: 500;
            }
            
            /* Search Input */
            .search-input {
                width: 100%;
                padding: 10px 14px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 13px;
                outline: none;
                transition: all 0.2s;
                background: #f9fafb;
            }
            .search-input:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                background: white;
            }
            
            /* Stats Bar */
            .stats-bar {
                display: flex;
                gap: 16px;
                padding: 12px 16px;
                background: linear-gradient(to right, #1e293b, #334155);
                border-radius: 8px;
                margin-bottom: 16px;
            }
            .stat-item {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .stat-value {
                font-size: 18px;
                font-weight: 700;
                color: white;
            }
            .stat-label {
                font-size: 10px;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            /* Arbiscan Link */
            .arbiscan-link {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                color: #3b82f6;
                font-size: 11px;
                text-decoration: none;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            .arbiscan-link:hover {
                opacity: 1;
                text-decoration: underline;
            }
            
            /* Scrollbar Styles */
            .info-scroll::-webkit-scrollbar {
                width: 6px;
            }
            .info-scroll::-webkit-scrollbar-track {
                background: #f1f5f9;
            }
            .info-scroll::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;
            }
            .info-scroll::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
            
            /* Node Type Badge */
            .node-type-badge {
                display: inline-flex;
                align-items: center;
                padding: 3px 10px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 500;
            }
            .type-contract { background: #dbeafe; color: #1d4ed8; }
            .type-address { background: #f3e8ff; color: #7c3aed; }
            
            /* Link Arrow */
            .link-arrow {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                border-radius: 50%;
                color: white;
            }
            
            /* Panel Tabs */
            .panel-tabs {
                display: flex;
                gap: 0;
                background: #f1f5f9;
                border-radius: 10px;
                padding: 4px;
                margin-bottom: 16px;
            }
            .panel-tab {
                flex: 1;
                padding: 10px 16px;
                border: none;
                background: transparent;
                font-size: 13px;
                font-weight: 600;
                color: #64748b;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            .panel-tab:hover {
                color: #334155;
                background: rgba(255,255,255,0.5);
            }
            .panel-tab.active {
                background: white;
                color: #1e293b;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .panel-tab svg {
                width: 16px;
                height: 16px;
            }
            
            /* Edit Form Styles */
            .edit-form {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .form-label {
                font-size: 12px;
                font-weight: 600;
                color: #374151;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .form-input {
                padding: 10px 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 13px;
                outline: none;
                transition: all 0.2s;
                background: white;
                font-family: inherit;
            }
            .form-input:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            .form-input.mono {
                font-family: 'JetBrains Mono', 'SF Mono', monospace;
                font-size: 12px;
            }
            .form-select {
                padding: 10px 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 13px;
                outline: none;
                transition: all 0.2s;
                background: white;
                cursor: pointer;
            }
            .form-select:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            /* Address Edit Card */
            .address-edit-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                padding: 16px;
                margin-bottom: 12px;
                position: relative;
            }
            .address-edit-card:hover {
                border-color: #cbd5e1;
            }
            .address-edit-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid #f3f4f6;
            }
            .address-edit-title {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
            }
            .address-edit-actions {
                display: flex;
                gap: 8px;
            }
            .btn-icon {
                width: 28px;
                height: 28px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.15s;
            }
            .btn-icon svg {
                width: 14px;
                height: 14px;
            }
            .btn-icon-delete {
                background: #fef2f2;
                color: #dc2626;
            }
            .btn-icon-delete:hover {
                background: #fee2e2;
            }
            .btn-icon-duplicate {
                background: #f0fdf4;
                color: #16a34a;
            }
            .btn-icon-duplicate:hover {
                background: #dcfce7;
            }
            
            /* Form Grid */
            .form-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }
            .form-grid-full {
                grid-column: span 2;
            }
            
            /* Buttons */
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            .btn-primary {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
            }
            .btn-primary:hover {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
            }
            .btn-secondary {
                background: #f1f5f9;
                color: #475569;
            }
            .btn-secondary:hover {
                background: #e2e8f0;
            }
            .btn-success {
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
            }
            .btn-success:hover {
                background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            }
            .btn-danger {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
            }
            .btn-danger:hover {
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            }
            .btn-outline {
                background: transparent;
                border: 2px dashed #cbd5e1;
                color: #64748b;
            }
            .btn-outline:hover {
                border-color: #3b82f6;
                color: #3b82f6;
                background: rgba(59, 130, 246, 0.05);
            }
            
            /* Button Group */
            .btn-group {
                display: flex;
                gap: 12px;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
            }
            
            /* Toast Notification */
            .toast {
                position: fixed;
                bottom: 24px;
                right: 24px;
                padding: 12px 20px;
                border-radius: 10px;
                font-size: 13px;
                font-weight: 500;
                color: white;
                z-index: 9999;
                animation: slideIn 0.3s ease-out;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .toast-success {
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            }
            .toast-error {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }
            .toast svg {
                width: 18px;
                height: 18px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.95); }
            }
            
            /* Collapsible Section */
            .collapsible-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background: #f8fafc;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.15s;
            }
            .collapsible-header:hover {
                background: #f1f5f9;
            }
            .collapsible-title {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
            }
            .collapsible-icon {
                transition: transform 0.2s;
            }
            .collapsible-icon.open {
                transform: rotate(180deg);
            }
            .collapsible-content {
                padding: 16px 0;
            }
            
            /* Resources Tab Styles */
            .resources-view {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .resource-card {
                animation: fadeIn 0.2s ease-out;
            }
            
            .resource-card .info-card-header {
                flex-direction: column;
                gap: 8px;
            }
            
            .space-y-2 > * + * {
                margin-top: 8px;
            }
        `;
        document.head.appendChild(styles);
    }

    setupResize() {
        if (!this.resizerElement || !this.panelElement) return;

        this.resizerElement.addEventListener('mousedown', (e) => {
            this.isResizing = true;
            this.startX = e.clientX;
            this.startWidth = this.panelElement.offsetWidth;

            document.addEventListener('mousemove', this.handleResize);
            document.addEventListener('mouseup', this.stopResize);

            e.preventDefault();
        });
    }

    handleResize(e) {
        if (!this.isResizing || !this.panelElement) return;

        const diff = this.startX - e.clientX;
        const newWidth = this.startWidth + diff;

        const container = this.panelElement.parentElement;
        const containerWidth = container.offsetWidth;
        const minWidth = 200;
        const maxWidth = containerWidth * 0.8;

        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

        this.panelElement.style.width = constrainedWidth + 'px';
    }

    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;

            if (this.panelElement) {
                localStorage.setItem('infoPanelWidth', this.panelElement.offsetWidth);
            }

            document.removeEventListener('mousemove', this.handleResize);
            document.removeEventListener('mouseup', this.stopResize);
        }
    }

    getTokenBadgeClass(token) {
        if (!token) return 'token-default';
        const t = token.toLowerCase().replace('.', '-');
        if (t.includes('wbtc')) return 'token-wbtc';
        if (t.includes('weth') || t === 'eth') return 'token-weth';
        if (t.includes('arb')) return 'token-arb';
        if (t.includes('usdc')) return 'token-usdc';
        if (t.includes('usdt')) return 'token-usdt';
        return 'token-default';
    }

    getStrategyBadgeClass(label) {
        if (!label) return '';
        const num = label.match(/\d+/);
        if (num) return `strategy-${num[0]}`;
        return '';
    }

    getFarmBadgeClass(farm) {
        if (!farm) return '';
        if (farm.includes('1')) return 'farm-1';
        if (farm.includes('2')) return 'farm-2';
        return '';
    }

    getPoolBadgeStyle(label) {
        if (!label) return 'background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;';

        const l = label.toLowerCase();
        if (l.includes('wbtc') && l.includes('weth')) {
            return 'background: #fef3c7; color: #92400e; border: 1px solid #fcd34d;'; // Orange/Amber
        }
        if (l.includes('arb') && (l.includes('usdc') || l.includes('usdce'))) {
            return 'background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd;'; // Blue
        }
        if (l.includes('weth') && l.includes('arb')) {
            return 'background: #dcfce7; color: #166534; border: 1px solid #86efac;'; // Green
        }
        if (l.includes('usdc') && l.includes('usdt')) {
            return 'background: #fce7f3; color: #9d174d; border: 1px solid #f9a8d4;'; // Pink
        }
        if (l.includes('weth') && (l.includes('usdc') || l.includes('usdce'))) {
            return 'background: #e0e7ff; color: #3730a3; border: 1px solid #a5b4fc;'; // Indigo
        }

        return 'background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;'; // Default light gray
    }

    getLabelBadgeStyle(label) {
        if (!label) return 'background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;';

        const l = label.toLowerCase();
        // Check if it's a Strategy label
        if (l.includes('strategy')) return null; // Use default strategy badge class

        // Fund Manager - Teal color
        if (l.includes('fund manager')) {
            return 'background: #ccfbf1; color: #0f766e; border: 1px solid #5eead4;';
        }

        // Fee Collector - Violet color
        if (l.includes('fee collector')) {
            return 'background: #ede9fe; color: #6d28d9; border: 1px solid #c4b5fd;';
        }

        // Unknown/discontinued - Gray color
        if (l.includes('unknown') || l.includes('discontinued')) {
            return 'background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1;';
        }

        // Check if it's a Pool label
        if (l.includes('wbtc') || l.includes('weth') || l.includes('arb') ||
            l.includes('usdc') || l.includes('usdt')) {
            return this.getPoolBadgeStyle(label);
        }

        // Default light style for other labels
        return 'background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;';
    }

    show(item, type) {
        if (!this.contentElement) return;

        this.currentType = type;
        if (type === 'node') {
            this.currentNode = item;
            this.currentLink = null;
            this.showNodeWithTabs(item);
        } else if (type === 'link') {
            this.currentLink = item;
            this.currentNode = null;
            this.showLinkWithTabs(item);
        }
    }

    showNodeWithTabs(node) {
        // Reset selected address when showing tabs
        this.selectedAddressIdx = null;

        let html = `
            <div class="panel-tabs">
                <button class="panel-tab active" data-tab="view">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View
                </button>
                <button class="panel-tab" data-tab="edit">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit
                </button>
            </div>
            <div id="tab-view-content">${this.renderNodeView(node)}</div>
            <div id="tab-edit-content" style="display: none;">${this.renderNodeEdit(node)}</div>
        `;

        this.contentElement.innerHTML = html;
        this.setupTabSwitching();
        this.setupSearch(node.addresses);
    }

    showLinkWithTabs(link) {
        let html = `
            <div class="panel-tabs">
                <button class="panel-tab active" data-tab="view">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View
                </button>
                <button class="panel-tab" data-tab="edit">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit
                </button>
            </div>
            <div id="tab-view-content">${this.renderLinkView(link)}</div>
            <div id="tab-edit-content" style="display: none;">${this.renderLinkEdit(link)}</div>
        `;

        this.contentElement.innerHTML = html;
        this.setupTabSwitching();
    }

    setupTabSwitching() {
        const tabs = this.contentElement.querySelectorAll('.panel-tab');
        const viewContent = document.getElementById('tab-view-content');
        const editContent = document.getElementById('tab-edit-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Hide all tabs first
                viewContent.style.display = 'none';
                editContent.style.display = 'none';

                if (tab.dataset.tab === 'view') {
                    viewContent.style.display = 'block';
                } else if (tab.dataset.tab === 'edit') {
                    editContent.style.display = 'block';
                    this.setupEditForm();
                }
            });
        });
    }

    renderNodeView(node) {
        const nodeTypeClass = node.node_type === 'contract' ? 'type-contract' : 'type-address';

        let html = `
            <div class="mb-6">
                <div class="flex items-center gap-3 mb-3">
                    <h3 class="text-xl font-bold text-gray-900">${node.node_name}</h3>
                    <span class="node-type-badge ${nodeTypeClass}">${node.node_type}</span>
            </div>
        `;

        // Show description if available (with markdown support)
        if (node.description) {
            const renderedDescription = typeof marked !== 'undefined' ? marked.parse(node.description) : node.description;
            html += `
                <div class="node-description mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-sm text-gray-700 rounded-r">
                    <div class="markdown-content">${renderedDescription}</div>
                </div>
            `;
        }

        if (node.addresses && node.addresses.length > 0) {
            html += `
                <div class="stats-bar">
                    <div class="stat-item">
                        <span class="stat-value">${node.addresses.length}</span>
                        <span class="stat-label">Total Addresses</span>
                    </div>
            `;

            if (node.node_name === 'Strategies') {
                const uniquePools = new Set(node.addresses.map(a => a.pool).filter(Boolean));
                const uniqueFarms = new Set(node.addresses.map(a => a.farm).filter(Boolean));
                html += `
                    <div class="stat-item">
                        <span class="stat-value">${uniquePools.size}</span>
                        <span class="stat-label">Pool Types</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${uniqueFarms.size}</span>
                        <span class="stat-label">Farms</span>
                    </div>
                `;
            }

            html += `</div>`;

            html += `
                <div class="mb-4">
                    <input type="text" 
                           class="search-input" 
                           placeholder="🔍 Search addresses, tokens, or pools..."
                           id="address-search">
                </div>
            `;

            html += `
                <div class="info-card">
                    <div class="info-card-header">
                        <span class="text-sm font-semibold text-gray-700">Addresses</span>
                        <span class="text-xs text-gray-500" id="address-count">${node.addresses.length} items</span>
                                </div>
                    <div class="info-card-body info-scroll" style="max-height: 500px; overflow-y: auto;">
                    `;

            node.addresses.forEach((address, idx) => {
                html += this.renderAddressItem(address, idx);
            });

            html += `
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="info-card">
                    <div class="info-card-body p-6 text-center text-gray-500">
                        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                        </svg>
                        <p class="text-sm">No addresses configured</p>
                    </div>
                </div>
            `;
        }

        html += `</div>`;
        return html;
    }

    renderNodeEdit(node) {
        // Show address selection view if no address is selected
        if (this.selectedAddressIdx === null) {
            return this.renderAddressSelectionView(node);
        }

        // Show edit form for selected address
        return this.renderSelectedAddressEditForm(node);
    }

    renderAddressSelectionView(node) {
        let html = `
            <div class="edit-form">
                <div class="info-card">
                    <div class="info-card-body" style="padding: 16px;">
                        <input type="text" 
                               class="search-input" 
                               id="selection-search-input"
                               placeholder="🔍 Search by address, label, token, pool...">
                    </div>
                </div>

                <div class="info-card">
                    <div class="info-card-header">
                        <span class="text-sm font-semibold text-gray-700">Select Item to Edit</span>
                        <span class="text-xs text-gray-500" id="selection-count">${node.addresses?.length || 0} items</span>
                    </div>
                    <div class="info-card-body info-scroll" id="selection-items-container" style="max-height: 350px; overflow-y: auto;">
        `;

        if (node.addresses && node.addresses.length > 0) {
            node.addresses.forEach((addr, idx) => {
                html += this.renderAddressSelectionItem(addr, idx);
            });
        } else {
            html += `<p class="text-sm text-gray-500 text-center py-8">No addresses available</p>`;
        }

        html += `
                                </div>
                </div>

                <div class="info-card">
                    <div class="info-card-body" style="padding: 16px;">
                        <button class="btn btn-outline w-full" id="add-address-btn">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Add New Item
                        </button>
                    </div>
                </div>

                <div class="btn-group">
                    <button class="btn btn-secondary flex-1" id="cancel-edit-btn">Back to View</button>
                </div>
            </div>
        `;

        return html;
    }

    renderAddressSelectionItem(addr, idx) {
        let html = `
            <div class="address-selection-item" 
                 data-idx="${idx}" 
                 data-address="${(addr.address || '').toLowerCase()}"
                 data-label="${(addr.label || '').toLowerCase()}"
                 data-token0="${(addr.token0 || '').toLowerCase()}"
                 data-token1="${(addr.token1 || '').toLowerCase()}"
                 data-pool="${(addr.pool || '').toLowerCase()}"
                 data-farm="${(addr.farm || '').toLowerCase()}">
                <div class="flex items-center gap-3 cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
        `;

        if (addr.label) {
            const strategyClass = this.getStrategyBadgeClass(addr.label);
            if (strategyClass) {
                html += `<span class="strategy-badge ${strategyClass}">${addr.label}</span>`;
            } else {
                const labelStyle = this.getLabelBadgeStyle(addr.label);
                html += `<span class="strategy-badge" style="${labelStyle}">${addr.label}</span>`;
            }
        }

        if (addr.farm) {
            const farmClass = this.getFarmBadgeClass(addr.farm);
            html += `<span class="farm-badge ${farmClass}">${addr.farm}</span>`;
        }

        if (addr.strategy) {
            const stratClass = this.getStrategyBadgeClass(addr.strategy);
            html += `<span class="strategy-badge ${stratClass}">${addr.strategy}</span>`;
        }

        if (addr.pool || (addr.token0 && addr.token1)) {
            const t0 = addr.token0 || '';
            const t1 = addr.token1 || '';
            html += `
                <div class="pool-pair">
                    <span class="token-badge ${this.getTokenBadgeClass(t0)}">${t0}</span>
                    <span class="divider">/</span>
                    <span class="token-badge ${this.getTokenBadgeClass(t1)}">${t1}</span>
                </div>
            `;
        }

        html += `
                        </div>
                        <div class="address-text" style="margin-top: 8px;">${addr.address}</div>
                    </div>
                    <div class="flex-shrink-0">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    renderSelectedAddressEditForm(node) {
        const addr = node.addresses[this.selectedAddressIdx];

        let html = `
            <div class="edit-form">
                <div class="info-card">
                    <div class="info-card-header" style="display: flex; align-items: center; justify-content: space-between;">
                        <div class="flex items-center gap-2" style="flex: 1;">
                            <button id="back-to-selection-btn" class="text-gray-600 hover:text-gray-900 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <span class="text-sm font-semibold text-gray-700">Item #${this.selectedAddressIdx + 1}</span>
                        </div>
                        <div class="address-edit-actions">
                            <button class="btn-icon btn-icon-duplicate" title="Duplicate" id="dup-address-btn">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                            </button>
                            <button class="btn-icon btn-icon-delete" title="Delete" id="del-address-btn">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="info-card-body" style="padding: 16px;">
                        <div class="form-grid">
                            <div class="form-group form-grid-full">
                                <label class="form-label">Address</label>
                                <input type="text" class="form-input mono" id="edit-addr-address" value="${addr.address || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Label</label>
                                <input type="text" class="form-input" id="edit-addr-label" value="${addr.label || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Farm</label>
                                <select class="form-select" id="edit-addr-farm">
                                    <option value="">-- Select --</option>
                                    <option value="Farm 1" ${addr.farm === 'Farm 1' ? 'selected' : ''}>Farm 1</option>
                                    <option value="Farm 2" ${addr.farm === 'Farm 2' ? 'selected' : ''}>Farm 2</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Token 0</label>
                                <input type="text" class="form-input" id="edit-addr-token0" value="${addr.token0 || ''}" placeholder="e.g. WETH">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Token 1</label>
                                <input type="text" class="form-input" id="edit-addr-token1" value="${addr.token1 || ''}" placeholder="e.g. USDC">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Pool</label>
                                <input type="text" class="form-input" id="edit-addr-pool" value="${addr.pool || ''}" placeholder="e.g. WETH / USDC">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Fee</label>
                                <input type="text" class="form-input" id="edit-addr-fee" value="${addr.fee || ''}" placeholder="e.g. 0.05%">
                            </div>
                            <div class="form-group form-grid-full">
                                <label class="form-label">Description</label>
                                <input type="text" class="form-input" id="edit-addr-description" value="${addr.description || ''}">
                            </div>
                            <div class="form-group form-grid-full">
                                <label class="form-label">Network</label>
                                <input type="text" class="form-input" id="edit-addr-network" value="${addr.network || ''}" placeholder="e.g. Arbitrum">
                            </div>
                            <div class="form-group form-grid-full">
                                <label class="form-label">Type</label>
                                <input type="text" class="form-input" id="edit-addr-type" value="${addr.type || ''}" placeholder="e.g. Fee Address">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="btn-group">
                    <button class="btn btn-primary flex-1" id="save-address-btn">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Save Item
                    </button>
                    <button class="btn btn-secondary" id="cancel-address-edit-btn">Cancel</button>
                </div>
            </div>
        `;

        return html;
    }

    renderAddressEditCard(addr, idx) {
        return `
            <div class="address-edit-card" data-idx="${idx}">
                <div class="address-edit-header">
                    <span class="address-edit-title">Address #${idx + 1}</span>
                    <div class="address-edit-actions">
                        <button class="btn-icon btn-icon-duplicate" title="Duplicate" data-action="duplicate" data-idx="${idx}">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon btn-icon-delete" title="Delete" data-action="delet  e" data-idx="${idx}">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group form-grid-full">
                        <label class="form-label">Address</label>
                        <input type="text" class="form-input mono" data-field="address" value="${addr.address || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Label</label>
                        <input type="text" class="form-input" data-field="label" value="${addr.label || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Farm</label>
                        <select class="form-select" data-field="farm">
                            <option value="">-- Select --</option>
                            <option value="Farm 1" ${addr.farm === 'Farm 1' ? 'selected' : ''}>Farm 1</option>
                            <option value="Farm 2" ${addr.farm === 'Farm 2' ? 'selected' : ''}>Farm 2</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Token 0</label>
                        <input type="text" class="form-input" data-field="token0" value="${addr.token0 || ''}" placeholder="e.g. WETH">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Token 1</label>
                        <input type="text" class="form-input" data-field="token1" value="${addr.token1 || ''}" placeholder="e.g. USDC">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Pool</label>
                        <input type="text" class="form-input" data-field="pool" value="${addr.pool || ''}" placeholder="e.g. WETH / USDC">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fee</label>
                        <input type="text" class="form-input" data-field="fee" value="${addr.fee || ''}" placeholder="e.g. 0.05%">
                    </div>
                    <div class="form-group form-grid-full">
                        <label class="form-label">Description</label>
                        <input type="text" class="form-input" data-field="description" value="${addr.description || ''}">
                    </div>
                </div>
            </div>
        `;
    }

    renderNodeResources(node) {
        const relatedResources = this.allResources.filter(r =>
            r.relatedNodes.includes(node.node_name)
        );

        let html = `
            <div class="resources-view">
                <div class="mb-4">
                    <input type="text" 
                           class="search-input" 
                           id="resources-search-input"
                           placeholder="🔍 Search by name, tags, category...">
                </div>
        `;

        if (relatedResources.length > 0) {
            relatedResources.forEach(resource => {
                html += this.renderResourceCard(resource);
            });
        } else {
            html += `
                <div class="text-center py-8">
                    <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path>
                    </svg>
                    <p class="text-sm text-gray-500">No resources related to this node</p>
                </div>
            `;
        }

        html += `</div>`;
        return html;
    }

    renderLinkResources(link) {
        const relatedResources = this.allResources.filter(r =>
            r.relatedLinks.includes(link.name)
        );

        let html = `
            <div class="resources-view">
                <div class="mb-4">
                    <input type="text" 
                           class="search-input" 
                           id="resources-search-input"
                           placeholder="🔍 Search by name, tags, category...">
                </div>
        `;

        if (relatedResources.length > 0) {
            relatedResources.forEach(resource => {
                html += this.renderResourceCard(resource);
            });
        } else {
            html += `
                <div class="text-center py-8">
                    <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path>
                    </svg>
                    <p class="text-sm text-gray-500">No resources related to this link</p>
                </div>
            `;
        }

        html += `</div>`;
        return html;
    }

    renderResourceCard(resource) {
        return `
            <div class="resource-card" data-category="${resource.category.toLowerCase()}" data-tags="${resource.tags.join(',')}">
                <div class="info-card">
                    <div class="info-card-header">
                        <div>
                            <span class="text-sm font-semibold text-gray-700">${resource.name}</span>
                            <div class="text-xs text-gray-500 mt-1">${resource.category}</div>
                        </div>
                    </div>
                    <div class="info-card-body" style="padding: 16px;">
                        <p class="text-sm text-gray-600 mb-3">${resource.description}</p>
                        
                        <div class="mb-3">
                            <span class="text-xs font-semibold text-gray-700">Files:</span>
                            <div class="space-y-2 mt-2">
                                ${resource.files.map(f => {
            const isCSV = f.file.endsWith('.csv');
            return isCSV
                ? `
                                            <div class="flex items-center gap-2">
                                                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                <button class="csv-preview-btn text-blue-600 hover:underline text-sm" data-file="${f.file}" data-name="${f.name}" style="border: none; background: none; cursor: pointer; text-align: left; padding: 0; font: inherit;">
                                                    📊 ${f.name} [Preview]
                                                </button>
                                            </div>
                                        `
                : `
                                            <div class="flex items-center gap-2">
                                                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                <a href="./NBA Auditing/${f.file}" target="_blank" class="text-blue-600 hover:underline text-sm">
                                                    📄 ${f.name}
                                                </a>
                                            </div>
                                        `;
        }).join('')}
                            </div>
                        </div>
                        
                        <div class="flex flex-wrap gap-2">
                            ${resource.tags.map(tag => `
                                <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                    #${tag}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    </div>
                </div>
            `;
    }

    setupResourcesTab() {
        const searchInput = document.getElementById('resources-search-input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const cards = this.contentElement.querySelectorAll('.resource-card');

            cards.forEach(card => {
                const category = card.dataset.category || '';
                const tags = (card.dataset.tags || '').toLowerCase();
                const text = card.textContent.toLowerCase();

                const matches = !query ||
                    category.includes(query) ||
                    tags.includes(query) ||
                    text.includes(query);

                card.style.display = matches ? '' : 'none';
            });
        });

        // Setup CSV viewers
        this.setupCSVViewers();
    }

    setupCSVViewers() {
        const csvBtns = document.querySelectorAll('.csv-preview-btn');

        csvBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const file = btn.dataset.file;
                const name = btn.dataset.name;

                try {
                    // Fetch the CSV file - file path is like "NBA Auditing - gas_cost_per_strategy.csv"
                    // We need to fetch from root with proper escaping for spaces
                    let csvText;

                    try {
                        const response = await fetch(`./${file}`);
                        if (response.ok) {
                            csvText = await response.text();
                        } else {
                            throw new Error('Not found');
                        }
                    } catch (e) {
                        // Fallback: try with NBA Auditing folder path
                        const fileName = file.replace(/^NBA Auditing - /, '');
                        const response2 = await fetch(`./NBA Auditing/${fileName}`);
                        if (response2.ok) {
                            csvText = await response2.text();
                        } else {
                            this.showToast('CSV file not found', 'error');
                            return;
                        }
                    }


                    // Use PapaParse if available, otherwise use simple parser
                    let data;
                    if (typeof Papa !== 'undefined') {
                        const results = Papa.parse(csvText, {
                            header: false,
                            dynamicTyping: false,
                            skipEmptyLines: true
                        });
                        data = results.data;
                    } else {
                        // Simple fallback CSV parser
                        data = this.simpleCSVParser(csvText);
                    }

                    this.showCSVModal(data, name);
                } catch (error) {
                    console.error('Error loading CSV:', error);
                    this.showToast('Failed to load CSV file', 'error');
                }
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    simpleCSVParser(csvText) {
        const rows = [];
        const lines = csvText.split('\n');

        for (let line of lines) {
            if (!line.trim()) continue;

            const row = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];

                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    row.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            row.push(current.trim());

            rows.push(row);
        }

        return rows;
    }

    showCSVModal(data, name) {
        const modal = document.getElementById('csv-modal');
        const title = document.getElementById('csv-modal-title');
        const content = document.getElementById('csv-modal-content');
        const closeBtn = document.getElementById('csv-modal-close');

        title.textContent = name;

        // Build table
        let html = `<div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: 'Courier New', monospace;">
                <thead>
                    <tr style="background: linear-gradient(to right, #1e293b, #334155); color: white; position: sticky; top: 0; z-index: 10;">`;

        // Header row
        if (data.length > 0) {
            data[0].forEach((cell, idx) => {
                html += `<th style="padding: 12px; text-align: left; font-weight: 600; border-right: 1px solid #cbd5e1; min-width: 140px; white-space: nowrap;">${this.escapeHtml(cell || '')}</th>`;
            });
        }

        html += `</tr></thead><tbody>`;

        // Data rows
        for (let i = 1; i < data.length; i++) {
            if (!data[i].some(cell => cell !== '')) continue; // Skip empty rows

            html += `<tr style="border-bottom: 1px solid #e5e7eb;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">`;
            data[i].forEach((cell, idx) => {
                const isNumber = !isNaN(parseFloat(cell)) && cell !== '';
                const cellStyle = isNumber ? 'text-align: right; color: #0ea5e9; font-weight: 500;' : '';
                html += `<td style="padding: 8px 12px; ${cellStyle} border-right: 1px solid #f3f4f6; word-break: break-word;">${this.escapeHtml(cell || '')}</td>`;
            });
            html += `</tr>`;
        }

        html += `</tbody></table></div>`;
        content.innerHTML = html;

        modal.style.display = 'flex';

        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    renderLinkView(link) {
        // Parse description to extract step number if present (e.g., "[1] Some text")
        const stepMatch = link.description ? link.description.match(/^\[(\d+[a-z]?)\]\s*/) : null;
        const stepNumber = stepMatch ? stepMatch[1] : null;
        const descriptionText = stepMatch ? link.description.replace(stepMatch[0], '') : (link.description || 'No description provided');

        // Determine link type badge
        const linkTypeBadge = link.link_type
            ? `<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">${link.link_type}</span>`
            : '';

        // Determine line style badge  
        const lineStyleBadge = link.line_style
            ? `<span class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">${link.line_style}</span>`
            : '';

        return `
            <div class="mb-6">
                <div class="flex items-center gap-3 mb-4">
                    <h3 class="text-xl font-bold text-gray-900">${link.name || 'Connection'}</h3>
                    ${stepNumber ? `<span class="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 font-bold">Step ${stepNumber}</span>` : ''}
                </div>
                
                ${linkTypeBadge || lineStyleBadge ? `
                <div class="flex gap-2 mb-4">
                    ${linkTypeBadge}
                    ${lineStyleBadge}
                </div>
                ` : ''}
                
                <div class="info-card">
                    <div class="info-card-body p-6">
                        <!-- Visual Connection Display -->
                        <div class="flex items-center justify-center gap-4 mb-6">
                            <div class="text-center">
                                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold mb-2 shadow-lg">
                                    ${link.from.charAt(0)}
                                </div>
                                <span class="text-sm font-medium text-gray-700">${link.from}</span>
                            </div>
                            
                            <div class="link-arrow flex flex-col items-center">
                                <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded relative">
                                    <div class="absolute -right-1 top-1/2 transform -translate-y-1/2">
                                        <svg class="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="text-center">
                                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold mb-2 shadow-lg">
                                    ${link.to.charAt(0)}
                                </div>
                                <span class="text-sm font-medium text-gray-700">${link.to}</span>
                            </div>
                        </div>
                        
                        <!-- Description Section - More Prominent (with markdown support) -->
                        <div class="link-description mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-r">
                            <div class="flex items-start gap-3">
                                <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div class="flex-1">
                                    <h4 class="font-semibold text-gray-800 mb-1">Description</h4>
                                    <div class="markdown-content text-gray-700 leading-relaxed">${typeof marked !== 'undefined' ? marked.parse(descriptionText) : descriptionText}</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Connection Details - Redesigned -->
                        <div class="mt-4 p-4 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border border-gray-200">
                            <div class="flex items-center gap-2 mb-3">
                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                                </svg>
                                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Connection Details</span>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                                    <div class="flex items-center gap-2 mb-1">
                                        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span class="text-xs font-medium text-gray-400 uppercase">From</span>
                                    </div>
                                    <span class="text-sm font-semibold text-blue-600">${link.from}</span>
                                </div>
                                <div class="bg-white rounded-lg p-3 border border-purple-100 shadow-sm">
                                    <div class="flex items-center gap-2 mb-1">
                                        <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                                        <span class="text-xs font-medium text-gray-400 uppercase">To</span>
                                    </div>
                                    <span class="text-sm font-semibold text-purple-600">${link.to}</span>
                                </div>
                            </div>
                            ${link.link_type ? `
                            <div class="mt-3 flex items-center gap-2">
                                <span class="text-xs text-gray-400">Type:</span>
                                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">${link.link_type}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLinkEdit(link) {
        return `
            <div class="edit-form">
                <div class="info-card">
                    <div class="info-card-header">
                        <span class="text-sm font-semibold text-gray-700">Link Properties</span>
                    </div>
                    <div class="info-card-body" style="padding: 16px;">
                        <div class="form-grid">
                            <div class="form-group form-grid-full">
                                <label class="form-label">Link Name</label>
                                <input type="text" class="form-input" id="edit-link-name" value="${link.name}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">From</label>
                                <input type="text" class="form-input" id="edit-link-from" value="${link.from}" readonly style="background: #f9fafb; cursor: not-allowed;">
                            </div>
                            <div class="form-group">
                                <label class="form-label">To</label>
                                <input type="text" class="form-input" id="edit-link-to" value="${link.to}" readonly style="background: #f9fafb; cursor: not-allowed;">
                            </div>
                            <div class="form-group form-grid-full">
                                <label class="form-label">Description</label>
                                <textarea class="form-input" id="edit-link-description" rows="3" style="resize: vertical;">${link.description || ''}</textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="btn-group">
                    <button class="btn btn-primary flex-1" id="save-link-btn">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Save Changes
                    </button>
                    <button class="btn btn-secondary" id="cancel-edit-btn">Cancel</button>
                </div>
            </div>
        `;
    }

    setupEditForm() {
        // For Link editing
        const saveLinkBtn = document.getElementById('save-link-btn');
        if (saveLinkBtn) {
            saveLinkBtn.addEventListener('click', () => this.saveLinkChanges());
        }

        // For Node editing - check if we're in selection view or edit view
        const selectionItems = this.contentElement.querySelectorAll('.address-selection-item');
        const backToSelectionBtn = document.getElementById('back-to-selection-btn');
        const saveAddressBtn = document.getElementById('save-address-btn');
        const cancelAddressEditBtn = document.getElementById('cancel-address-edit-btn');
        const addAddressBtn = document.getElementById('add-address-btn');
        const dupAddressBtn = document.getElementById('dup-address-btn');
        const delAddressBtn = document.getElementById('del-address-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        const searchInput = document.getElementById('selection-search-input');

        // Setup search in selection view
        if (searchInput) {
            this.setupSelectionSearch();
        }

        // Selection view - click on item to select it
        selectionItems.forEach(item => {
            item.addEventListener('click', () => {
                this.selectedAddressIdx = parseInt(item.dataset.idx);
                const editTab = this.contentElement.querySelector('[data-tab="edit"]');
                if (editTab) {
                    // Re-render the edit form
                    const viewContent = document.getElementById('tab-view-content');
                    const editContent = document.getElementById('tab-edit-content');
                    editContent.innerHTML = this.renderNodeEdit(this.currentNode);
                    this.setupEditForm();
                }
            });
        });

        // Back to selection button
        if (backToSelectionBtn) {
            backToSelectionBtn.addEventListener('click', () => {
                this.selectedAddressIdx = null;
                const editTab = this.contentElement.querySelector('[data-tab="edit"]');
                if (editTab) {
                    const editContent = document.getElementById('tab-edit-content');
                    editContent.innerHTML = this.renderNodeEdit(this.currentNode);
                    this.setupEditForm();
                }
            });
        }

        // Save selected address
        if (saveAddressBtn) {
            saveAddressBtn.addEventListener('click', () => this.saveSelectedAddress());
        }

        // Cancel address edit
        if (cancelAddressEditBtn) {
            cancelAddressEditBtn.addEventListener('click', () => {
                this.selectedAddressIdx = null;
                const editContent = document.getElementById('tab-edit-content');
                editContent.innerHTML = this.renderNodeEdit(this.currentNode);
                this.setupEditForm();
            });
        }

        // Duplicate selected address
        if (dupAddressBtn) {
            dupAddressBtn.addEventListener('click', () => this.duplicateSelectedAddress());
        }

        // Delete selected address
        if (delAddressBtn) {
            delAddressBtn.addEventListener('click', () => this.deleteSelectedAddress());
        }

        // Add new address button
        if (addAddressBtn) {
            addAddressBtn.addEventListener('click', () => this.addNewAddressItem());
        }

        // Cancel back to view
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.selectedAddressIdx = null;
                const viewTab = this.contentElement.querySelector('[data-tab="view"]');
                if (viewTab) viewTab.click();
            });
        }
    }

    setupSelectionSearch() {
        const searchInput = document.getElementById('selection-search-input');
        const countDisplay = document.getElementById('selection-count');
        const container = document.getElementById('selection-items-container');

        if (!searchInput || !container) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const items = container.querySelectorAll('.address-selection-item');
            let visibleCount = 0;

            items.forEach(item => {
                const address = (item.dataset.address || '').toLowerCase();
                const label = (item.dataset.label || '').toLowerCase();
                const token0 = (item.dataset.token0 || '').toLowerCase();
                const token1 = (item.dataset.token1 || '').toLowerCase();
                const pool = (item.dataset.pool || '').toLowerCase();
                const farm = (item.dataset.farm || '').toLowerCase();

                const matches = !query ||
                    address.includes(query) ||
                    label.includes(query) ||
                    token0.includes(query) ||
                    token1.includes(query) ||
                    pool.includes(query) ||
                    farm.includes(query);

                item.style.display = matches ? '' : 'none';
                if (matches) visibleCount++;
            });

            if (countDisplay) {
                countDisplay.textContent = query
                    ? `${visibleCount} of ${this.currentNode.addresses.length} items`
                    : `${this.currentNode.addresses.length} items`;
            }
        });
    }

    saveSelectedAddress() {
        const addr = {
            address: document.getElementById('edit-addr-address').value.trim(),
            label: document.getElementById('edit-addr-label').value.trim(),
            farm: document.getElementById('edit-addr-farm').value.trim(),
            token0: document.getElementById('edit-addr-token0').value.trim(),
            token1: document.getElementById('edit-addr-token1').value.trim(),
            pool: document.getElementById('edit-addr-pool').value.trim(),
            fee: document.getElementById('edit-addr-fee').value.trim(),
            description: document.getElementById('edit-addr-description').value.trim(),
            network: document.getElementById('edit-addr-network').value.trim(),
            type: document.getElementById('edit-addr-type').value.trim()
        };

        // Remove empty fields
        Object.keys(addr).forEach(key => {
            if (!addr[key]) delete addr[key];
        });

        if (!addr.address) {
            this.showToast('Address is required!', 'error');
            return;
        }

        // Update the address
        this.currentNode.addresses[this.selectedAddressIdx] = addr;

        this.showToast('Item updated successfully!', 'success');

        // Go back to selection
        this.selectedAddressIdx = null;
        const editContent = document.getElementById('tab-edit-content');
        editContent.innerHTML = this.renderNodeEdit(this.currentNode);
        this.setupEditForm();
    }

    addNewAddressItem() {
        const newAddr = {
            address: '',
            label: '',
            farm: '',
            token0: '',
            token1: '',
            pool: '',
            fee: '',
            description: ''
        };

        this.currentNode.addresses.push(newAddr);

        // Select the newly added address
        this.selectedAddressIdx = this.currentNode.addresses.length - 1;

        const editContent = document.getElementById('tab-edit-content');
        editContent.innerHTML = this.renderNodeEdit(this.currentNode);
        this.setupEditForm();
    }

    deleteSelectedAddress() {
        if (confirm(`Are you sure you want to delete this item?`)) {
            this.currentNode.addresses.splice(this.selectedAddressIdx, 1);
            this.selectedAddressIdx = null;

            this.showToast('Item deleted successfully!', 'success');

            const editContent = document.getElementById('tab-edit-content');
            editContent.innerHTML = this.renderNodeEdit(this.currentNode);
            this.setupEditForm();
        }
    }

    duplicateSelectedAddress() {
        const sourceAddr = this.currentNode.addresses[this.selectedAddressIdx];
        const newAddr = { ...sourceAddr };

        this.currentNode.addresses.push(newAddr);

        this.showToast('Item duplicated successfully!', 'success');

        const editContent = document.getElementById('tab-edit-content');
        editContent.innerHTML = this.renderNodeEdit(this.currentNode);
        this.setupEditForm();
    }

    async saveNodeChanges() {
        // Call save callback if exists
        if (this.onSaveCallback) {
            const oldName = this.currentNode.node_name;
            try {
                await this.onSaveCallback(this.currentNode, 'node', oldName);
                this.showToast('All changes saved successfully!', 'success');

                // Reset selection and refresh view
                this.selectedAddressIdx = null;
                this.showNodeWithTabs(this.currentNode);
            } catch (error) {
                this.showToast('Failed to save changes', 'error');
                console.error('Save error:', error);
            }
        }
    }

    async saveLinkChanges() {
        const linkName = document.getElementById('edit-link-name').value;
        const linkDescription = document.getElementById('edit-link-description').value;

        // Update current link
        const oldName = this.currentLink.name;
        this.currentLink.name = linkName;
        this.currentLink.description = linkDescription;

        // Call save callback if exists
        if (this.onSaveCallback) {
            try {
                await this.onSaveCallback(this.currentLink, 'link', oldName);
                this.showToast('Changes saved successfully!', 'success');

                // Refresh view
                this.showLinkWithTabs(this.currentLink);
            } catch (error) {
                this.showToast('Failed to save changes', 'error');
                console.error('Save error:', error);
            }
        }
    }

    showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            ${type === 'success'
                ? '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
                : '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
            }
            ${message}
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    renderAddressItem(address, idx) {
        const hasDetails = address.token0 || address.token1 || address.pool || address.farm || address.description || address.fee;

        let html = `
            <div class="address-item" data-idx="${idx}" data-address="${address.address.toLowerCase()}" 
                 data-pool="${(address.pool || '').toLowerCase()}" 
                 data-token0="${(address.token0 || '').toLowerCase()}"
                 data-token1="${(address.token1 || '').toLowerCase()}"
                 data-label="${(address.label || '').toLowerCase()}"
                 data-farm="${(address.farm || '').toLowerCase()}">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
        `;

        if (address.label) {
            const strategyClass = this.getStrategyBadgeClass(address.label);
            if (strategyClass) {
                html += `<span class="strategy-badge ${strategyClass}">${address.label}</span>`;
            } else {
                const labelStyle = this.getLabelBadgeStyle(address.label);
                html += `<span class="strategy-badge" style="${labelStyle}">${address.label}</span>`;
            }
        }

        if (address.farm) {
            const farmClass = this.getFarmBadgeClass(address.farm);
            html += `<span class="farm-badge ${farmClass}">${address.farm}</span>`;
        }

        if (address.strategy) {
            const stratClass = this.getStrategyBadgeClass(address.strategy);
            html += `<span class="strategy-badge ${stratClass}">${address.strategy}</span>`;
        }

        if (address.pool || (address.token0 && address.token1)) {
            const t0 = address.token0 || '';
            const t1 = address.token1 || '';
            html += `
                <div class="pool-pair">
                    <span class="token-badge ${this.getTokenBadgeClass(t0)}">${t0}</span>
                    <span class="divider">/</span>
                    <span class="token-badge ${this.getTokenBadgeClass(t1)}">${t1}</span>
                </div>
            `;
        }

        html += `
            </div>
                        <div class="address-text">${address.address}</div>
        `;

        if (hasDetails) {
            html += `<div class="meta-grid">`;

            if (address.fee) {
                html += `
                    <div class="meta-item">
                        <span class="meta-label">Pool Fee</span>
                        <span class="meta-value">${address.fee}</span>
                    </div>
                `;
            }

            if (address.network) {
                html += `
                    <div class="meta-item">
                        <span class="meta-label">Network</span>
                        <span class="meta-value">${address.network}</span>
                    </div>
                `;
            }

            if (address.description) {
                html += `
                    <div class="meta-item" style="grid-column: span 2;">
                        <span class="meta-label">Description</span>
                        <span class="meta-value">${address.description}</span>
                    </div>
                `;
            }

            if (address.type) {
                html += `
                    <div class="meta-item">
                        <span class="meta-label">Type</span>
                        <span class="meta-value">${address.type}</span>
                    </div>
                `;
            }

            html += `</div>`;
        }

        html += `
                    </div>
                    <a href="https://arbiscan.io/address/${address.address}" 
                       target="_blank" 
                       class="arbiscan-link flex-shrink-0"
                       onclick="event.stopPropagation()">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        View
                    </a>
                </div>
            </div>
        `;

        return html;
    }

    setupSearch(addresses) {
        const searchInput = document.getElementById('address-search');
        const countDisplay = document.getElementById('address-count');

        if (!searchInput || !addresses) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const items = this.contentElement.querySelectorAll('.address-item');
            let visibleCount = 0;

            items.forEach(item => {
                const address = item.dataset.address || '';
                const pool = item.dataset.pool || '';
                const token0 = item.dataset.token0 || '';
                const token1 = item.dataset.token1 || '';
                const label = item.dataset.label || '';
                const farm = item.dataset.farm || '';

                const matches = !query ||
                    address.includes(query) ||
                    pool.includes(query) ||
                    token0.includes(query) ||
                    token1.includes(query) ||
                    label.includes(query) ||
                    farm.includes(query);

                item.style.display = matches ? '' : 'none';
                if (matches) visibleCount++;
            });

            if (countDisplay) {
                countDisplay.textContent = query
                    ? `${visibleCount} of ${addresses.length} items`
                    : `${addresses.length} items`;
            }
        });
    }

    // Legacy methods for backward compatibility
    showNode(node) {
        this.show(node, 'node');
    }

    showLink(link) {
        this.show(link, 'link');
    }
}
