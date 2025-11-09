import express from 'express';
import cors from 'cors';
import { Simulator } from '../Simulador';
import { Node } from '../Node';
import { config } from 'dotenv';

config();

const app = express();
const PORT = 3000;

// Middleware CORS
app.use(cors({
    origin: ['http://localhost:1234', 'http://localhost:3000', 'http://localhost:50802'],
    credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Configuración del simulador
const M = Number(process.env.M) || 8;
const NUM_INITIAL_NODES = Number(process.env.NUM_INITIAL_NODES) || 5;

const simulator = new Simulator(M);
let nodes: Node[] = [];
let firstNode: Node | null = null;

// Función para inicializar nodos base
function initializeNodes() {
  console.log(`Inicializando ${NUM_INITIAL_NODES} nodos base...`);

  for (let i = 0; i < NUM_INITIAL_NODES; i++) {
    const nodeId = simulator.getRandomNodeId();
    const newNode = new Node(nodeId, M, simulator);

    newNode.join(firstNode);
    simulator.addNode(newNode);
    nodes.push(newNode);

    if (!firstNode) {
      firstNode = newNode;
    }
  }

  // Estabilización inicial
  console.log('Ejecutando estabilización inicial...');
  for (let i = 0; i < 10; i++) {
    const allNodes = simulator.getAllNodes();
    for (const node of allNodes) {
      node.stabilize();
      node.fixFingers();
    }
  }

  console.log('Simulador inicializado con', nodes.length, 'nodos');
}

// Inicializar nodos al iniciar el servidor
initializeNodes();

// Estabilización periódica cada 30 segundos
setInterval(() => {
  const allNodes = simulator.getAllNodes();
  for (const node of allNodes) {
    try {
      node.stabilize();
      node.fixFingers();
    } catch (error) {
      console.log(error)      
    }
  }
}, 10000);

// Función hash simple para claves
function hashKey(key: string): number {
  return key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % simulator.identifierSpaceSize;
}

// Endpoints

// GET /status - Estado general del anillo
app.get('/status', (req, res) => {
  const allNodes = simulator.getAllNodes();
  res.json({
    m: M,
    identifierSpaceSize: simulator.identifierSpaceSize,
    nodeCount: allNodes.length,
    nodes: allNodes.map(node => node.toJSON())
  });
});

// POST /nodes - Agregar un nuevo nodo
app.post('/nodes', (req, res) => {
  try {
    const nodeId = simulator.getRandomNodeId();
    const newNode = new Node(nodeId, M, simulator);

    // Encontrar un nodo existente para unirse
    const existingNode = firstNode || (nodes.length > 0 ? nodes[0] : null);
    newNode.join(existingNode);
    simulator.addNode(newNode);
    nodes.push(newNode);

    if (!firstNode) {
      firstNode = newNode;
    }

    res.json({
      success: true,
      node: newNode.toJSON(),
      message: `Nodo ${nodeId} agregado al anillo`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al agregar nodo'
    });
  }
});

// DELETE /nodes/:id - Eliminar un nodo
app.delete('/nodes/:id', (req, res) => {
  try {
    const nodeId = parseInt(req.params.id);
    const success = simulator.removeNode(nodeId);

    if (success) {
      // Remover de la lista local
      nodes = nodes.filter(node => node.id !== nodeId);

      // Actualizar firstNode si es necesario
      if (firstNode && firstNode.id === nodeId) {
        firstNode = nodes.length > 0 ? nodes[0] : null;
      }

      res.json({
        success: true,
        message: `Nodo ${nodeId} eliminado del anillo`
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Nodo no encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar nodo'
    });
  }
});

// POST /data - Almacenar un dato
app.post('/data', (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || !value) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren key y value'
      });
    }

    const keyId = hashKey(key);

    if (nodes.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No hay nodos disponibles'
      });
    }

    // Encontrar el nodo responsable
    const responsibleNode = nodes[0].findSuccessor(keyId);
    responsibleNode.data.set(keyId, value);

    res.json({
      success: true,
      key,
      keyId,
      responsibleNode: responsibleNode.id,
      message: `Dato almacenado en el nodo ${responsibleNode.id}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al almacenar dato'
    });
  }
});

// GET /data/:key - Buscar un dato
app.get('/data/:key', (req, res) => {
  try {
    const key = req.params.key;
    const keyId = hashKey(key);

    if (nodes.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No hay nodos disponibles'
      });
    }

    // Buscar desde un nodo aleatorio
    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
    const targetNode = randomNode.findSuccessor(keyId);
    const foundData = targetNode.data.get(keyId);

    if (foundData !== undefined) {
      res.json({
        success: true,
        key,
        keyId,
        value: foundData,
        foundInNode: targetNode.id
      });
    } else {
      res.status(404).json({
        success: false,
        key,
        keyId,
        error: 'Dato no encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al buscar dato'
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`API de Chord corriendo en puerto ${PORT}`);
  console.log(`Espacio de identificadores: 2^${M} = ${simulator.identifierSpaceSize}`);
  console.log(`Nodos iniciales: ${NUM_INITIAL_NODES}`);
});

export default app;