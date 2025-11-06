// src/Simulator.ts
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
}