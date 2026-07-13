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

  return (
    <g>
      {props.layout.items.map(item => (
        <rect
          x={item.x}
          y={item.y}
          width={item.width}
          height={item.height}
          fill="transparent"
          stroke="oklch(55.6% 0 0)" // neutral-500
          strokeWidth={1}
          strokeOpacity={1}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none" />
      ))}
    </g>
  )

}