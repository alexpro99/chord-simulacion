import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { RingStatus, Node } from '../types';

interface RingVisualizationProps {
    ringStatus: RingStatus | null;
    selectedNode: Node | null;
    onNodeSelect: (node: Node) => void;
}

const RingVisualization: React.FC<RingVisualizationProps> = ({
    ringStatus,
    selectedNode,
    onNodeSelect
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!ringStatus || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Limpiar contenido anterior

        const width = 600;
        const height = 600;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 200;

        // Configurar SVG
        svg.attr('width', width)
           .attr('height', height);

        // Dibujar el anillo exterior
        svg.append('circle')
           .attr('cx', centerX)
           .attr('cy', centerY)
           .attr('r', radius)
           .attr('fill', 'none')
           .attr('stroke', '#ddd')
           .attr('stroke-width', 2);

        // Dibujar el anillo interior (para IDs)
        svg.append('circle')
           .attr('cx', centerX)
           .attr('cy', centerY)
           .attr('r', radius - 40)
           .attr('fill', 'none')
           .attr('stroke', '#eee')
           .attr('stroke-width', 1);

        // Calcular posiciones de los nodos
        const nodes = ringStatus.nodes.sort((a, b) => a.id - b.id);
        const angleStep = (2 * Math.PI) / ringStatus.identifierSpaceSize;

        // Dibujar líneas de IDs (opcional, cada 32 IDs)
        for (let i = 0; i < ringStatus.identifierSpaceSize; i += 32) {
            const angle = i * angleStep - Math.PI / 2;
            const x1 = centerX + (radius - 40) * Math.cos(angle);
            const y1 = centerY + (radius - 40) * Math.sin(angle);
            const x2 = centerX + radius * Math.cos(angle);
            const y2 = centerY + radius * Math.sin(angle);

            svg.append('line')
               .attr('x1', x1)
               .attr('y1', y1)
               .attr('x2', x2)
               .attr('y2', y2)
               .attr('stroke', '#f0f0f0')
               .attr('stroke-width', 1);
        }

        // Dibujar conexiones entre nodos (sucesores)
        nodes.forEach(node => {
            const successor = nodes.find(n => n.id === node.successor);
            if (successor && successor !== node) {
                const startAngle = node.id * angleStep - Math.PI / 2;
                const endAngle = successor.id * angleStep - Math.PI / 2;

                const startX = centerX + (radius - 20) * Math.cos(startAngle);
                const startY = centerY + (radius - 20) * Math.sin(startAngle);
                const endX = centerX + (radius - 20) * Math.cos(endAngle);
                const endY = centerY + (radius - 20) * Math.sin(endAngle);

                svg.append('line')
                   .attr('x1', startX)
                   .attr('y1', startY)
                   .attr('x2', endX)
                   .attr('y2', endY)
                   .attr('stroke', '#007bff')
                   .attr('stroke-width', 2)
                   .attr('opacity', 0.6);
            }
        });

        // Dibujar nodos
        const nodeGroups = svg.selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .style('cursor', 'pointer');

        // Círculos de nodos
        nodeGroups.append('circle')
            .attr('cx', d => centerX + radius * Math.cos(d.id * angleStep - Math.PI / 2))
            .attr('cy', d => centerY + radius * Math.sin(d.id * angleStep - Math.PI / 2))
            .attr('r', d => selectedNode && d.id === selectedNode.id ? 15 : 12)
            .attr('fill', d => {
                if (selectedNode && d.id === selectedNode.id) return '#ff6b6b';
                if (d.dataCount > 0) return '#4ecdc4';
                return '#45b7d1';
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Etiquetas de nodos
        nodeGroups.append('text')
            .attr('x', d => centerX + (radius + 25) * Math.cos(d.id * angleStep - Math.PI / 2))
            .attr('y', d => centerY + (radius + 25) * Math.sin(d.id * angleStep - Math.PI / 2))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .text(d => d.id);

        // Contadores de datos
        nodeGroups.append('text')
            .attr('x', d => centerX + radius * Math.cos(d.id * angleStep - Math.PI / 2))
            .attr('y', d => centerY + radius * Math.sin(d.id * angleStep - Math.PI / 2))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#fff')
            .attr('font-weight', 'bold')
            .text(d => d.dataCount > 0 ? d.dataCount : '');

        // Tooltips
        nodeGroups.append('title')
            .text(d => `Nodo ${d.id}\nSucesor: ${d.successor}\nPredecesor: ${d.predecessor ?? 'Ninguno'}\nDatos: ${d.dataCount}`);

        // Eventos de click
        nodeGroups.on('click', (event, d) => {
            onNodeSelect(d);
        });

        // Leyenda
        const legend = svg.append('g')
            .attr('transform', `translate(20, 20)`);

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 8)
            .attr('fill', '#45b7d1');

        legend.append('text')
            .attr('x', 15)
            .attr('y', 0)
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '12px')
            .text('Nodo vacío');

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 20)
            .attr('r', 8)
            .attr('fill', '#4ecdc4');

        legend.append('text')
            .attr('x', 15)
            .attr('y', 20)
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '12px')
            .text('Nodo con datos');

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 40)
            .attr('r', 8)
            .attr('fill', '#ff6b6b');

        legend.append('text')
            .attr('x', 15)
            .attr('y', 40)
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '12px')
            .text('Nodo seleccionado');

    }, [ringStatus, selectedNode, onNodeSelect]);

    if (!ringStatus) {
        return (
            <div className="ring-visualization loading">
                <p>Cargando visualización del anillo...</p>
            </div>
        );
    }

    return (
        <div className="ring-visualization">
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default RingVisualization;