export interface Node {
    id: number;
    successor: number;
    predecessor: number | null;
    dataCount: number;
}

export interface RingStatus {
    m: number;
    identifierSpaceSize: number;
    nodeCount: number;
    nodes: Node[];
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}

export interface AddNodeResponse {
    success: boolean;
    node: Node;
    message: string;
}

export interface RemoveNodeResponse {
    success: boolean;
    message: string;
}

export interface StoreDataResponse {
    success: boolean;
    key: string;
    keyId: number;
    responsibleNode: number;
    message: string;
}

export interface FindDataResponse {
    success: boolean;
    key: string;
    keyId: number;
    value: string;
    foundInNode: number;
}