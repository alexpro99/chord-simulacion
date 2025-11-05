// src/main.ts
import { Node } from "./Node";
import { Simulator } from "./Simulador";

import { config } from "dotenv";

config();

const M = Number(process.env.M) || 8; // Anillo de 2^8 = 256 identificadores
const NUM_NODES = Number(process.env.NUM_NODES) || 10;

// 1. Iniciar el simulador
const simulator = new Simulator(M);

// 2. Crear y unir nodos al anillo
const nodes: Node[] = [];
let firstNode: Node | null = null;

console.log("================ ANILLO CHORD ================");

console.log("Identificadores: ", M);
console.log("Nodos: ", NUM_NODES);

console.log("==============================================");

for (let i = 0; i < NUM_NODES; i++) {
  const nodeId = simulator.getRandomNodeId();
  const newNode = new Node(nodeId, M, simulator);

  newNode.join(firstNode);
  simulator.addNode(newNode);
  nodes.push(newNode);

  if (!firstNode) {
    firstNode = newNode;
  }
}

// --- Bucle de estabilización de SUCESORES PRIMERO ---
console.log("\n--- Iniciando estabilización de SUCESORES ---");
const SUCCESSOR_STABILIZATION_TICKS = 10; // Dale tiempo a los sucesores
for (let i = 0; i < SUCCESSOR_STABILIZATION_TICKS; i++) {
  console.log(
    `\nTick de estabilización de sucesor ${
      i + 1
    }/${SUCCESSOR_STABILIZATION_TICKS}`
  );
  const allNodes = simulator.getAllNodes();
  for (const node of allNodes) {
    node.stabilize(); // Solo estabiliza sucesores
  }
}

// --- Bucle de estabilización COMPLETO (Sucesores + Dedos) ---
console.log("\n--- Iniciando estabilización completa ---");
const FULL_STABILIZATION_TICKS = 20;
for (let i = 0; i < FULL_STABILIZATION_TICKS; i++) {
  try {
    console.log(`\nTick de simulación ${i + 1}/${FULL_STABILIZATION_TICKS}`);
    const allNodes = simulator.getAllNodes();
    for (const node of allNodes) {
      node.stabilize();
      node.fixFingers();
    }
  } catch (error) {
    console.log(error);
  }
}

// // 3. Ejecutar el bucle de estabilización
// console.log("\n--- Iniciando estabilización del anillo ---");
// for (let i = 0; i < SIMULATION_TICKS; i++) {
//   console.log(`\nTick de simulación ${i + 1}/${SIMULATION_TICKS}`);
//   const allNodes = simulator.getAllNodes();
//   for (const node of allNodes) {
//     node.stabilize();
//     node.fixFingers();
//   }
// }
console.log("\n--- Estabilización completada ---");

// 4. Imprimir el estado final para verificar
nodes.sort((a, b) => a.id - b.id);
nodes.forEach((node) => {
  console.log(
    `Nodo ${node.id}: Sucesor=${node.successor.id}, Predecesor=${
      node.predecessor?.id ?? "null"
    }`
  );
  // Opcional: imprimir finger table completa
  // console.log(`  Finger Table: [${node.fingerTable.map(n => n.id).join(', ')}]`);
});

// 5. DEMO: Almacenar y buscar un dato
console.log("\n--- Probando almacenamiento y búsqueda ---");
const key = "mi_dato_importante";
// Usamos una función de hash simple para la simulación
const keyId =
  key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
  simulator.identifierSpaceSize;

console.log(`Clave "${key}" tiene ID: ${keyId}`);

// Encontrar el nodo responsable
const responsibleNode = nodes[0].findSuccessor(keyId);
console.log(
  `El nodo ${responsibleNode.id} es responsable de la clave ${keyId}`
);

// Almacenar el dato
responsibleNode.data.set(keyId, "Este es el contenido!");
console.log(`Dato almacenado en el nodo ${responsibleNode.id}`);

// Buscar el dato desde otro nodo aleatorio
const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
console.log(`\nBuscando clave ${keyId} desde el nodo ${randomNode.id}...`);

const targetNode = randomNode.findSuccessor(keyId);
const foundData = targetNode.data.get(keyId);

if (foundData) {
  console.log(
    `¡Éxito! Dato encontrado en el nodo ${targetNode.id}: "${foundData}"`
  );
} else {
  console.error(`¡Fallo! No se encontró el dato en el nodo ${targetNode.id}`);
}
