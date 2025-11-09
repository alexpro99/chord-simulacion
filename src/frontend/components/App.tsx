import React, { useState, useEffect } from 'react';
import RingVisualization from './RingVisualization';
import NodeManager from './NodeManager';
import DataManager from './DataManager';
import NodeInfo from './NodeInfo';
import StatusBar from './StatusBar';
import { apiClient } from '../services/apiClient';
import { RingStatus, Node } from '../types';

const App: React.FC = () => {
    const [ringStatus, setRingStatus] = useState<RingStatus | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Cargar estado inicial del anillo
    const loadRingStatus = async () => {
        try {
            const status = await apiClient.getStatus();
            setRingStatus(status);
        } catch (err) {
            setError('Error al cargar el estado del anillo');
        }
    };

    // Actualización periódica del estado
    useEffect(() => {
        loadRingStatus();
        const interval = setInterval(loadRingStatus, 5000); // Actualizar cada 5 segundos
        return () => clearInterval(interval);
    }, []);

    // Mostrar mensajes temporales
    const showMessage = (message: string, type: 'success' | 'error') => {
        if (type === 'success') {
            setSuccess(message);
            setError(null);
        } else {
            setError(message);
            setSuccess(null);
        }
        setTimeout(() => {
            setSuccess(null);
            setError(null);
        }, 3000);
    };

    // Handlers para operaciones
    const handleAddNode = async () => {
        setLoading(true);
        try {
            const result = await apiClient.addNode();
            showMessage(result.message, 'success');
            await loadRingStatus(); // Recargar estado
        } catch (err) {
            showMessage('Error al agregar nodo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveNode = async (nodeId: number) => {
        setLoading(true);
        try {
            const result = await apiClient.removeNode(nodeId);
            showMessage(result.message, 'success');
            await loadRingStatus();
            if (selectedNode && selectedNode.id === nodeId) {
                setSelectedNode(null);
            }
        } catch (err) {
            showMessage('Error al eliminar nodo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStoreData = async (key: string, value: string) => {
        setLoading(true);
        try {
            const result = await apiClient.storeData(key, value);
            showMessage(`Dato almacenado en nodo ${result.responsibleNode}`, 'success');
            await loadRingStatus();
        } catch (err) {
            showMessage('Error al almacenar dato', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFindData = async (key: string) => {
        setLoading(true);
        try {
            const result = await apiClient.findData(key);
            showMessage(`Dato encontrado en nodo ${result.foundInNode}`, 'success');
        } catch (err) {
            if (err instanceof Error && err.message.includes('404')) {
                showMessage('Dato no encontrado', 'error');
            } else {
                showMessage('Error al buscar dato', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>Simulación Chord DHT</h1>
                <StatusBar
                    ringStatus={ringStatus}
                    loading={loading}
                    error={error}
                    success={success}
                />
            </header>

            <div className="app-content">
                <aside className="app-sidebar">
                    <NodeManager
                        onAddNode={handleAddNode}
                        onRemoveNode={handleRemoveNode}
                        nodes={ringStatus?.nodes || []}
                        loading={loading}
                    />
                    <DataManager
                        onStoreData={handleStoreData}
                        onFindData={handleFindData}
                        loading={loading}
                    />
                </aside>

                <main className="app-main">
                    <RingVisualization
                        ringStatus={ringStatus}
                        selectedNode={selectedNode}
                        onNodeSelect={setSelectedNode}
                    />
                </main>

                <aside className="app-info-panel">
                    <NodeInfo
                        node={selectedNode}
                        onClose={() => setSelectedNode(null)}
                    />
                </aside>
            </div>
        </div>
    );
};

export default App;