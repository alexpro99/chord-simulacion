import { Simulator } from "./Simulador";

export class Node {
  public readonly id: number;
  private readonly m: number; // Número de bits en el identificador (ej. 8 para un anillo de 256)

  // Almacenamiento clave-valor de este nodo
  public data: Map<number, string> = new Map();

  // Estructuras de Chord
  public fingerTable: Node[];
  public predecessor: Node | null = null;

  private simulator: Simulator;

  constructor(id: number, m: number, simulator: Simulator) {
    this.id = id;
    this.m = m;
    this.simulator = simulator;

    // La tabla de dedos tendrá m entradas. Inicialmente apuntan a sí mismo.
    this.fingerTable = new Array(m).fill(this);
  }

  // El sucesor es simplemente el primer dedo de la tabla
  get successor(): Node {
    return this.fingerTable[0];
  }

  set successor(node: Node) {
    this.fingerTable[0] = node;
  }

  // Función auxiliar para comprobar si un id está en el rango (start, end] en un círculo
  private isInRange(id: number, start: number, end: number): boolean {
    if (start < end) {
      return id > start && id <= end;
    } else {
      // El rango cruza el punto 0 del círculo
      return id > start || id <= end;
    }
  }

  /**
   * Encuentra el nodo sucesor para un ID dado.
   * Esta es la operación de búsqueda principal de Chord.
   */
  public findSuccessor(id: number, path: number[] = []): Node {
    const currentPath = [...path, this.id];
    if (path.includes(this.id)) {
      console.log(
        `¡ERROR! Bucle infinito detectado en la búsqueda de ${id}. Ruta: [${currentPath.join(
          " -> "
        )}]`
      );

      throw new Error(
        `Bucle infinito detectado en el nodo ${this.id} para la clave ${id}`
      );
    }

    // Caso base: si el id está entre este nodo y su sucesor, el sucesor es la respuesta
    if (this.isInRange(id, this.id, this.successor.id)) {
      return this.successor;
    }

    // Si no, busca en la finger table el salto más largo posible
    const closestPrecedingNode = this.closestPrecedingFinger(id);

    // Pide recursivamente a ese nodo que continúe la búsqueda
    // En una implementación real, esto sería una llamada de red (RPC)
    console.log(
      `[Nodo ${this.id}] Lookup para ${id}: saltando a ${closestPrecedingNode.id}`
    );
    return closestPrecedingNode.findSuccessor(id, currentPath);
  }

  /**
   * Busca en la finger table (de atrás para adelante) el nodo que precede más de cerca a 'id'.
   * Este es el "salto" inteligente de Chord.
   */
  private closestPrecedingFinger(id: number): Node {
    for (let i = this.m - 1; i >= 0; i--) {
      const fingerNode = this.fingerTable[i];
      if (this.isInRange(fingerNode.id, this.id, id)) {
        return fingerNode;
      }
    }
    // Si no se encuentra un dedo mejor, este nodo es el más cercano.
    return this;
  }

  /**
   * Un nodo se une a un anillo Chord contactando a un nodo existente.
   */
  public join(existingNode: Node | null) {
    if (existingNode) {
      // Encuentra nuestro propio sucesor pidiéndoselo a un nodo existente
      this.successor = existingNode.findSuccessor(this.id);
      console.log(
        `[Nodo ${this.id}] se une. Sucesor encontrado: ${this.successor.id}`
      );
    } else {
      // Este es el primer nodo en la red
      console.log(`[Nodo ${this.id}] creando un nuevo anillo Chord.`);
      this.successor = this;
      this.predecessor = this;
    }
  }

  /**
   * Se ejecuta periódicamente. Verifica el sucesor y notifica al sucesor de nuestra existencia.
   * Esto mantiene la corrección del puntero al sucesor.
   */
  public stabilize() {
    const successorPredecessor = this.successor.predecessor;
    if (
      successorPredecessor &&
      this.isInRange(successorPredecessor.id, this.id, this.successor.id)
    ) {
      this.successor = successorPredecessor;
    }
    this.successor.notify(this);
  }

  /**
   * Llamado por otro nodo que cree que podría ser nuestro predecesor.
   */
  public notify(potentialPredecessor: Node) {
    if (
      this.predecessor === null ||
      this.isInRange(potentialPredecessor.id, this.predecessor.id, this.id)
    ) {
      this.predecessor = potentialPredecessor;
    }
  }

  /**
   * Se ejecuta periódicamente. Actualiza una entrada de la finger table al azar.
   * Esto mantiene el rendimiento de las búsquedas (O(log N)).
   */
  public fixFingers() {
    // Elige un dedo al azar para actualizar
    const i = Math.floor(Math.random() * (this.m - 1)) + 1; // De 1 a m-1
    const fingerId =
      (this.id + Math.pow(2, i)) % this.simulator.identifierSpaceSize;

    // El nuevo valor para este dedo es el sucesor de 'fingerId'
    this.fingerTable[i] = this.findSuccessor(fingerId);
  }

  /**
   * Método para obtener información del nodo en formato JSON
   */
  public toJSON() {
    return {
      id: this.id,
      successor: this.successor.id,
      predecessor: this.predecessor?.id ?? null,
      dataCount: this.data.size
    };
  }
}
