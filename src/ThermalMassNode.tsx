import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ThermalMassNodeData } from './types';
import './ThermalMassNode.css';

function ThermalMassNode({ data }: NodeProps) {
  const typedData = data as ThermalMassNodeData;
  const temperature = typedData.temperature?.toFixed(2) || 'N/A';
  
  return (
    <div className="thermal-mass-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <div className="node-label">{typedData.label}</div>
        <div className="node-param">C: {typedData.heatCapacity} J/K</div>
        {typedData.power !== undefined && typedData.power !== 0 && (
          <div className="node-param">P: {typedData.power} W</div>
        )}
        <div className="node-temp">T: {temperature} K</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(ThermalMassNode);
