import React, { useState } from 'react';

interface DataManagerProps {
    onStoreData: (key: string, value: string) => void;
    onFindData: (key: string) => void;
    loading: boolean;
}

const DataManager: React.FC<DataManagerProps> = ({ onStoreData, onFindData, loading }) => {
    const [storeKey, setStoreKey] = useState('');
    const [storeValue, setStoreValue] = useState('');
    const [findKey, setFindKey] = useState('');

    const handleStore = () => {
        if (storeKey.trim() && storeValue.trim()) {
            onStoreData(storeKey.trim(), storeValue.trim());
            setStoreKey('');
            setStoreValue('');
        }
    };

    const handleFind = () => {
        if (findKey.trim()) {
            onFindData(findKey.trim());
            setFindKey('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') {
            action();
        }
    };

    return (
        <div className="panel data-manager">
            <h3>Gestión de Datos</h3>

            <div className="panel-section">
                <h4>Almacenar Dato</h4>
                <input
                    type="text"
                    placeholder="Clave"
                    value={storeKey}
                    onChange={(e) => setStoreKey(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleStore)}
                    className="text-input"
                    disabled={loading}
                />
                <input
                    type="text"
                    placeholder="Valor"
                    value={storeValue}
                    onChange={(e) => setStoreValue(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleStore)}
                    className="text-input"
                    disabled={loading}
                />
                <button
                    onClick={handleStore}
                    disabled={loading || !storeKey.trim() || !storeValue.trim()}
                    className="btn btn-primary"
                >
                    💾 Almacenar
                </button>
            </div>

            <div className="panel-section">
                <h4>Buscar Dato</h4>
                <input
                    type="text"
                    placeholder="Clave a buscar"
                    value={findKey}
                    onChange={(e) => setFindKey(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleFind)}
                    className="text-input"
                    disabled={loading}
                />
                <button
                    onClick={handleFind}
                    disabled={loading || !findKey.trim()}
                    className="btn btn-secondary"
                >
                    🔍 Buscar
                </button>
            </div>
        </div>
    );
};

export default DataManager;