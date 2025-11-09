import React from 'react';
import { RingStatus } from '../types';

interface StatusBarProps {
    ringStatus: RingStatus | null;
    loading: boolean;
    error: string | null;
    success: string | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ ringStatus, loading, error, success }) => {
    return (
        <div className="status-bar">
            <div className="status-info">
                {ringStatus && (
                    <>
                        <span className="status-item">
                            <strong>M:</strong> {ringStatus.m}
                        </span>
                        <span className="status-item">
                            <strong>Espacio:</strong> 2^{ringStatus.m} = {ringStatus.identifierSpaceSize}
                        </span>
                        <span className="status-item">
                            <strong>Nodos:</strong> {ringStatus.nodeCount}
                        </span>
                    </>
                )}
            </div>

            <div className="status-messages">
                {loading && (
                    <div className="message loading">
                        <span className="spinner"></span>
                        Procesando...
                    </div>
                )}

                {error && (
                    <div className="message error">
                        ❌ {error}
                    </div>
                )}

                {success && (
                    <div className="message success">
                        ✅ {success}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusBar;