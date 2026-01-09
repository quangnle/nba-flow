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
        this.onStepChangeCallback = null;
        this.onAnimationStateChange = null;
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
                if (event.defaultPrevented) return; // Ignore if drag handled it
                if (this.isDragging) return; // Double check custom flag
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
                    this.isDragging = false; // Reset drag flag
                    // Raise the node group
                    d3.select(event.sourceEvent.target.closest('g.node') || event.sourceEvent.target)
                        .raise();
                })
                .on('drag', (event, d) => {
                    this.isDragging = true; // Mark as dragging

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
                    if (this.isDragging) {
                        this.savePositions();
                        // Delay clearing flag to ensure click handler sees it
                        setTimeout(() => { this.isDragging = false; }, 50);
                    }
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
            <div class="step-badge">Step <span id="step-current">1</span>/<span id="step-total">?</span></div>
            <div class="step-content">
                <div class="step-summary" id="step-summary">Loading...</div>
                <div class="step-hint">See full details in Info Panel 👉</div>
            </div>
        `;

        // New styles for floating overlay
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            transform: translate(-50%, -120%); /* Center horizontally, move above target */
            background: rgba(15, 23, 42, 0.95);
            color: white;
            padding: 12px 16px;
            border-radius: 12px;
            width: 280px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
            font-family: 'Plus Jakarta Sans', sans-serif;
            z-index: 1000;
            backdrop-filter: blur(10px);
            opacity: 0;
            pointer-events: auto;
            cursor: pointer;
            transition: top 0.5s ease, left 0.5s ease, opacity 0.3s, transform 0.2s;
        `;

        // Add click listener to show info
        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.animationData && this.animationData.linksWithOrder) {
                const currentItem = this.animationData.linksWithOrder[this.animationData.currentStep];
                if (currentItem && currentItem.link && this.onItemClick) {
                    // Highlight the click effect
                    overlay.style.transform = 'translate(-50%, -120%) scale(0.95)';
                    setTimeout(() => {
                        overlay.style.transform = 'translate(-50%, -120%) scale(1)';
                    }, 100);

                    this.onItemClick(currentItem.link, 'link');
                }
            }
        });

        // Arrow triangle at bottom
        const arrow = document.createElement('div');
        arrow.style.cssText = `
             position: absolute;
             bottom: -6px;
             left: 50%;
             transform: translateX(-50%) rotate(45deg);
             width: 12px;
             height: 12px;
             background: rgba(15, 23, 42, 0.95);
             border-right: 1px solid rgba(255,255,255,0.1);
             border-bottom: 1px solid rgba(255,255,255,0.1);
        `;
        overlay.appendChild(arrow);

        // Add specific styles for internal elements
        if (!document.getElementById('floating-overlay-styles')) {
            const style = document.createElement('style');
            style.id = 'floating-overlay-styles';
            style.textContent = `
                #step-overlay .step-badge {
                    display: inline-block;
                    background: #00D4AA;
                    color: #0f172a;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                }
                #step-overlay .step-summary {
                    font-size: 13px;
                    line-height: 1.4;
                    color: #f1f5f9;
                    font-weight: 500;
                }
                #step-overlay .step-hint {
                    font-size: 10px;
                    color: #94a3b8;
                    margin-top: 6px;
                    font-style: italic;
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(overlay);

        // Force reflow
        overlay.offsetHeight;
        overlay.style.opacity = '1';
    }

    // Update the step overlay with position
    updateStepOverlay(from, to, description, currentStep, totalSteps, x, y) {
        const stepCurrentEl = document.getElementById('step-current');
        const stepTotalEl = document.getElementById('step-total');
        const stepSummaryEl = document.getElementById('step-summary');
        const overlay = document.getElementById('step-overlay');

        if (!overlay) return;

        if (stepCurrentEl) stepCurrentEl.textContent = currentStep + 1;
        if (stepTotalEl) stepTotalEl.textContent = totalSteps;

        if (stepSummaryEl) {
            let summary = this.getSimpleDescription(from, to);
            // Try to extract bold text or first line from description
            if (description) {
                const firstLine = description.split('\n')[0];
                summary = firstLine.replace(/\*\*/g, '').replace(/^-\s*/, '').replace(/\[.*?\]\s*/, '');
            }
            stepSummaryEl.textContent = summary;
        }

        // Move overlay
        if (x !== undefined && y !== undefined) {
            overlay.style.left = x + 'px';
            overlay.style.top = y + 'px';
        }
    }

    // Hide and remove the step overlay
    hideStepOverlay() {
        const overlay = document.getElementById('step-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    // Play flow animation - arrows light up in sequence with drawing effect
    startAnimation() {
        if (this.isAnimating && !this.isPaused) return;

        // Reset if we're at the end
        if (this.animationData && this.animationData.currentStep >= this.animationData.linksWithOrder.length) {
            this.stopAnimation();
        }

        if (!this.isAnimating) {
            this._startAnimation();
        } else {
            this.resumeAnimation();
        }
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
        if (this.isPaused) return;

        const { linksWithOrder, currentStep, stepDuration, drawDuration, activeColor, completedColor, pulseColor } = this.animationData;

        if (currentStep >= linksWithOrder.length) {
            // Animation complete
            this.stopAnimation();
            return;
        }

        const item = linksWithOrder[currentStep];
        const link = item.link;
        const index = item.index;

        // Highlight current step
        const visibleLink = this.svg.selectAll('.links line.link').filter((_, i) => i === index);

        // Calculate midpoint for floating overlay
        const fromNode = this.data.nodes.find(n => n.node_name === link.from);
        const toNode = this.data.nodes.find(n => n.node_name === link.to);

        let overlayX = window.innerWidth / 2;
        let overlayY = window.innerHeight / 2;

        if (fromNode && toNode) {
            const offset = link.curve_offset || 0;
            const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);

            const startX = this.getLinkStartX(fromNode, link) + Math.sin(angle) * offset;
            const startY = this.getLinkStartY(fromNode, link) - Math.cos(angle) * offset;
            const endX = this.getLinkEndX(toNode, link) + Math.sin(angle) * offset;
            const endY = this.getLinkEndY(toNode, link) - Math.cos(angle) * offset;

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            // Scroll container to keep active link in view
            const container = document.getElementById('diagram-container');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const scrollX = midX - containerRect.width / 2;
                const scrollY = midY - containerRect.height / 2;

                container.scrollTo({
                    top: Math.max(0, scrollY),
                    left: Math.max(0, scrollX),
                    behavior: 'smooth'
                });
            }

            overlayX = midX;
            overlayY = midY;
        }

        // Update Overlay
        this.updateStepOverlay(
            link.from,
            link.to,
            link.description,
            currentStep,
            linksWithOrder.length,
            overlayX,
            overlayY
        );

        // Callback for side panel
        if (this.onStepChangeCallback) {
            this.onStepChangeCallback(link);
        }

        // Animate Line
        const lineNode = visibleLink.node();
        if (lineNode) {
            const lineLength = lineNode.getTotalLength ? lineNode.getTotalLength() : 200;

            visibleLink
                .attr('stroke', activeColor)
                .attr('stroke-width', 5)
                .attr('opacity', 1)
                .attr('stroke-dasharray', lineLength)
                .attr('stroke-dashoffset', lineLength)
                .transition()
                .duration(drawDuration)
                .ease(d3.easeQuadOut)
                .attr('stroke-dashoffset', 0)
                .on('end', () => {
                    if (this.isAnimating && !this.isPaused) {
                        this.animationData.completedIndices.add(index);

                        visibleLink
                            .transition()
                            .duration(300)
                            .attr('stroke', completedColor)
                            .attr('stroke-width', 3)
                            .attr('stroke-dasharray', null);

                        this.animationData.currentStep++;
                        this.animationTimeoutId = setTimeout(() => this._animateStep(), stepDuration);
                    }
                });
        }
    }

    pauseAnimation() {
        if (!this.isAnimating) return;
        this.isPaused = true;
        if (this.animationTimeoutId) {
            clearTimeout(this.animationTimeoutId);
            this.animationTimeoutId = null;
        }
        this.svg.selectAll('.links line').interrupt(); // Stop transitions
        this._notifyStateChange('paused');
    }

    resumeAnimation() {
        if (!this.isAnimating || !this.isPaused) return;
        this.isPaused = false;
        this._notifyStateChange('playing');
        this._animateStep();
    }

    nextStep() {
        if (!this.isAnimating && !this.isPaused) this.startAnimation();

        this.pauseAnimation(); // Manual control means we are paused

        // Complete current step visually immediately
        if (this.animationData && this.animationData.currentStep < this.animationData.linksWithOrder.length) {
            const item = this.animationData.linksWithOrder[this.animationData.currentStep];
            if (item) {
                this.animationData.completedIndices.add(item.index);
                this.svg.selectAll('.links line.link').filter((_, i) => i === item.index)
                    .attr('stroke', this.animationData.completedColor)
                    .attr('stroke-width', 3)
                    .attr('stroke-dasharray', null)
                    .attr('stroke-dashoffset', null)
                    .attr('opacity', 1);
            }
        }

        if (this.animationData.currentStep < this.animationData.linksWithOrder.length) {
            this.animationData.currentStep++;
        }

        if (this.animationData.currentStep >= this.animationData.linksWithOrder.length) {
            this.stopAnimation();
        } else {
            this._showStepStatic(this.animationData.currentStep);
        }
    }

    prevStep() {
        if (!this.animationData) return;

        this.pauseAnimation();

        if (this.animationData.currentStep > 0) {
            // Revert current step visual
            if (this.animationData.currentStep < this.animationData.linksWithOrder.length) {
                const curItem = this.animationData.linksWithOrder[this.animationData.currentStep];
                // If it was already highlighted (completed), revert it
                this.svg.selectAll('.links line.link').filter((_, i) => i === curItem.index)
                    .attr('stroke', '#555')
                    .attr('opacity', 0.4);
            }

            this.animationData.currentStep--;

            // Revert previous step from completed to active/static
            const prevItem = this.animationData.linksWithOrder[this.animationData.currentStep];
            this.animationData.completedIndices.delete(prevItem.index);

            this._showStepStatic(this.animationData.currentStep);
        }
    }

    _showStepStatic(stepIndex) {
        const item = this.animationData.linksWithOrder[stepIndex];
        const link = item.link;
        const index = item.index;

        // Reset visual to active state (no animation)
        const visibleLink = this.svg.selectAll('.links line.link').filter((_, i) => i === index);
        visibleLink
            .interrupt()
            .attr('stroke', this.animationData.activeColor)
            .attr('stroke-width', 5)
            .attr('opacity', 1)
            .attr('stroke-dasharray', null)
            .attr('stroke-dashoffset', null);

        // Trigger overlay update (copy logic from _animateSelf or refactor)
        // For brevity, calling refactored logic via timeout or direct call if exposed
        // Re-using calculation logic briefly here:
        const fromNode = this.data.nodes.find(n => n.node_name === link.from);
        const toNode = this.data.nodes.find(n => n.node_name === link.to);
        let overlayX = 0, overlayY = 0;
        if (fromNode && toNode) {
            const offset = link.curve_offset || 0;
            const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
            const startX = this.getLinkStartX(fromNode, link) + Math.sin(angle) * offset;
            const startY = this.getLinkStartY(fromNode, link) - Math.cos(angle) * offset;
            const endX = this.getLinkEndX(toNode, link) + Math.sin(angle) * offset;
            const endY = this.getLinkEndY(toNode, link) - Math.cos(angle) * offset;
            overlayX = (startX + endX) / 2;
            overlayY = (startY + endY) / 2;

            const container = document.getElementById('diagram-container');
            const containerRect = container.getBoundingClientRect();
            container.scrollTo({
                top: Math.max(0, overlayY - containerRect.height / 2),
                left: Math.max(0, overlayX - containerRect.width / 2),
                behavior: 'smooth'
            });
        }

        this.updateStepOverlay(link.from, link.to, link.description, stepIndex, this.animationData.linksWithOrder.length, overlayX, overlayY);

        if (this.onStepChangeCallback) {
            this.onStepChangeCallback(link);
        }
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

    // Set callback for step changes (syncs with side panel)
    setStepChangeCallback(callback) {
        this.onStepChangeCallback = callback;
    }
}

