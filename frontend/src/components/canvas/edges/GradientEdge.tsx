import React, { memo } from 'react';
import {
  BaseEdge,
  getBezierPath,
  EdgeProps,
} from 'reactflow';

interface GradientEdgeData extends Record<string, unknown> {
  gradient?: {
    start: string;
    end: string;
  };
  animated?: boolean;
}

const GradientEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    data,
    animated,
  }: EdgeProps<GradientEdgeData>) => {
    // Use bezier path for smooth curves
    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const gradientId = `edge-gradient-${id}`;
    const startColor = data?.gradient?.start || '#00D4FF';
    const endColor = data?.gradient?.end || '#7B61FF';
    const isAnimated = animated ?? true;

    return (
      <>
        {/* SVG Gradient Definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
          {/* Glow filter for selected/hover effect */}
          <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main edge path with gradient */}
        <BaseEdge
          path={edgePath}
          style={{
            stroke: `url(#${gradientId})`,
            strokeWidth: selected ? 3 : 2,
            filter: selected ? `url(#glow-${id})` : 'none',
            transition: 'stroke-width 0.2s ease',
          }}
        />

        {/* Animated dot flowing along the path */}
        {isAnimated && (
          <circle r="3" fill={endColor} filter={`url(#glow-${id})`}>
            <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
          </circle>
        )}

        {/* Secondary subtle shadow path for depth */}
        <path
          d={edgePath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={selected ? 6 : 4}
          strokeOpacity={0.15}
          strokeLinecap="round"
        />
      </>
    );
  }
);

GradientEdge.displayName = 'GradientEdge';

export default GradientEdge;
