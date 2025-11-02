import type { Node, Edge } from '@xyflow/react';
import type { ThermalMassNodeData, BathNodeData, ConductanceEdgeData } from './types';

const DEFAULT_CONDUCTANCE = 1; // W/K - default thermal conductance when not specified

/**
 * Calculates steady-state temperatures for a thermal chain
 * Uses iterative relaxation method to solve the thermal network
 */
export function calculateSteadyStateTemperatures(
  nodes: Node<ThermalMassNodeData | BathNodeData>[],
  edges: Edge<ConductanceEdgeData>[]
): Map<string, number> {
  const temperatures = new Map<string, number>();

  // Initialize temperatures
  nodes.forEach(node => {
    if (node.type === 'bath') {
      const bathData = node.data as BathNodeData;
      temperatures.set(node.id, bathData.temperature);
    } else {
      // Initialize thermal masses to 300K
      temperatures.set(node.id, 300);
    }
  });

  // Build adjacency list for thermal network
  const connections = new Map<string, Array<{ nodeId: string; conductance: number }>>();
  edges.forEach(edge => {
    const conductance = (edge.data as ConductanceEdgeData)?.conductance || DEFAULT_CONDUCTANCE;
    
    if (!connections.has(edge.source)) {
      connections.set(edge.source, []);
    }
    if (!connections.has(edge.target)) {
      connections.set(edge.target, []);
    }
    
    connections.get(edge.source)!.push({ nodeId: edge.target, conductance });
    connections.get(edge.target)!.push({ nodeId: edge.source, conductance });
  });

  // Iterative relaxation to solve steady-state
  const maxIterations = 1000;
  const tolerance = 1e-6;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let maxChange = 0;
    
    nodes.forEach(node => {
      // Skip bath nodes (fixed temperature)
      if (node.type === 'bath') return;
      
      const thermalData = node.data as ThermalMassNodeData;
      const nodeConnections = connections.get(node.id) || [];
      
      if (nodeConnections.length === 0) return;
      
      // Calculate new temperature based on heat balance
      // At steady state: Sum(G_i * (T_i - T)) + P = 0
      // Solving for T: T = (Sum(G_i * T_i) + P) / Sum(G_i)
      
      let sumGT = 0;
      let sumG = 0;
      
      nodeConnections.forEach(conn => {
        const neighborTemp = temperatures.get(conn.nodeId) || 300;
        sumGT += conn.conductance * neighborTemp;
        sumG += conn.conductance;
      });
      
      const power = thermalData.power || 0;
      const newTemp = sumG > 0 ? (sumGT + power) / sumG : temperatures.get(node.id) || 300;
      
      const oldTemp = temperatures.get(node.id) || 300;
      maxChange = Math.max(maxChange, Math.abs(newTemp - oldTemp));
      
      temperatures.set(node.id, newTemp);
    });
    
    // Check for convergence
    if (maxChange < tolerance) {
      break;
    }
  }

  return temperatures;
}
