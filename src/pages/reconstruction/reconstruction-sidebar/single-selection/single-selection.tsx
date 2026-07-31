import { IconStack2 } from '@tabler/icons-react';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas } from '@/types';
import { EditablePixelSize } from './editable-pixel-size';
import { EditablePhysicalSize } from './editable-physical-size';

interface SingleSelectionProps {

  canvas: ReconstructionCanvas;

}

export const SingleSelection = (props: SingleSelectionProps) => {
  const { canvas } = props;

  const { width, height } = canvas;

  const resizeCanvas = useAppStore(state => state.resizeCanvas);
  const setPhysicalSize = useAppStore(state => state.setReconstructionPhysicalSize);

  const onResizePx = (newWidth: number, newHeight: number) => {
    if (newWidth === Math.round(width) && newHeight === Math.round(height)) return;
    resizeCanvas(canvas.id, newWidth, newHeight);
  }

  return (
    <div className="space-y-1">
      <h2 className="flex items-center gap-1.5 border-b p-4">
        {canvas.type === 'composite' && (
          <IconStack2 className="size-5 text-muted-foreground shrink-0" stroke={1.75} />
        )}
        <span className="text-base truncate">{canvas.label}</span>
      </h2>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-xs text-muted-foreground uppercase">Image size</h3>
          <EditablePixelSize 
            width={width} 
            height={height} 
            onCommit={onResizePx} />
        </div>

        <div>
          <h3 className="text-xs text-muted-foreground uppercase">Physical size</h3>
          <EditablePhysicalSize
            size={canvas.physicalSize}
            onCommit={size => setPhysicalSize(canvas.id, size)} />
        </div>
      </div>
    </div>
  )

}