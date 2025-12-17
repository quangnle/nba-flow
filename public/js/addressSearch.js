export class AddressSearch {
    constructor() {
        this.allAddresses = [];
        this.searchInput = null;
        this.resultsContainer = null;
    }

    init(diagramData) {
        this.extractAllAddresses(diagramData);
        this.setupEventListeners();
    }

    extractAllAddresses(diagramData) {
        this.allAddresses = [];
        
        // Extract from all nodes
        diagramData.nodes.forEach(node => {
            if (node.addresses && Array.isArray(node.addresses)) {
                node.addresses.forEach(addr => {
                    this.allAddresses.push({
                        address: addr.address,
                        nodeName: node.node_name,
                        nodeType: node.node_type,
                        label: addr.label || '',
                        token0: addr.token0 || '',
                        token1: addr.token1 || '',
                        pool: addr.pool || '',
                        farm: addr.farm || '',
                        fee: addr.fee || '',
                        network: addr.network || '',
                        description: addr.description || '',
                        type: addr.type || ''
                    });
                });
            }
        });
    }

    setupEventListeners() {
        this.searchInput = document.getElementById('address-search-input');
        this.resultsContainer = document.getElementById('address-search-results');

        if (!this.searchInput || !this.resultsContainer) return;

        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            this.performSearch(query);
        });

        // Show all on initial load
        this.renderResults(this.allAddresses);
    }

    performSearch(query) {
        if (!query) {
            this.renderResults(this.allAddresses);
            return;
        }

        const results = this.allAddresses.filter(item => {
            return (
                item.address.toLowerCase().includes(query) ||
                item.nodeName.toLowerCase().includes(query) ||
                item.label.toLowerCase().includes(query) ||
                item.token0.toLowerCase().includes(query) ||
                item.token1.toLowerCase().includes(query) ||
                item.pool.toLowerCase().includes(query) ||
                item.farm.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
        });

        this.renderResults(results);
    }

    renderResults(results) {
        this.resultsContainer.innerHTML = '';

        if (results.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="text-center py-8">
                    <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <p class="text-gray-500">Không tìm thấy kết quả</p>
                </div>
            `;
            return;
        }

        results.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow';
            
            let html = `
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
                            <span class="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                ${item.nodeName}
                            </span>
                            <span class="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                                ${item.nodeType}
                            </span>
            `;

            // Add farm badge if exists
            if (item.farm) {
                const farmClass = item.farm.includes('1') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
                html += `<span class="inline-block px-2 py-1 ${farmClass} rounded text-xs font-semibold">${item.farm}</span>`;
            }

            html += `</div>`;

            // Address
            html += `
                <div class="mb-2">
                    <p class="text-xs text-gray-500 mb-1">Address:</p>
                    <p class="font-mono text-xs bg-gray-100 p-2 rounded break-all text-gray-800">${item.address}</p>
                </div>
            `;

            // Label
            if (item.label) {
                html += `
                    <div class="mb-2">
                        <p class="text-xs text-gray-500 mb-1">Label:</p>
                        <p class="text-sm font-medium text-gray-700">${item.label}</p>
                    </div>
                `;
            }

            // Tokens & Pool
            if (item.token0 || item.token1 || item.pool) {
                html += `
                    <div class="mb-2 grid grid-cols-2 gap-2">
            `;
                if (item.token0) {
                    html += `
                        <div>
                            <p class="text-xs text-gray-500">Token 0</p>
                            <p class="text-xs font-medium text-gray-700">${item.token0}</p>
                        </div>
                    `;
                }
                if (item.token1) {
                    html += `
                        <div>
                            <p class="text-xs text-gray-500">Token 1</p>
                            <p class="text-xs font-medium text-gray-700">${item.token1}</p>
                        </div>
                    `;
                }
                if (item.pool) {
                    html += `
                        <div class="col-span-2">
                            <p class="text-xs text-gray-500">Pool</p>
                            <p class="text-xs font-medium text-gray-700">${item.pool}</p>
                        </div>
                    `;
                }
                html += `</div>`;
            }

            // Fee & Network
            if (item.fee || item.network) {
                html += `
                    <div class="mb-2 grid grid-cols-2 gap-2">
            `;
                if (item.fee) {
                    html += `
                        <div>
                            <p class="text-xs text-gray-500">Fee</p>
                            <p class="text-xs font-medium text-gray-700">${item.fee}</p>
                        </div>
                    `;
                }
                if (item.network) {
                    html += `
                        <div>
                            <p class="text-xs text-gray-500">Network</p>
                            <p class="text-xs font-medium text-gray-700">${item.network}</p>
                        </div>
                    `;
                }
                html += `</div>`;
            }

            // Description
            if (item.description) {
                html += `
                    <div class="mb-2">
                        <p class="text-xs text-gray-500">Description:</p>
                        <p class="text-xs text-gray-700">${item.description}</p>
                    </div>
                `;
            }

            // Arbiscan link
            html += `
                <div class="mt-3 pt-3 border-t border-gray-100">
                    <a href="https://arbiscan.io/address/${item.address}" target="_blank" class="text-blue-600 hover:text-blue-700 text-xs font-medium inline-flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-4l4-4m0 0l-4-4"></path>
                        </svg>
                        View on Arbiscan
                    </a>
                </div>
                    </div>
            `;

            card.innerHTML = html;
            this.resultsContainer.appendChild(card);
        });

        // Update result count
        const countDisplay = document.getElementById('address-search-count');
        if (countDisplay) {
            countDisplay.textContent = `${results.length} kết quả`;
        }
    }
}

