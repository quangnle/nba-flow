export class DiagramManager {
    constructor() {
        this.svg = null;
        this.data = null;
        this.nodes = [];
        this.links = [];
        this.nodeElements = null;
        this.linkElements = null;
        this.onItemClick = null;
        this.drag = null;
    }

    init(data, onItemClick) {
        this.data = data;
        this.onItemClick = onItemClick;

        // Setup SVG
        this.svg = d3.select('#diagram-svg');

        // Check if SVG exists
        if (!this.svg.node()) {
            console.error('SVG element not found');
            return;
        }

        // Set SVG dimensions - use a function to get proper dimensions
        this.updateSVGDimensions();

        const container = document.getElementById('diagram-container');
        const containerRect = container.getBoundingClientRect();
        const width = containerRect.width || 800;
        const height = containerRect.height || 600;

        // Initialize positions if not set
        this.data.nodes.forEach(node => {
            if (node.x === undefined) node.x = Math.random() * width;
            if (node.y === undefined) node.y = Math.random() * height;
        });

        // Setup drag before rendering
        this.setupDrag();
        this.render();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateSVGDimensions();
        });
    }

    updateSVGDimensions() {
        const container = document.getElementById('diagram-container');
        if (container && this.svg) {
            const containerRect = container.getBoundingClientRect();
            const width = containerRect.width || 800;
            const height = containerRect.height || 600;
            this.svg.attr('width', width).attr('height', height);

            // Also set viewBox for proper scaling
            this.svg.attr('viewBox', `0 0 ${width} ${height}`);
        }
    }

    render() {
        // Check if SVG exists
        if (!this.svg || !this.svg.node()) {
            console.error('SVG not initialized');
            return;
        }

        // Clear existing
        this.svg.selectAll('*').remove();

        // Create arrow marker definitions
        const defs = this.svg.append('defs');

        // Arrow marker
        const arrowMarker = defs.append('marker')
            .attr('id', 'arrowhead')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('refX', 9)
            .attr('refY', 3)
            .attr('orient', 'auto')
            .attr('markerUnits', 'strokeWidth');

        arrowMarker.append('path')
            .attr('d', 'M0,0 L0,6 L9,3 z')
            .attr('fill', '#333')
            .attr('class', 'arrow-fill');

        // Create container groups
        const linkGroup = this.svg.append('g').attr('class', 'links');
        const nodeGroup = this.svg.append('g').attr('class', 'nodes');

        // Use curve_offset from JSON data for each link
        const linkOffsets = {};
        this.data.links.forEach((link, index) => {
            // Read curve_offset from link data, default to 0
            linkOffsets[index] = link.curve_offset || 0;
        });

        // Create invisible hit areas for easier link selection (wider clickable area)
        this.hitAreas = linkGroup
            .selectAll('line.hit-area')
            .data(this.data.links)
            .enter()
            .append('line')
            .attr('class', 'hit-area')
            .attr('stroke', 'transparent')
            .attr('stroke-width', 16) // Wide invisible hit area
            .attr('x1', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!fromNode || !toNode) return 0;
                const offset = linkOffsets[i] || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkStartX(fromNode, d) + Math.sin(angle) * offset;
            })
            .attr('y1', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!fromNode || !toNode) return 0;
                const offset = linkOffsets[i] || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkStartY(fromNode, d) - Math.cos(angle) * offset;
            })
            .attr('x2', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!toNode || !fromNode) return 0;
                const offset = linkOffsets[i] || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkEndX(toNode, d) + Math.sin(angle) * offset;
            })
            .attr('y2', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!toNode || !fromNode) return 0;
                const offset = linkOffsets[i] || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkEndY(toNode, d) - Math.cos(angle) * offset;
            })
            .style('cursor', 'pointer');

        // Create visible links with arrow markers
        this.linkElements = linkGroup
            .selectAll('line.link')
            .data(this.data.links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('marker-end', 'url(#arrowhead)')
            .attr('stroke-width', 2) // Original 2px thickness
            .attr('x1', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!fromNode || !toNode) return 0;
                const offset = linkOffsets[i] || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkStartX(fromNode, d) + Math.sin(angle) * offset;
            })
            .attr('y1', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!fromNode || !toNode) return 0;
                const offset = linkOffsets[i] || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkStartY(fromNode, d) - Math.cos(angle) * offset;
            })
            .attr('x2', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!toNode || !fromNode) return 0;
                const offset = linkOffsets[i] || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkEndX(toNode, d) + Math.sin(angle) * offset;
            })
            .attr('y2', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!toNode || !fromNode) return 0;
                const offset = linkOffsets[i] || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkEndY(toNode, d) - Math.cos(angle) * offset;
            })
            .style('pointer-events', 'none'); // Disable pointer events on visible lines

        // Attach event handlers to hit areas (they will control both hit area and visible link)
        this.hitAreas
            .on('mouseenter', (event, d) => {
                const index = this.data.links.indexOf(d);
                const visibleLink = this.svg.selectAll('.links line.link').filter((_, i) => i === index);
                visibleLink.attr('stroke', '#0066cc').attr('stroke-width', 3);
                d3.select('#arrowhead path').attr('fill', '#0066cc');
            })
            .on('mouseleave', (event, d) => {
                const index = this.data.links.indexOf(d);
                const visibleLink = this.svg.selectAll('.links line.link').filter((_, i) => i === index);
                visibleLink.attr('stroke', '#333').attr('stroke-width', 2);
                d3.select('#arrowhead path').attr('fill', '#333');
            })
            .on('click', (event, d) => {
                event.stopPropagation();
                this.onItemClick(d, 'link');
            });

        // Create nodes
        this.nodeElements = nodeGroup
            .selectAll('g.node')
            .data(this.data.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .call(this.drag)
            .on('click', (event, d) => {
                event.stopPropagation();
                this.onItemClick(d, 'node');
            });

        // Add rectangles for nodes
        this.nodeElements
            .append('rect')
            .attr('width', 150)
            .attr('height', 60)
            .attr('x', -75)
            .attr('y', -30)
            .attr('rx', 10)
            .attr('fill', d => d.node_type === 'contract' ? '#4F46E5' : '#10B981')
            .attr('stroke', '#333')
            .attr('stroke-width', 2);

        // Add text for nodes
        this.nodeElements
            .append('text')
            .attr('class', 'node-text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text(d => d.node_name)
            .each(function (d) {
                const text = d3.select(this);
                const words = d.node_name.split(' ');
                if (words.length > 1) {
                    text.text(null);
                    words.forEach((word, i) => {
                        text.append('tspan')
                            .attr('x', 0)
                            .attr('dy', i === 0 ? 0 : '1.2em')
                            .text(word);
                    });
                }
            });
    }

    setupDrag() {
        if (!this.drag) {
            this.drag = d3.drag()
                .on('start', (event, d) => {
                    // Raise the node group
                    d3.select(event.sourceEvent.target.closest('g.node') || event.sourceEvent.target)
                        .raise();
                })
                .on('drag', (event, d) => {
                    // Get mouse position relative to SVG
                    const [x, y] = d3.pointer(event, this.svg.node());

                    // Constrain to SVG bounds (with padding for node size)
                    const svgNode = this.svg.node();
                    const svgWidth = svgNode.getBoundingClientRect().width;
                    const svgHeight = svgNode.getBoundingClientRect().height;

                    // Node dimensions
                    const nodeWidth = 150;
                    const nodeHeight = 60;
                    const padding = 10;

                    // Constrain position
                    d.x = Math.max(nodeWidth / 2 + padding, Math.min(svgWidth - nodeWidth / 2 - padding, x));
                    d.y = Math.max(nodeHeight / 2 + padding, Math.min(svgHeight - nodeHeight / 2 - padding, y));

                    // Find the node group element
                    const nodeElement = d3.select(event.sourceEvent.target.closest('g.node'));

                    if (nodeElement.node()) {
                        nodeElement.attr('transform', `translate(${d.x},${d.y})`);
                    }

                    // Update connected links
                    this.updateLinks();
                })
                .on('end', () => {
                    this.savePositions();
                });
        }
    }

    // Calculate intersection point of line with rectangle edge
    getIntersectionPoint(centerX, centerY, targetX, targetY, width, height) {
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const dx = targetX - centerX;
        const dy = targetY - centerY;

        // Handle edge case when dx is 0
        if (Math.abs(dx) < 0.001) {
            return {
                x: centerX,
                y: centerY + (dy > 0 ? halfHeight : -halfHeight)
            };
        }

        // Handle edge case when dy is 0
        if (Math.abs(dy) < 0.001) {
            return {
                x: centerX + (dx > 0 ? halfWidth : -halfWidth),
                y: centerY
            };
        }

        // Calculate slope
        const slope = dy / dx;
        const invSlope = dx / dy;

        // Determine which edge to intersect
        const rightX = centerX + halfWidth;
        const leftX = centerX - halfWidth;
        const bottomY = centerY + halfHeight;
        const topY = centerY - halfHeight;

        // Calculate intersection with right/left edges
        let x, y;
        if (dx > 0) {
            // Check right edge
            y = centerY + slope * halfWidth;
            if (y >= topY && y <= bottomY) {
                x = rightX;
            } else {
                // Intersect with top or bottom
                if (dy > 0) {
                    y = bottomY;
                    x = centerX + invSlope * halfHeight;
                } else {
                    y = topY;
                    x = centerX - invSlope * halfHeight;
                }
            }
        } else {
            // Check left edge
            y = centerY - slope * halfWidth;
            if (y >= topY && y <= bottomY) {
                x = leftX;
            } else {
                // Intersect with top or bottom
                if (dy > 0) {
                    y = bottomY;
                    x = centerX - invSlope * halfHeight;
                } else {
                    y = topY;
                    x = centerX + invSlope * halfHeight;
                }
            }
        }

        return { x, y };
    }

    getLinkStartX(fromNode, link) {
        const toNode = this.data.nodes.find(n => n.node_name === link.to);
        if (!toNode) return fromNode.x;

        const point = this.getIntersectionPoint(
            fromNode.x, fromNode.y,
            toNode.x, toNode.y,
            150, 60
        );
        return point.x;
    }

    getLinkStartY(fromNode, link) {
        const toNode = this.data.nodes.find(n => n.node_name === link.to);
        if (!toNode) return fromNode.y;

        const point = this.getIntersectionPoint(
            fromNode.x, fromNode.y,
            toNode.x, toNode.y,
            150, 60
        );
        return point.y;
    }

    getLinkEndX(toNode, link) {
        const fromNode = this.data.nodes.find(n => n.node_name === link.from);
        if (!fromNode) return toNode.x;

        const point = this.getIntersectionPoint(
            toNode.x, toNode.y,
            fromNode.x, fromNode.y,
            150, 60
        );
        return point.x;
    }

    getLinkEndY(toNode, link) {
        const fromNode = this.data.nodes.find(n => n.node_name === link.from);
        if (!fromNode) return toNode.y;

        const point = this.getIntersectionPoint(
            toNode.x, toNode.y,
            fromNode.x, fromNode.y,
            150, 60
        );
        return point.y;
    }

    updateLinks() {
        // Update visible links
        this.linkElements
            .attr('x1', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!fromNode || !toNode) return 0;
                const offset = d.curve_offset || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkStartX(fromNode, d) + Math.sin(angle) * offset;
            })
            .attr('y1', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!fromNode || !toNode) return 0;
                const offset = d.curve_offset || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkStartY(fromNode, d) - Math.cos(angle) * offset;
            })
            .attr('x2', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!toNode || !fromNode) return 0;
                const offset = d.curve_offset || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkEndX(toNode, d) + Math.sin(angle) * offset;
            })
            .attr('y2', (d, i) => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!toNode || !fromNode) return 0;
                const offset = d.curve_offset || 0;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                return this.getLinkEndY(toNode, d) - Math.cos(angle) * offset;
            });

        // Update invisible hit areas (keep in sync with visible links)
        if (this.hitAreas) {
            this.hitAreas
                .attr('x1', (d, i) => {
                    const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                    const toNode = this.data.nodes.find(n => n.node_name === d.to);
                    if (!fromNode || !toNode) return 0;
                    const offset = d.curve_offset || 0;
                    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                    return this.getLinkStartX(fromNode, d) + Math.sin(angle) * offset;
                })
                .attr('y1', (d, i) => {
                    const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                    const toNode = this.data.nodes.find(n => n.node_name === d.to);
                    if (!fromNode || !toNode) return 0;
                    const offset = d.curve_offset || 0;
                    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                    return this.getLinkStartY(fromNode, d) - Math.cos(angle) * offset;
                })
                .attr('x2', (d, i) => {
                    const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                    const toNode = this.data.nodes.find(n => n.node_name === d.to);
                    if (!toNode || !fromNode) return 0;
                    const offset = d.curve_offset || 0;
                    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                    return this.getLinkEndX(toNode, d) + Math.sin(angle) * offset;
                })
                .attr('y2', (d, i) => {
                    const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                    const toNode = this.data.nodes.find(n => n.node_name === d.to);
                    if (!toNode || !fromNode) return 0;
                    const offset = d.curve_offset || 0;
                    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                    return this.getLinkEndY(toNode, d) - Math.cos(angle) * offset;
                });
        }
    }

    async savePositions() {
        try {
            const response = await fetch('/api/diagram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }
            await response.json();
        } catch (error) {
            console.error('Error saving positions:', error);
        }
    }

    async refresh() {
        try {
            const response = await fetch('/api/diagram');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }
            this.data = await response.json();
            this.setupDrag();
            this.render();
        } catch (error) {
            console.error('Error refreshing diagram:', error);
            alert('Error loading diagram data. Please refresh the page.');
        }
    }

    getData() {
        return this.data;
    }

    updateData(newData) {
        this.data = newData;
        this.setupDrag();
        this.render();
    }

    // Extract step number from description like "[1] User calls..."
    getStepNumber(description) {
        if (!description) return 999;
        const match = description.match(/\[(\d+[a-z]?)\]/);
        return match ? match[1] : '999';
    }

    // Simple description mapping for non-technical users
    getSimpleDescription(from, to) {
        const key = `${from}|${to}`;
        const descriptions = {
            // User operations - Deposit
            'User|Farm Contract': 'User sends tokens to the Farm',
            'Farm Contract|Strategy': 'Farm forwards tokens to Strategy',
            'Strategy|Zap': 'Strategy swaps tokens for correct ratio',
            'Zap|Strategy': 'Swapped tokens returned to Strategy',
            'Strategy|Position Manager': 'Strategy adds liquidity to position',
            'Position Manager|Pool': 'Liquidity added to trading pool',
            'Strategy|Tracker Token': 'Strategy mints share tokens for user',
            'Tracker Token|User': 'Share tokens sent to user wallet',

            // User operations - Withdraw
            'Tracker Token|Farm Contract': 'User burns share tokens to withdraw',
            'Strategy|User': 'Tokens transferred back to user',

            // User operations - Claim Reward
            'Farm Contract|Strategy': 'Farm requests reward claim from Strategy',

            // Controller operations
            'Controller|Strategy': 'Controller triggers management action',
            'Strategy|Fund Manager': 'Earnings distributed to fund managers',
            'Pool|Strategy': 'Trading fees collected from pool',
            'Position Manager|Old NFT Position': 'Old position burned',
            'Position Manager|New NFT Position': 'New position created with updated range',
            'Strategy|Pool': 'Liquidity added to new position'
        };

        return descriptions[key] || `${from} transfers to ${to}`;
    }

    // Create and show the step overlay
    showStepOverlay() {
        // Remove existing overlay if any
        this.hideStepOverlay();

        const container = document.getElementById('diagram-container');
        if (!container) return;

        const overlay = document.createElement('div');
        overlay.id = 'step-overlay';
        overlay.innerHTML = `
            <div class="step-header">
                Step <span id="step-current">-</span> of <span id="step-total">-</span>
            </div>
            <div class="step-flow">
                <div class="step-from">From: <span id="step-from">-</span></div>
                <div class="step-to">To: <span id="step-to">-</span></div>
            </div>
            <div class="step-description" id="step-description">Preparing animation...</div>
        `;
        overlay.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            max-width: 400px;
            min-width: 300px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
            font-family: 'Plus Jakarta Sans', sans-serif;
            z-index: 1000;
            backdrop-filter: blur(10px);
            animation: slideUp 0.3s ease-out;
        `;

        // Add animation keyframes
        if (!document.getElementById('overlay-styles')) {
            const style = document.createElement('style');
            style.id = 'overlay-styles';
            style.textContent = `
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                #step-overlay .step-header {
                    font-size: 12px;
                    color: #94a3b8;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                #step-overlay .step-header span {
                    color: #00D4AA;
                    font-weight: 600;
                }
                #step-overlay .step-flow {
                    margin-bottom: 12px;
                    font-size: 14px;
                }
                #step-overlay .step-from,
                #step-overlay .step-to {
                    margin-bottom: 4px;
                    color: #cbd5e1;
                }
                #step-overlay .step-from span {
                    color: #00D4AA;
                    font-weight: 600;
                }
                #step-overlay .step-to span {
                    color: #FF6B35;
                    font-weight: 600;
                }
                #step-overlay .step-description {
                    font-size: 14px;
                    color: #e2e8f0;
                    line-height: 1.5;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 12px;
                }
                #step-overlay.animating .step-header span {
                    animation: pulse 1s ease-in-out infinite;
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(overlay);
    }

    // Update the step overlay with current step info
    updateStepOverlay(from, to, currentStep, totalSteps) {
        const stepCurrentEl = document.getElementById('step-current');
        const stepTotalEl = document.getElementById('step-total');
        const stepFromEl = document.getElementById('step-from');
        const stepToEl = document.getElementById('step-to');
        const stepDescEl = document.getElementById('step-description');
        const overlay = document.getElementById('step-overlay');

        if (stepCurrentEl) stepCurrentEl.textContent = currentStep + 1;
        if (stepTotalEl) stepTotalEl.textContent = totalSteps;
        if (stepFromEl) stepFromEl.textContent = from;
        if (stepToEl) stepToEl.textContent = to;
        if (stepDescEl) stepDescEl.textContent = this.getSimpleDescription(from, to);
        if (overlay) overlay.classList.add('animating');
    }

    // Hide and remove the step overlay
    hideStepOverlay() {
        const overlay = document.getElementById('step-overlay');
        if (overlay) {
            overlay.style.animation = 'slideUp 0.2s ease-out reverse';
            setTimeout(() => overlay.remove(), 200);
        }
    }

    // Play flow animation - arrows light up in sequence with drawing effect
    playFlowAnimation() {
        if (!this.linkElements || !this.data || !this.data.links) {
            console.warn('No links to animate');
            return;
        }

        // Stop any existing animation completely first
        this.stopAnimation(true); // silent stop without callback

        // Small delay to ensure clean state
        setTimeout(() => {
            this._startAnimation();
        }, 100);
    }

    _startAnimation() {
        this.isAnimating = true;
        this.isPaused = false;
        this.animationTimeoutId = null;

        // Notify state change
        this._notifyStateChange('playing');

        // Get links sorted by step number
        this.animationData = {
            linksWithOrder: this.data.links
                .map((link, index) => ({
                    link,
                    index,
                    step: this.getStepNumber(link.description)
                }))
                .sort((a, b) => {
                    // Sort by step number, handling letters like "3a", "3b"
                    const aNum = parseFloat(a.step) || 999;
                    const bNum = parseFloat(b.step) || 999;
                    if (aNum !== bNum) return aNum - bNum;
                    return String(a.step).localeCompare(String(b.step));
                }),
            currentStep: 0,
            completedIndices: new Set(),
            stepDuration: 3000,
            drawDuration: 1500,
            activeColor: '#00D4AA',
            completedColor: '#FF6B35',
            pulseColor: '#FFFFFF'
        };

        // Dim all arrows first
        this.svg.selectAll('.links line')
            .transition()
            .duration(500)
            .attr('stroke', '#555')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.4);

        // Show step overlay
        this.showStepOverlay();

        // Start animation after initial dim
        this.animationTimeoutId = setTimeout(() => this._animateStep(), 600);
    }

    _animateStep() {
        if (!this.isAnimating) return;
        if (this.isPaused) return; // Don't proceed if paused

        const { linksWithOrder, currentStep, stepDuration, drawDuration, activeColor, completedColor, pulseColor } = this.animationData;

        if (currentStep >= linksWithOrder.length) {
            // Animation complete - update overlay to show completion
            const stepDescEl = document.getElementById('step-description');
            if (stepDescEl) stepDescEl.textContent = 'Animation complete!';
            this.animationTimeoutId = setTimeout(() => {
                if (this.isAnimating) {
                    this.stopAnimation();
                }
            }, 2000);
            return;
        }

        const { link, index } = linksWithOrder[currentStep];
        const linkLine = this.svg.selectAll('.links line').filter((d, i) => i === index);

        // Update step overlay with from/to node names
        this.updateStepOverlay(link.from, link.to, currentStep, linksWithOrder.length);

        // Get line length for stroke-dasharray animation
        const lineNode = linkLine.node();
        if (lineNode) {
            const lineLength = lineNode.getTotalLength ? lineNode.getTotalLength() : 200;

            // Phase 1: Draw the line with stroke-dashoffset animation
            linkLine
                .attr('stroke', activeColor)
                .attr('stroke-width', 5)
                .attr('stroke-dasharray', lineLength)
                .attr('stroke-dashoffset', lineLength)
                .transition()
                .duration(drawDuration)
                .ease(d3.easeQuadOut)
                .attr('stroke-dashoffset', 0)
                // Phase 2: Pulse effect
                .transition()
                .duration(300)
                .attr('stroke', pulseColor)
                .attr('stroke-width', 7)
                .transition()
                .duration(300)
                .attr('stroke', activeColor)
                .attr('stroke-width', 5)
                // Phase 3: Settle to completed state
                .transition()
                .duration(500)
                .attr('stroke', completedColor)
                .attr('stroke-width', 3)
                .attr('stroke-dasharray', 'none');
        }

        this.animationData.completedIndices.add(index);
        this.animationData.currentStep++;
        this.animationTimeoutId = setTimeout(() => this._animateStep(), stepDuration);
    }

    // Pause the animation
    pauseAnimation() {
        if (!this.isAnimating || this.isPaused) return;

        this.isPaused = true;

        // Clear pending timeout
        if (this.animationTimeoutId) {
            clearTimeout(this.animationTimeoutId);
            this.animationTimeoutId = null;
        }

        this._notifyStateChange('paused');
    }

    // Resume the animation
    resumeAnimation() {
        if (!this.isAnimating || !this.isPaused) return;

        this.isPaused = false;
        this._notifyStateChange('playing');

        // Continue from where we left off
        this._animateStep();
    }

    // Stop animation and reset styles
    stopAnimation(silent = false) {
        // Clear any pending timeout first
        if (this.animationTimeoutId) {
            clearTimeout(this.animationTimeoutId);
            this.animationTimeoutId = null;
        }

        this.isAnimating = false;
        this.isPaused = false;
        this.animationData = null;

        // Hide step overlay
        this.hideStepOverlay();

        if (this.svg) {
            this.svg.selectAll('.links line')
                .interrupt() // Stop any running transitions
                .transition()
                .duration(500)
                .attr('stroke', '#333')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', 'none')
                .attr('stroke-dashoffset', 0)
                .attr('opacity', 1);
        }

        if (!silent) {
            this._notifyStateChange('stopped');
        }
    }

    // Set callback for animation state changes
    setAnimationStateCallback(callback) {
        this.onAnimationStateChange = callback;
    }

    _notifyStateChange(state) {
        if (this.onAnimationStateChange) {
            this.onAnimationStateChange(state);
        }
    }
}

