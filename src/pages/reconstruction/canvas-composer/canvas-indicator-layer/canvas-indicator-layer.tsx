import type { Viewer } from 'openseadragon';
import { useReconstructionStore } from '../../reconstruction-store';
import type { ComposerLayout } from '../../reconstruction-types';
import { AnimatedRect } from './animated-rect';

interface CanvasIndicatorLayerProps {

  layout: ComposerLayout;

  viewer: Viewer;

  // Only canvases in this set get an indicator rect - keeps per-frame
  // spring/DOM updates scoped to what's actually on (or near) screen.
  visibleIds: Set<string>;

}

export const CanvasIndicatorBackgroundLayer = (props: CanvasIndicatorLayerProps) => {

  const visibleItems = props.layout.items.filter(item => props.visibleIds.has(item.reconstructionCanvasId));

  return (
    <g>
      {visibleItems.map(item => (
        <AnimatedRect
          key={item.reconstructionCanvasId}
          item={item}
          viewer={props.viewer}
          fill="#fff"
          fillOpacity={0.9}
          strokeWidth={0}
          pointerEvents="none" />
      ))}
    </g>
  )

}

export const CanvasIndicatorForegroundLayer = (props: CanvasIndicatorLayerProps) => {

  const selected = useReconstructionStore(state => state.selection);

  const isSelected = (canvasId: string) =>
    selected.some(s => s.id === canvasId);

  const visibleItems = props.layout.items.filter(item => props.visibleIds.has(item.reconstructionCanvasId));

  return (
    <g>
      {visibleItems.map(item => (
        <AnimatedRect
          key={item.reconstructionCanvasId}
          item={item}
          viewer={props.viewer}
          fill="transparent"
          stroke={isSelected(item.reconstructionCanvasId) ? 'oklch(0.5 0.15 246.78)' : 'oklch(92.2% 0 0)'} // primary : neutral-200
          strokeWidth={isSelected(item.reconstructionCanvasId) ? 2 : 1}
          strokeOpacity={1}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none" />
      ))}
    </g>
  )

}
