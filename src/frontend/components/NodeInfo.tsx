import React from 'react';
import { Node } from '../types';

interface NodeInfoProps {
    node: Node | null;
    onClose: () => void;
}

const NodeInfo: React.FC<NodeInfoProps> = ({ node, onClose }) => {
    if (!node) {
        return (
            <div className="panel node-info">
                <h3>Información del Nodo</h3>
                <p className="no-selection">
                    <span className="no-selection-icon">🔍</span>
                    <br />
                    Selecciona un nodo del anillo para ver sus detalles
                </p>
            </div>
        );
    }

    return (
        <div className="panel node-info">
            <div className="panel-header">
                <h3>Información del Nodo</h3>
                <button onClick={onClose} className="close-btn" title="Cerrar panel">✕</button>
            </div>

            <div className="panel-section">
                <div className="node-details">
                    <div className="detail-item">
                        <label>ID del Nodo:</label>
                        <span className="node-id-large">{node.id}</span>
                    </div>

                    <div className="detail-item">
                        <label>Sucesor:</label>
                        <span className="node-link">{node.successor}</span>
                    </div>

                    <div className="detail-item">
                        <label>Predecesor:</label>
                        <span className="node-link">{node.predecessor ?? 'Ninguno'}</span>
                    </div>

                    <div className="detail-item">
                        <label>Datos almacenados:</label>
                        <span className={`data-count ${node.dataCount > 0 ? 'has-data' : 'no-data'}`}>
                            {node.dataCount} {node.dataCount === 1 ? 'elemento' : 'elementos'}
                        </span>
                    </div>
                </div>
            </div>

            {/* <div className="panel-section">
                <div className="node-position">
                    <h4>Posición en el Anillo</h4>
                    <div className="ring-position">
                        <div className="position-indicator">
                            <div
                                className="position-dot"
                                style={{
                                    transform: `rotate(${(node.id / 256) * 360}deg) translateY(-80px)`
                                }}
                            ></div>
                        </div>
                        <div className="position-info">
                            <span className="position-value">{Math.round((node.id / 256) * 100)}%</span>
                            <span className="position-label">del anillo</span>
                        </div>
                    </div>
                </div>
            </div> */}

            <div className="panel-section">
                <div className="node-explanation">
                    <h4>¿Qué significa esto?</h4>
                    <ul>
                        <li><strong>ID:</strong> Identificador único del nodo en el espacio de 256 IDs (0-255)</li>
                        <li><strong>Sucesor:</strong> Nodo siguiente en el anillo (donde se envían las búsquedas)</li>
                        <li><strong>Predecesor:</strong> Nodo anterior en el anillo</li>
                        <li><strong>Datos:</strong> Cantidad de pares clave-valor almacenados en este nodo</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NodeInfo;