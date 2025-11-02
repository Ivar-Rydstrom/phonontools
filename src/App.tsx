import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ThermalMassNode from './ThermalMassNode';
import BathNode from './BathNode';
import ConductanceEdge from './ConductanceEdge';
import type { ThermalMassNodeData, BathNodeData, ConductanceEdgeData } from './types';
import { calculateSteadyStateTemperatures } from './thermalCalculator';
import './App.css';

const nodeTypes: NodeTypes = {
  thermalMass: ThermalMassNode,
  bath: BathNode,
};

const edgeTypes: EdgeTypes = {
  conductance: ConductanceEdge,
};

const initialNodes: Node<ThermalMassNodeData | BathNodeData>[] = [
  {
    id: 'bath-1',
    type: 'bath',
    position: { x: 50, y: 150 },
    data: { label: 'Cold Bath', temperature: 4 },
  },
  {
    id: 'mass-1',
    type: 'thermalMass',
    position: { x: 250, y: 150 },
    data: { label: 'Stage 1', heatCapacity: 100, power: 0 },
  },
  {
    id: 'mass-2',
    type: 'thermalMass',
    position: { x: 450, y: 150 },
    data: { label: 'Stage 2', heatCapacity: 50, power: 10 },
  },
];

const initialEdges: Edge<ConductanceEdgeData>[] = [
  {
    id: 'e-bath-mass1',
    source: 'bath-1',
    target: 'mass-1',
    type: 'conductance',
    data: { conductance: 0.5 },
  },
  {
    id: 'e-mass1-mass2',
    source: 'mass-1',
    target: 'mass-2',
    type: 'conductance',
    data: { conductance: 0.2 },
  },
];

let nodeId = 3;
let edgeId = 3;

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge<ConductanceEdgeData> = {
        ...connection,
        id: `e${edgeId++}`,
        type: 'conductance',
        data: { conductance: 1.0 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Calculate temperatures whenever nodes or edges change
  useEffect(() => {
    const temperatures = calculateSteadyStateTemperatures(nodes, edges);
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'thermalMass') {
          return {
            ...node,
            data: {
              ...node.data,
              temperature: temperatures.get(node.id),
            } as ThermalMassNodeData,
          };
        }
        return node;
      })
    );
    // We intentionally use only length as dependency to avoid infinite loops
    // The full nodes/edges objects change on every render, but we only need to
    // recalculate when the structure changes (nodes/edges added or removed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, edges.length, setNodes]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const addThermalMass = useCallback(() => {
    const newNode: Node<ThermalMassNodeData> = {
      id: `mass-${nodeId++}`,
      type: 'thermalMass',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 50 },
      data: { label: `Mass ${nodeId - 1}`, heatCapacity: 100, power: 0 },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const addBath = useCallback(() => {
    const newNode: Node<BathNodeData> = {
      id: `bath-${nodeId++}`,
      type: 'bath',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 50 },
      data: { label: `Bath ${nodeId - 1}`, temperature: 300 },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const updateNodeData = useCallback(
    (nodeId: string, key: string, value: number | string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                [key]: typeof value === 'string' ? value : Number(value),
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const updateEdgeData = useCallback(
    (edgeId: string, conductance: number) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              data: {
                ...edge.data,
                conductance: Number(conductance),
              } as ConductanceEdgeData,
            };
          }
          return edge;
        })
      );
    },
    [setEdges]
  );

  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id)
      );
      setSelectedNode(null);
    } else if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

  return (
    <div className="app">
      <div className="header">
        <h1>Thermal Conductivity Chain Calculator</h1>
        <p>Build thermal chains to simulate steady-state temperatures</p>
      </div>
      
      <div className="controls-panel">
        <div className="button-group">
          <button onClick={addThermalMass}>Add Thermal Mass</button>
          <button onClick={addBath}>Add Temperature Bath</button>
          {(selectedNode || selectedEdge) && (
            <button onClick={deleteSelected} className="delete-btn">
              Delete Selected
            </button>
          )}
        </div>

        {selectedNode && selectedNode.type === 'thermalMass' && (
          <div className="properties-panel">
            <h3>Thermal Mass Properties</h3>
            <label>
              Label:
              <input
                type="text"
                value={(selectedNode.data as ThermalMassNodeData).label}
                onChange={(e) => updateNodeData(selectedNode.id, 'label', e.target.value)}
              />
            </label>
            <label>
              Heat Capacity (J/K):
              <input
                type="number"
                value={(selectedNode.data as ThermalMassNodeData).heatCapacity}
                onChange={(e) => updateNodeData(selectedNode.id, 'heatCapacity', e.target.value)}
              />
            </label>
            <label>
              Power Source (W):
              <input
                type="number"
                value={(selectedNode.data as ThermalMassNodeData).power || 0}
                onChange={(e) => updateNodeData(selectedNode.id, 'power', e.target.value)}
              />
            </label>
          </div>
        )}

        {selectedNode && selectedNode.type === 'bath' && (
          <div className="properties-panel">
            <h3>Temperature Bath Properties</h3>
            <label>
              Label:
              <input
                type="text"
                value={(selectedNode.data as BathNodeData).label}
                onChange={(e) => updateNodeData(selectedNode.id, 'label', e.target.value)}
              />
            </label>
            <label>
              Temperature (K):
              <input
                type="number"
                value={(selectedNode.data as BathNodeData).temperature}
                onChange={(e) => updateNodeData(selectedNode.id, 'temperature', e.target.value)}
              />
            </label>
          </div>
        )}

        {selectedEdge && (
          <div className="properties-panel">
            <h3>Conductance Properties</h3>
            <label>
              Conductance (W/K):
              <input
                type="number"
                step="0.1"
                value={(selectedEdge.data as ConductanceEdgeData)?.conductance || 1}
                onChange={(e) => updateEdgeData(selectedEdge.id, parseFloat(e.target.value))}
              />
            </label>
          </div>
        )}
      </div>

      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      <div className="info-panel">
        <h3>How to Use</h3>
        <ul>
          <li>Add thermal masses and temperature baths using the buttons above</li>
          <li>Connect nodes by dragging from one handle to another</li>
          <li>Click on nodes or edges to edit their properties</li>
          <li>Temperature calculations update automatically</li>
          <li>Bath nodes have fixed temperatures; mass nodes calculate based on the thermal network</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
