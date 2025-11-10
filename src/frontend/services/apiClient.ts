import { RingStatus, AddNodeResponse, RemoveNodeResponse, StoreDataResponse, FindDataResponse } from '../types';

const API_BASE_URL = 'http://localhost:3000';

class ApiClient {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async getStatus(): Promise<RingStatus> {
        return this.request<RingStatus>('/status');
    }

    async addNode(): Promise<AddNodeResponse> {
        return this.request<AddNodeResponse>('/nodes', {
            method: 'POST',
        });
    }

    async removeNode(nodeId: number): Promise<RemoveNodeResponse> {
        return this.request<RemoveNodeResponse>(`/nodes/${nodeId}`, {
            method: 'DELETE',
        });
    }

    async storeData(key: string, value: string): Promise<StoreDataResponse> {
        return this.request<StoreDataResponse>('/data', {
            method: 'POST',
            body: JSON.stringify({ key, value }),
        });
    }

    async findData(key: string, nodeId?: number): Promise<FindDataResponse> {
        const url = nodeId ? `/data/${encodeURIComponent(key)}?nodeId=${nodeId}` : `/data/${encodeURIComponent(key)}`;
        return this.request<FindDataResponse>(url);
    }
}

export const apiClient = new ApiClient();