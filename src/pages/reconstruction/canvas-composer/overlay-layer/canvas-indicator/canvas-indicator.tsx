import { useReconstructionStore } from '../../../reconstruction-store';
import type { ComposerLayout } from '../../composer-types';

interface CanvasIndicatorProps {

  layout: ComposerLayout;

}

export const CanvasIndicatorBackground = (props: CanvasIndicatorProps) => {

  return (
    <g>
      {props.layout.items.map(item => (
        <rect
          x={item.x}
          y={item.y}
          width={item.width}
          height={item.height}
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
        <rect
          x={item.x}
          y={item.y}
          width={item.width}
          height={item.height}
          fill="transparent"
          stroke={isSelected(item.canvas.id) ? 'oklch(0.5 0.15 246.78)' : 'oklch(92.2% 0 0)'} // primary : neutral-200 
          strokeWidth={isSelected(item.canvas.id) ? 2 : 1}
          strokeOpacity={1}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none" />
      ))}
    </g>
  )

}