/**
 * Edge Components
 * Custom React Flow edge components
 */

import type { EdgeTypes } from '@xyflow/react';
import { ConditionEdge } from './ConditionEdge.js';

export const edgeTypes: EdgeTypes = {
  condition: ConditionEdge,
  default: ConditionEdge,
};

export { ConditionEdge } from './ConditionEdge.js';
