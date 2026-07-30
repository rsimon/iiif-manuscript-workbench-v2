import type { ReconstructionCanvas } from '@/types';
import type { DraggableImage } from '../reconstruction-types';
import { IconStack2 } from '@tabler/icons-react';

interface StateMultiSelectionProps {

  selection: ReconstructionCanvas[];

  reconstruction: ReconstructionCanvas[];

  imagesByCanvasId: Map<string, DraggableImage[]>;

}

export const StateMultiSelection = (props: StateMultiSelectionProps) => {
  const { selection, reconstruction, imagesByCanvasId } = props;

  const totalImages = selection.reduce(
    (sum, c) => sum + (imagesByCanvasId.get(c.id)?.length ?? 0), 0);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">
        {selection.length} canvases selected
      </div>

      <div className="text-xs text-muted-foreground tabular-nums">
        {totalImages} image{totalImages === 1 ? '' : 's'} total
      </div>

      <ul className="space-y-1 pt-1">
        {selection.map(canvas => {
          const index = reconstruction.findIndex(r => r.id === canvas.id);
          return (
            <li
              key={canvas.id}
              className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="tabular-nums w-5 text-right shrink-0">{index + 1}.</span>
              {canvas.type === 'composite' && (
                <IconStack2 className="size-3.5 shrink-0" stroke={1.5} />
              )}
              <span className="truncate">{canvas.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  )

}