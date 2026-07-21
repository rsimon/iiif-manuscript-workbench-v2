import { Skeleton } from '@/shadcn/skeleton';
import type { ReconstructionCanvas } from '@/types';

interface ThumbnailProps {

  canvas: ReconstructionCanvas;

}

export const Thumbnail = ({ canvas }: ThumbnailProps) => {
  
  return (
    <div className="flex items-center gap-3 rounded-md border bg-background/90 p-1.5 shadow-sm">
      <Skeleton className="w-9 h-11 shrink-0 rounded-xs border" />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {canvas.label || 'Untitled canvas'}
        </div>
        <div className="text-xs text-muted-foreground">
          {canvas.type === 'original' ? 'Original canvas' : 'Composite canvas'}
        </div>
      </div>
    </div>
  )

}