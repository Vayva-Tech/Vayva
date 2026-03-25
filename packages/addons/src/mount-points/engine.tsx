/**
 * Mount Point Engine - Drag-and-drop system for add-on placement
 * 
 * Uses @dnd-kit for modern, accessible drag-and-drop with keyboard support,
 * collision detection, and snap-to-grid functionality.
 */
'use client';

import { Button } from "@vayva/ui";
import { useCallback, useMemo, useState } from 'react';
import type { DragEndEvent, DragOverEvent, DragStartEvent, DropAnimation } from '@dnd-kit/core';
import {
  DndContext,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { MountPointId } from '../types';
import { MOUNT_POINTS } from '../types';

const DndContextAny = DndContext as any;
const DragOverlayAny = DragOverlay as any;

// ============================================================================
// Types
// ============================================================================

export interface MountedAddOn {
  /** Unique instance identifier */
  instanceId: string;
  /** Add-on definition ID */
  addOnId: string;
  /** Add-on name for display */
  name: string;
  /** Current mount point */
  mountPoint: MountPointId;
  /** Visual priority (lower = higher in list) */
  priority: number;
  /** Whether currently active */
  isActive: boolean;
  /** Configuration data */
  config?: Record<string, unknown>;
}

export interface MountPointState {
  id: MountPointId;
  label: string;
  description: string;
  maxComponents: number;
  mountedAddOns: MountedAddOn[];
  isOver: boolean;
  canDrop: boolean;
}

export interface MountPointEngineProps {
  /** Available mount points with their configuration */
  mountPoints: MountPointId[];
  /** Currently mounted add-ons */
  mountedAddOns: MountedAddOn[];
  /** Available add-ons that can be mounted */
  availableAddOns: Array<{
    id: string;
    name: string;
    icon?: string;
    compatibleMountPoints: MountPointId[];
  }>;
  /** Called when an add-on is moved between mount points */
  onMove: (
    instanceId: string,
    fromPoint: MountPointId,
    toPoint: MountPointId,
    newPriority: number
  ) => void;
  /** Called when an add-on is reordered within a mount point */
  onReorder: (mountPoint: MountPointId, instanceIds: string[]) => void;
  /** Called when an add-on is removed from a mount point */
  onRemove: (instanceId: string, mountPoint: MountPointId) => void;
  /** Called when an add-on is configured */
  onConfigure?: (instanceId: string) => void;
  /** Whether in edit mode (show drag handles, drop zones) */
  isEditing?: boolean;
}

// ============================================================================
// Draggable Add-On Component
// ============================================================================

interface DraggableAddOnProps {
  addOn: MountedAddOn;
  isEditing: boolean;
  onRemove: () => void;
  onConfigure: () => void;
}

function DraggableAddOn({
  addOn,
  isEditing,
  onRemove,
  onConfigure,
}: DraggableAddOnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: addOn.instanceId,
    data: { type: 'addon', addOn },
    disabled: !isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mounted-addon ${isEditing ? 'mounted-addon--editable' : ''}`}
    >
      {isEditing && (
        <div className="mounted-addon__drag-handle" {...attributes} {...listeners}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="4" cy="4" r="1.5" />
            <circle cx="4" cy="8" r="1.5" />
            <circle cx="4" cy="12" r="1.5" />
            <circle cx="12" cy="4" r="1.5" />
            <circle cx="12" cy="8" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
          </svg>
        </div>
      )}

      <div className="mounted-addon__content">
        <span className="mounted-addon__name">{addOn.name}</span>
        {isEditing && (
          <span className="mounted-addon__id">{addOn.addOnId}</span>
        )}
      </div>

      {isEditing && (
        <div className="mounted-addon__actions">
          <Button
            onClick={onConfigure}
            className="mounted-addon__action"
            title="Configure"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Button>
          <Button
            onClick={onRemove}
            className="mounted-addon__action mounted-addon__action--danger"
            title="Remove"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Droppable Mount Point Component
// ============================================================================

interface DroppableMountPointProps {
  mountPoint: MountPointState;
  isEditing: boolean;
  onRemove: (instanceId: string) => void;
  onConfigure: (instanceId: string) => void;
}

function DroppableMountPoint({
  mountPoint,
  isEditing,
  onRemove,
  onConfigure,
}: DroppableMountPointProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: mountPoint.id,
    data: { type: 'mountpoint', mountPoint },
  });

  const canAcceptDrop = useMemo(() => {
    if (!active?.data.current) return false;
    const dragData = active.data.current as { type: string; addOn?: MountedAddOn };
    if (dragData.type !== 'addon') return false;
    // Check if already at max
    return mountPoint.mountedAddOns.length < mountPoint.maxComponents;
  }, [active, mountPoint]);

  return (
    <div
      ref={setNodeRef}
      className={`mount-point ${isEditing ? 'mount-point--editable' : ''} ${
        isOver && canAcceptDrop ? 'mount-point--over' : ''
      } ${!canAcceptDrop && isOver ? 'mount-point--blocked' : ''}`}
    >
      <div className="mount-point__header">
        <span className="mount-point__label">{mountPoint.label}</span>
        <span className="mount-point__count">
          {mountPoint.mountedAddOns.length}/{mountPoint.maxComponents}
        </span>
      </div>
      <p className="mount-point__description">{mountPoint.description}</p>

      <div className="mount-point__content">
        {mountPoint.mountedAddOns.length === 0 && isEditing && (
          <div className="mount-point__empty">
            <span>Drop add-ons here</span>
          </div>
        )}

        {mountPoint.mountedAddOns.map((addOn) => (
          <DraggableAddOn
            key={addOn.instanceId}
            addOn={addOn}
            isEditing={isEditing}
            onRemove={() => onRemove(addOn.instanceId)}
            onConfigure={() => onConfigure(addOn.instanceId)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Engine Component
// ============================================================================

export function MountPointEngine({
  mountPoints,
  mountedAddOns,
  availableAddOns: _availableAddOns,
  onMove,
  onReorder,
  onRemove,
  onConfigure,
  isEditing = false,
}: MountPointEngineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedAddOn, setDraggedAddOn] = useState<MountedAddOn | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event: any) => {
        const { active } = event;
        const node = active?.rect?.current?.translated;
        return node
          ? { x: node.left + node.width / 2, y: node.top + node.height / 2 }
          : { x: 0, y: 0 };
      },
    })
  );

  // Build mount point states
  const mountPointStates: MountPointState[] = useMemo(() => {
    return mountPoints.map((id) => {
      const config = MOUNT_POINTS[id];
      return {
        id,
        label: config.label,
        description: config.description,
        maxComponents: config.maxComponents || 10,
        mountedAddOns: mountedAddOns
          .filter((addon) => addon.mountPoint === id)
          .sort((a, b) => a.priority - b.priority),
        isOver: false,
        canDrop: true,
      };
    });
  }, [mountPoints, mountedAddOns]);

  // Get add-on by instance ID
  const getAddOn = useCallback(
    (instanceId: string) => {
      return mountedAddOns.find((a) => a.instanceId === instanceId) || null;
    },
    [mountedAddOns]
  );

  // Drag start handler
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    void activeId;

    const dragData = active.data.current as { type: string; addOn?: MountedAddOn };
    if (dragData?.type === 'addon' && dragData.addOn) {
      setDraggedAddOn(dragData.addOn);
    }
  }, []);

  // Drag over handler (for visual feedback)
  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback handled by useDroppable hook
  }, []);

  // Drag end handler
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setDraggedAddOn(null);

      if (!over) return;

      const activeData = active.data.current as { type: string; addOn?: MountedAddOn };
      const overData = over.data.current as { type: string; mountPoint?: MountPointState };

      if (activeData?.type !== 'addon') return;

      const addOn = activeData.addOn || getAddOn(active.id as string);
      if (!addOn) return;

      // Moving between mount points
      if (overData?.type === 'mountpoint') {
        const targetMountPoint = over.id as MountPointId;
        if (targetMountPoint !== addOn.mountPoint) {
          const targetState = mountPointStates.find((mp) => mp.id === targetMountPoint);
          const newPriority = targetState?.mountedAddOns.length || 0;
          onMove(addOn.instanceId, addOn.mountPoint, targetMountPoint, newPriority);
        }
      }
      // Reordering within same mount point
      else if (overData?.type === 'addon') {
        const targetAddOn = getAddOn(over.id as string);
        if (targetAddOn && targetAddOn.mountPoint === addOn.mountPoint) {
          const mp = mountPointStates.find((m) => m.id === addOn.mountPoint);
          if (mp) {
            const currentIndex = mp.mountedAddOns.findIndex(
              (a) => a.instanceId === addOn.instanceId
            );
            const targetIndex = mp.mountedAddOns.findIndex(
              (a) => a.instanceId === targetAddOn.instanceId
            );

            const newOrder = [...mp.mountedAddOns];
            newOrder.splice(currentIndex, 1);
            newOrder.splice(targetIndex, 0, addOn);

            onReorder(
              addOn.mountPoint,
              newOrder.map((a) => a.instanceId)
            );
          }
        }
      }
    },
    [getAddOn, mountPointStates, onMove, onReorder]
  );

  // Drop animation configuration
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: '0.5' },
      },
    }),
  };

  return (
    <DndContextAny
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="mount-point-engine">
        <div className="mount-point-engine__grid">
          {mountPointStates.map((mountPoint) => (
            <DroppableMountPoint
              key={mountPoint.id}
              mountPoint={mountPoint}
              isEditing={isEditing}
              onRemove={(instanceId) => onRemove(instanceId, mountPoint.id)}
              onConfigure={(instanceId) => onConfigure?.(instanceId)}
            />
          ))}
        </div>
      </div>

      <DragOverlayAny dropAnimation={dropAnimation}>
        {draggedAddOn ? (
          <div className="mounted-addon mounted-addon--overlay">
            <div className="mounted-addon__content">
              <span className="mounted-addon__name">{draggedAddOn.name}</span>
            </div>
          </div>
        ) : null}
      </DragOverlayAny>
    </DndContextAny>
  );
}

export default MountPointEngine;
