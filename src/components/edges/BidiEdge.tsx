import { memo } from 'react';
import { BaseEdge, getStraightPath, getBezierPath, type EdgeProps } from '@xyflow/react';

function BidiEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  // Calculate offset perpendicular to the line for the double effect
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len; // normal x
  const ny = dx / len;  // normal y
  const offset = 3;     // pixel gap between the two lines

  const [path1] = getBezierPath({
    sourceX: sourceX + nx * offset,
    sourceY: sourceY + ny * offset,
    targetX: targetX + nx * offset,
    targetY: targetY + ny * offset,
    sourcePosition,
    targetPosition,
  });

  const [path2] = getBezierPath({
    sourceX: sourceX - nx * offset,
    sourceY: sourceY - ny * offset,
    targetX: targetX - nx * offset,
    targetY: targetY - ny * offset,
    sourcePosition,
    targetPosition,
  });

  const strokeColor = selected ? 'var(--accent)' : 'var(--yellow)';

  return (
    <>
      {/* Invisible fat path for easier click selection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
      />
      <path
        d={path1}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        className="react-flow__edge-path"
      />
      <path
        d={path2}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        className="react-flow__edge-path"
      />
    </>
  );
}

export const BidiEdge = memo(BidiEdgeComponent);
