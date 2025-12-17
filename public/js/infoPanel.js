export class InfoPanel {
    constructor() {
        this.contentElement = null;
        this.panelElement = null;
        this.resizerElement = null;
        this.isResizing = false;
        this.startX = 0;
        this.startWidth = 0;
        
        // Bind methods to preserve reference for event listeners
        this.handleResize = this.handleResize.bind(this);
        this.stopResize = this.stopResize.bind(this);
    }

    init() {
        this.contentElement = document.getElementById('info-content');
        this.panelElement = document.getElementById('info-panel');
        this.resizerElement = document.getElementById('info-panel-resizer');
        
        // Load saved width from localStorage
        const savedWidth = localStorage.getItem('infoPanelWidth');
        if (savedWidth && this.panelElement) {
            this.panelElement.style.width = savedWidth + 'px';
        }
        
        // Setup resize functionality
        this.setupResize();
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
        
        const diff = this.startX - e.clientX; // Reverse because we're resizing from right
        const newWidth = this.startWidth + diff;
        
        // Get container width to calculate max width
        const container = this.panelElement.parentElement;
        const containerWidth = container.offsetWidth;
        const minWidth = 200;
        const maxWidth = containerWidth * 0.8; // Max 80% of container
        
        // Constrain width
        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        
        this.panelElement.style.width = constrainedWidth + 'px';
    }

    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            
            // Save width to localStorage
            if (this.panelElement) {
                localStorage.setItem('infoPanelWidth', this.panelElement.offsetWidth);
            }
            
            document.removeEventListener('mousemove', this.handleResize);
            document.removeEventListener('mouseup', this.stopResize);
        }
    }

    show(item, type) {
        if (!this.contentElement) return;

        if (type === 'node') {
            this.showNode(item);
        } else if (type === 'link') {
            this.showLink(item);
        }
    }

    showNode(node) {
        let html = `
            <div class="mb-4">
                <h3 class="text-xl font-bold mb-2">${node.node_name}</h3>
                <p class="text-sm text-gray-600 mb-4">Type: <span class="font-semibold">${node.node_type}</span></p>
            </div>
        `;

        if (node.addresses && node.addresses.length > 0) {
            html += `
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Addresses</h4>
                    <div class="overflow-y-auto max-h-96 border border-gray-300 rounded">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50 sticky top-0">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
            `;

            node.addresses.forEach((address, idx) => {
                const hasPairs = address.pairs && address.pairs.length > 0;
                html += `
                    <tr class="address-row" data-address-idx="${idx}">
                        <td class="px-4 py-2 text-sm text-gray-900 break-all">${address.address}</td>
                        <td class="px-4 py-2 text-sm">
                            ${hasPairs ? `<button class="detail-btn text-blue-600 hover:text-blue-800" data-address-idx="${idx}">[...]</button>` : '<span class="text-gray-400">-</span>'}
                        </td>
                    </tr>
                `;

                if (hasPairs) {
                    html += `
                        <tr class="pairs-row hidden" data-address-idx="${idx}">
                            <td colspan="2" class="px-4 py-2">
                                <div class="nested-table">
                                    <table class="min-w-full divide-y divide-gray-200 border border-gray-300 rounded">
                                        <thead class="bg-gray-100">
                                            <tr>
                                                <th class="px-3 py-1 text-left text-xs font-medium text-gray-700">Pair Name</th>
                                                <th class="px-3 py-1 text-left text-xs font-medium text-gray-700">In Amount</th>
                                                <th class="px-3 py-1 text-left text-xs font-medium text-gray-700">Out Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-200">
                    `;
                    address.pairs.forEach(pair => {
                        html += `
                            <tr>
                                <td class="px-3 py-1 text-sm text-gray-900">${pair.name}</td>
                                <td class="px-3 py-1 text-sm text-gray-900">${pair.inAmount}</td>
                                <td class="px-3 py-1 text-sm text-gray-900">${pair.outAmount}</td>
                            </tr>
                        `;
                    });
                    html += `
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    `;
                }
            });

            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        this.contentElement.innerHTML = html;

        // Setup detail button handlers
        this.contentElement.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-address-idx');
                const pairsRow = this.contentElement.querySelector(`tr.pairs-row[data-address-idx="${idx}"]`);
                if (pairsRow) {
                    pairsRow.classList.toggle('hidden');
                }
            });
        });
    }

    showLink(link) {
        const html = `
            <div class="mb-4">
                <h3 class="text-xl font-bold mb-2">${link.name}</h3>
                <p class="text-sm text-gray-600 mb-2">From: <span class="font-semibold">${link.from}</span></p>
                <p class="text-sm text-gray-600 mb-4">To: <span class="font-semibold">${link.to}</span></p>
                <div class="mt-4">
                    <h4 class="font-semibold mb-2">Description</h4>
                    <p class="text-sm text-gray-700">${link.description || 'No description'}</p>
                </div>
            </div>
        `;
        this.contentElement.innerHTML = html;
    }
}

