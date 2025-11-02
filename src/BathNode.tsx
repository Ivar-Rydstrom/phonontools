import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { BathNodeData } from './types';
import './BathNode.css';

function BathNode({ data }: NodeProps) {
  const typedData = data as BathNodeData;
  
  return (
    <div className="bath-node">
      <div className="node-content">
        <div className="node-label">{typedData.label}</div>
        <div className="node-temp">T: {typedData.temperature} K</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(BathNode);
