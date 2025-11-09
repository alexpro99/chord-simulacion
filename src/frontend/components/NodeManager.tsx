import React, { useState } from 'react';
import { Node } from '../types';

interface NodeManagerProps {
    onAddNode: () => void;
    onRemoveNode: (nodeId: number) => void;
    nodes: Node[];
    loading: boolean;
}

const NodeManager: React.FC<NodeManagerProps> = ({ onAddNode, onRemoveNode, nodes, loading }) => {
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

    const handleRemoveNode = () => {
        if (selectedNodeId !== null) {
            onRemoveNode(selectedNodeId);
            setSelectedNodeId(null);
        }
    };

    return (
        <div className="panel node-manager">
            <h3>Gestión de Nodos</h3>

            <div className="panel-section">
                <button
                    onClick={onAddNode}
                    disabled={loading}
                    className="btn btn-primary"
                >
                    ➕ Agregar Nodo
                </button>
            </div>

            <div className="panel-section">
                <h4>Eliminar Nodo</h4>
                <select
                    value={selectedNodeId || ''}
                    onChange={(e) => setSelectedNodeId(e.target.value ? parseInt(e.target.value) : null)}
                    className="select-input"
                >
                    <option value="">Seleccionar nodo...</option>
                    {nodes.map(node => (
                        <option key={node.id} value={node.id}>
                            Nodo {node.id} ({node.dataCount} datos)
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleRemoveNode}
                    disabled={loading || selectedNodeId === null}
                    className="btn btn-danger"
                >
                    🗑️ Eliminar Nodo
                </button>
            </div>

            <div className="panel-section">
                <h4>Lista de Nodos ({nodes.length})</h4>
                <div className="node-list">
                    {nodes.map(node => (
                        <div key={node.id} className="node-item">
                            <span className="node-id">Nodo {node.id}</span>
                            <span className="node-data">📄 {node.dataCount}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NodeManager;