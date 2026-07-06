
import type { CozyCanvas } from 'cozy-iiif';
import { Ellipsis } from 'lucide-react';
import { useWorkspaceStore } from '@/store';
import { Button } from '@/shadcn/button';
import { cn } from '@/shadcn/utils';
import { useComposerState } from '../../composer';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/shadcn/dropdown-menu';

interface CanvasTreeItemProps {

  canvas: CozyCanvas;

  isSelected: boolean;
  
  onSelect(): void;

  onAddToReconstruction(): void;

}

export const CanvasTreeItem = (props: CanvasTreeItemProps) => {
  const { canvas, isSelected, onSelect, onAddToReconstruction } = props;

  const isComposerOpen = useWorkspaceStore(state => Boolean(state.composerActiveCanvasId));

  const addCanvas = useComposerState(state => state.addCanvas);

  return (
    <div
      draggable
      className={cn(
        'group flex cursor-pointer items-center justify-between gap-2 rounded p-1 text-sm transition-colors overflow-hidden',
        isSelected
          ? 'bg-neutral-300 text-accent-foreground'
          : 'hover:bg-neutral-200/80'
      )}
      onClick={onSelect}
      onDragStart={e => {
        e.dataTransfer.setData(
          'application/x-iiif-canvas',
          JSON.stringify({
            type: 'source-canvas',
            canvasId: canvas.id
          })
        );
        e.dataTransfer.effectAllowed = 'copy';
      }}>

      <div className="flex items-center gap-2 overflow-hidden">
        <img 
          src={canvas.getThumbnailURL(80)}
          alt={`${canvas.getLabel()} preview image`}
          className="size-7 rounded shadow-xs object-cover"
          loading="lazy" />

        <span className="flex-1 truncate text-xs">{canvas.getLabel()}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger 
          onClick={e => e.stopPropagation()}
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                'group-hover:opacity-100',
                isSelected ? 'opacity-100' : 'opacity-0'
              )}>
              <Ellipsis className="size-4" />
            </Button>
          }>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-40">
          <DropdownMenuItem
            onClick={onAddToReconstruction}
            className="text-xs">
            Add to Reconstruction
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={!isComposerOpen}
            onClick={e => {
              e.stopPropagation();
              addCanvas(canvas);
            }}
            className="text-xs">
            Add to Composer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

}