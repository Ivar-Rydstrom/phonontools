// Types for the thermal conductivity chain calculator

export interface ThermalMassNodeData extends Record<string, unknown> {
  label: string;
  heatCapacity: number; // J/K
  temperature?: number; // K (calculated)
  power?: number; // W (heat source)
}

export interface BathNodeData extends Record<string, unknown> {
  label: string;
  temperature: number; // K (fixed)
}

export interface ConductanceEdgeData extends Record<string, unknown> {
  conductance: number; // W/K
}

export type NodeData = ThermalMassNodeData | BathNodeData;
