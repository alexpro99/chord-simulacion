import { Node } from './Node';

export class Simulator {
    private nodes: Map<number, Node> = new Map();
    public readonly m: number;
    public readonly identifierSpaceSize: number;

    constructor(m: number) {
        this.m = m;
        this.identifierSpaceSize = Math.pow(2, m);
    }

    // "Conecta" un nuevo nodo a nuestra red simulada
    addNode(node: Node) {
        console.log(`[Simulator] Agregando nodo ${node.id}`);
        this.nodes.set(node.id, node);
    }

    // Permite que un nodo encuentre a otro por su ID
    getNode(id: number): Node | undefined {
        return this.nodes.get(id);
    }
    
    // Obtiene todos los nodos para el bucle de estabilización
    getAllNodes(): Node[] {
        return Array.from(this.nodes.values());
    }

    // Helper para crear un ID de nodo único y no repetido
    getRandomNodeId(): number {
        let id: number;
        do {
            id = Math.floor(Math.random() * this.identifierSpaceSize);
        } while (this.nodes.has(id));
        return id;
    }

    // Elimina un nodo del simulador
    removeNode(nodeId: number): boolean {
        const node = this.nodes.get(nodeId);
        if (!node) {
            return false;
        }

        // Notificar al predecesor y sucesor para actualizar sus referencias
        const predecessor = node.predecessor;
        const successor = node.successor;

        if (predecessor && predecessor !== node) {
            predecessor.successor = successor;
        }
        if (successor && successor !== node) {
            successor.predecessor = predecessor;
        }

        // Transferir datos al sucesor antes de eliminar
        for (const [key, value] of node.data) {
            successor.data.set(key, value);
        }

        // Remover el nodo del mapa
        this.nodes.delete(nodeId);
        console.log(`[Simulator] Nodo ${nodeId} eliminado`);
        return true;
    }
}