/**
 * ConditionEdge Component
 * Visual representation of conditional edges between nodes
 */

import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

interface ConditionEdgeData {
  condition?: {
    type: 'true' | 'false' | 'custom';
    expression?: string;
  };
  label?: string;
}

function ConditionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps & { data?: ConditionEdgeData }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const conditionData = data?.condition;
  const label = data?.label;

  const getConditionColor = () => {
    if (!conditionData) return '#9CA3AF';
    switch (conditionData.type) {
      case 'true':
        return '#22C55E';
      case 'false':
        return '#EF4444';
      case 'custom':
        return '#F59E0B';
      default:
        return '#9CA3AF';
    }
  };

  const getConditionLabel = () => {
    if (label) return label;
    if (!conditionData) return '';
    switch (conditionData.type) {
      case 'true':
        return 'Yes';
      case 'false':
        return 'No';
      case 'custom':
        return conditionData.expression || 'Custom';
      default:
        return '';
    }
  };

  const conditionColor = getConditionColor();
  const conditionLabel = getConditionLabel();

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: conditionColor,
          strokeWidth: 2,
        }}
      />
      {conditionLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              color: conditionColor,
              border: `1px solid ${conditionColor}`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {conditionLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const ConditionEdge = memo(ConditionEdgeComponent);
