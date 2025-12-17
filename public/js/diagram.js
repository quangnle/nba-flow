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

        // Create links with arrow markers
        this.linkElements = linkGroup
            .selectAll('line')
            .data(this.data.links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('marker-end', 'url(#arrowhead)')
            .attr('x1', d => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                if (!fromNode) return 0;
                return this.getLinkStartX(fromNode, d);
            })
            .attr('y1', d => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                if (!fromNode) return 0;
                return this.getLinkStartY(fromNode, d);
            })
            .attr('x2', d => {
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!toNode) return 0;
                return this.getLinkEndX(toNode, d);
            })
            .attr('y2', d => {
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!toNode) return 0;
                return this.getLinkEndY(toNode, d);
            })
            .on('mouseenter', function() {
                d3.select(this).attr('stroke', '#0066cc').attr('stroke-width', 3);
                d3.select('#arrowhead path').attr('fill', '#0066cc');
            })
            .on('mouseleave', function() {
                d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);
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
            .each(function(d) {
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
        this.linkElements
            .attr('x1', d => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                if (!fromNode) return 0;
                return this.getLinkStartX(fromNode, d);
            })
            .attr('y1', d => {
                const fromNode = this.data.nodes.find(n => n.node_name === d.from);
                if (!fromNode) return 0;
                return this.getLinkStartY(fromNode, d);
            })
            .attr('x2', d => {
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!toNode) return 0;
                return this.getLinkEndX(toNode, d);
            })
            .attr('y2', d => {
                const toNode = this.data.nodes.find(n => n.node_name === d.to);
                if (!toNode) return 0;
                return this.getLinkEndY(toNode, d);
            });
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
}

