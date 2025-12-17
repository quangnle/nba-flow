export class CrudPanel {
    constructor(diagramManager) {
        this.diagramManager = diagramManager;
        this.contentElement = null;
        this.currentEditItem = null;
        this.currentEditType = null;
    }

    init() {
        this.contentElement = document.getElementById('crud-content');
        
        document.getElementById('add-node-btn')?.addEventListener('click', () => {
            this.showAddNodeForm();
        });
        
        document.getElementById('add-link-btn')?.addEventListener('click', () => {
            this.showAddLinkForm();
        });

        this.loadCrudContent();
    }

    async loadCrudContent() {
        const data = this.diagramManager.getData();
        let html = '<div class="space-y-4">';

        // Nodes section
        html += '<div><h3 class="font-bold text-lg mb-2">Nodes</h3>';
        data.nodes.forEach((node, idx) => {
            html += `
                <div class="border border-gray-300 rounded p-3 mb-2">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold">${node.node_name}</p>
                            <p class="text-sm text-gray-600">${node.node_type}</p>
                        </div>
                        <div>
                            <button class="edit-node-btn bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm mr-1" data-idx="${idx}">Edit</button>
                            <button class="delete-node-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm" data-idx="${idx}">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        // Links section
        html += '<div><h3 class="font-bold text-lg mb-2 mt-4">Links</h3>';
        data.links.forEach((link, idx) => {
            html += `
                <div class="border border-gray-300 rounded p-3 mb-2">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold">${link.name}</p>
                            <p class="text-sm text-gray-600">${link.from} → ${link.to}</p>
                        </div>
                        <div>
                            <button class="edit-link-btn bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm mr-1" data-idx="${idx}">Edit</button>
                            <button class="delete-link-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm" data-idx="${idx}">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        html += '</div>';
        this.contentElement.innerHTML = html;

        // Setup event handlers
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Node handlers
        this.contentElement.querySelectorAll('.edit-node-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                this.showEditNodeForm(idx);
            });
        });

        this.contentElement.querySelectorAll('.delete-node-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                this.deleteNode(idx);
            });
        });

        // Link handlers
        this.contentElement.querySelectorAll('.edit-link-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                this.showEditLinkForm(idx);
            });
        });

        this.contentElement.querySelectorAll('.delete-link-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                this.deleteLink(idx);
            });
        });
    }

    showAddNodeForm() {
        const html = `
            <div class="border border-gray-300 rounded p-4 mb-4 bg-gray-50">
                <h3 class="font-bold mb-3">Add New Node</h3>
                <form id="add-node-form" class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium mb-1">Node Name</label>
                        <input type="text" name="node_name" required class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Node Type</label>
                        <select name="node_type" required class="w-full border border-gray-300 rounded px-3 py-2">
                            <option value="address">Address</option>
                            <option value="contract">Contract</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">X Position</label>
                        <input type="number" name="x" value="100" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Y Position</label>
                        <input type="number" name="y" value="100" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Addresses (JSON)</label>
                        <textarea name="addresses" rows="5" class="w-full border border-gray-300 rounded px-3 py-2 font-mono text-xs" placeholder='[{"address": "0x...", "pairs": []}]'></textarea>
                    </div>
                    <div class="flex gap-2">
                        <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Add</button>
                        <button type="button" class="cancel-form-btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        this.contentElement.insertAdjacentHTML('afterbegin', html);
        
        document.getElementById('add-node-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddNode(e.target);
        });
        
        document.querySelector('.cancel-form-btn')?.addEventListener('click', () => {
            this.loadCrudContent();
        });
    }

    showEditNodeForm(idx) {
        const data = this.diagramManager.getData();
        const node = data.nodes[idx];
        
        const html = `
            <div class="border border-gray-300 rounded p-4 mb-4 bg-gray-50">
                <h3 class="font-bold mb-3">Edit Node</h3>
                <form id="edit-node-form" class="space-y-3">
                    <input type="hidden" name="idx" value="${idx}">
                    <div>
                        <label class="block text-sm font-medium mb-1">Node Name</label>
                        <input type="text" name="node_name" value="${node.node_name}" required class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Node Type</label>
                        <select name="node_type" required class="w-full border border-gray-300 rounded px-3 py-2">
                            <option value="address" ${node.node_type === 'address' ? 'selected' : ''}>Address</option>
                            <option value="contract" ${node.node_type === 'contract' ? 'selected' : ''}>Contract</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">X Position</label>
                        <input type="number" name="x" value="${node.x || 0}" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Y Position</label>
                        <input type="number" name="y" value="${node.y || 0}" class="w-full border border-gray-300 rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Addresses (JSON)</label>
                        <textarea name="addresses" rows="8" class="w-full border border-gray-300 rounded px-3 py-2 font-mono text-xs" required>${JSON.stringify(node.addresses || [], null, 2)}</textarea>
                    </div>
                    <div class="flex gap-2">
                        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                        <button type="button" class="cancel-form-btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        this.contentElement.insertAdjacentHTML('afterbegin', html);
        
        document.getElementById('edit-node-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditNode(e.target);
        });
        
        document.querySelector('.cancel-form-btn')?.addEventListener('click', () => {
            this.loadCrudContent();
        });
    }

    showAddLinkForm() {
        const data = this.diagramManager.getData();
        const nodeOptions = data.nodes.map(n => `<option value="${n.node_name}">${n.node_name}</option>`).join('');
        
        const html = `
            <div class="border border-gray-300 rounded p-4 mb-4 bg-gray-50">
                <h3 class="font-bold mb-3">Add New Link</h3>
                <form id="add-link-form" class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium mb-1">From Node</label>
                        <select name="from" required class="w-full border border-gray-300 rounded px-3 py-2">
                            ${nodeOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">To Node</label>
                        <select name="to" required class="w-full border border-gray-300 rounded px-3 py-2">
                            ${nodeOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Description</label>
                        <textarea name="description" rows="3" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
                    </div>
                    <div class="flex gap-2">
                        <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Add</button>
                        <button type="button" class="cancel-form-btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        this.contentElement.insertAdjacentHTML('afterbegin', html);
        
        document.getElementById('add-link-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddLink(e.target);
        });
        
        document.querySelector('.cancel-form-btn')?.addEventListener('click', () => {
            this.loadCrudContent();
        });
    }

    showEditLinkForm(idx) {
        const data = this.diagramManager.getData();
        const link = data.links[idx];
        const nodeOptions = data.nodes.map(n => `<option value="${n.node_name}" ${n.node_name === link.from ? 'selected' : ''}>${n.node_name}</option>`).join('');
        const nodeOptionsTo = data.nodes.map(n => `<option value="${n.node_name}" ${n.node_name === link.to ? 'selected' : ''}>${n.node_name}</option>`).join('');
        
        const html = `
            <div class="border border-gray-300 rounded p-4 mb-4 bg-gray-50">
                <h3 class="font-bold mb-3">Edit Link</h3>
                <form id="edit-link-form" class="space-y-3">
                    <input type="hidden" name="idx" value="${idx}">
                    <div>
                        <label class="block text-sm font-medium mb-1">From Node</label>
                        <select name="from" required class="w-full border border-gray-300 rounded px-3 py-2">
                            ${nodeOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">To Node</label>
                        <select name="to" required class="w-full border border-gray-300 rounded px-3 py-2">
                            ${nodeOptionsTo}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Description</label>
                        <textarea name="description" rows="3" class="w-full border border-gray-300 rounded px-3 py-2">${link.description || ''}</textarea>
                    </div>
                    <div class="flex gap-2">
                        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                        <button type="button" class="cancel-form-btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        this.contentElement.insertAdjacentHTML('afterbegin', html);
        
        document.getElementById('edit-link-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditLink(e.target);
        });
        
        document.querySelector('.cancel-form-btn')?.addEventListener('click', () => {
            this.loadCrudContent();
        });
    }

    async handleAddNode(form) {
        const formData = new FormData(form);
        const addressesText = formData.get('addresses');
        let addresses = [];
        
        try {
            if (addressesText.trim()) {
                addresses = JSON.parse(addressesText);
            }
        } catch (e) {
            alert('Invalid JSON format for addresses');
            return;
        }

        const newNode = {
            node_name: formData.get('node_name'),
            node_type: formData.get('node_type'),
            x: parseInt(formData.get('x')) || 100,
            y: parseInt(formData.get('y')) || 100,
            addresses: addresses
        };

        const data = this.diagramManager.getData();
        data.nodes.push(newNode);
        
        await this.saveData(data);
        this.diagramManager.refresh();
        this.loadCrudContent();
    }

    async handleEditNode(form) {
        const formData = new FormData(form);
        const idx = parseInt(formData.get('idx'));
        const addressesText = formData.get('addresses');
        let addresses = [];
        
        try {
            addresses = JSON.parse(addressesText);
        } catch (e) {
            alert('Invalid JSON format for addresses');
            return;
        }

        const data = this.diagramManager.getData();
        data.nodes[idx] = {
            node_name: formData.get('node_name'),
            node_type: formData.get('node_type'),
            x: parseInt(formData.get('x')) || data.nodes[idx].x || 100,
            y: parseInt(formData.get('y')) || data.nodes[idx].y || 100,
            addresses: addresses
        };
        
        await this.saveData(data);
        this.diagramManager.refresh();
        this.loadCrudContent();
    }

    async handleAddLink(form) {
        const formData = new FormData(form);
        const from = formData.get('from');
        const to = formData.get('to');
        
        const newLink = {
            name: `${from}_${to}`,
            from: from,
            to: to,
            description: formData.get('description') || ''
        };

        const data = this.diagramManager.getData();
        data.links.push(newLink);
        
        await this.saveData(data);
        this.diagramManager.refresh();
        this.loadCrudContent();
    }

    async handleEditLink(form) {
        const formData = new FormData(form);
        const idx = parseInt(formData.get('idx'));
        const from = formData.get('from');
        const to = formData.get('to');
        
        const data = this.diagramManager.getData();
        data.links[idx] = {
            name: `${from}_${to}`,
            from: from,
            to: to,
            description: formData.get('description') || ''
        };
        
        await this.saveData(data);
        this.diagramManager.refresh();
        this.loadCrudContent();
    }

    async deleteNode(idx) {
        if (!confirm('Are you sure you want to delete this node? All connected links will also be deleted.')) {
            return;
        }

        const data = this.diagramManager.getData();
        const nodeName = data.nodes[idx].node_name;
        
        // Remove node
        data.nodes.splice(idx, 1);
        
        // Remove all links connected to this node
        data.links = data.links.filter(link => link.from !== nodeName && link.to !== nodeName);
        
        await this.saveData(data);
        this.diagramManager.refresh();
        this.loadCrudContent();
    }

    async deleteLink(idx) {
        if (!confirm('Are you sure you want to delete this link?')) {
            return;
        }

        const data = this.diagramManager.getData();
        data.links.splice(idx, 1);
        
        await this.saveData(data);
        this.diagramManager.refresh();
        this.loadCrudContent();
    }

    async saveData(data) {
        try {
            await fetch('/api/diagram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            // Refresh diagram after saving
            this.diagramManager.refresh();
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data');
        }
    }
}

