import type { Viewer } from 'openseadragon';
import { useReconstructionStore } from '../../../reconstruction-store';
import type { ComposerLayout } from '../../composer-types';
import { AnimatedRect } from './animated-rect';

interface CanvasIndicatorProps {

  layout: ComposerLayout;

  viewer: Viewer;

}

export const CanvasIndicatorBackground = (props: CanvasIndicatorProps) => {

  return (
    <g>
      {props.layout.items.map(item => (
        <AnimatedRect
          key={item.reconstructionCanvasId}
          item={item}
          viewer={props.viewer}
          fill="#fff"
          fillOpacity={0.9}
          stroke="red"
          strokeWidth={0}
          pointerEvents="none" />
      ))}
    </g>
  )

}

export const CanvasIndicatorForeground = (props: CanvasIndicatorProps) => {

  const selected = useReconstructionStore(state => state.selection);

  const isSelected = (canvasId: string) =>
    selected.some(s => s.id === canvasId);

  return (
    <g>
      {props.layout.items.map(item => (
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
