import { ChevronDown, ChevronRight, Ellipsis, Images } from 'lucide-react';
import type { CozyCanvas } from 'cozy-iiif';
import { Button } from '@/shadcn/button';
import { cn } from '@/shadcn/utils';
import type { SourceManifest } from '@/types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/shadcn/dropdown-menu';

interface ManifestTreeItemProps {

  source: SourceManifest;

  isExpanded: boolean;

  isSelected: boolean;

  selectedCanvasId?: string;

  onSelectManifest(): void;

  onSelectCanvas(canvasId: string): void;

  onToggleExpanded(): void;

  onRemove(): void;

  onAddToReconstruction(canvas: CozyCanvas): void;

}

export const SourceTreeItem = (props: ManifestTreeItemProps) => {
  const { manifest } = props.source;

  return (
    <div className="mb-1">
      <div
        className={cn(
          'flex cursor-pointer items-center gap-1 rounded px-2 py-1.5 text-sm transition-colors',
          props.isSelected
            ? 'bg-accent text-accent-foreground'
            : 'hover:bg-accent/80'
        )}
        onClick={props.onSelectManifest}>

        <button
          onClick={(e) => {
            e.stopPropagation();
            props.onToggleExpanded();
          }}
          className="cursor-pointer flex h-5 w-5 items-center justify-center rounded hover:bg-secondary">
          {props.isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        <div className="flex-1 overflow-hidden whitespace-nowrap font-medium flex gap-2 justify-between items-center">
          <span className="truncate">{manifest.getLabel()}</span>
          <span className="shrink-0 text-muted-foreground text-xs">
            <Images className="size-3.5 inline mb-0.5 mr-px" /> {manifest.canvases.length}
          </span>          
        </div>
      </div>

      {props.isExpanded && manifest.canvases.length > 0 && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-panel-border pl-2">
          {manifest.canvases.map(canvas => (
            <CanvasTreeItem
              key={canvas.id}
              canvas={canvas}
              isSelected={props.selectedCanvasId === canvas.id}
              onSelect={() => props.onSelectCanvas(canvas.id)}
              onAddToReconstruction={() => props.onAddToReconstruction(canvas)}
            />
          ))}
        </div>
      )}
    </div>
  )

}

interface CanvasTreeItemProps {

  canvas: CozyCanvas;

  isSelected: boolean;
  
  onSelect(): void;

  onAddToReconstruction(): void;

}

export const CanvasTreeItem = (props: CanvasTreeItemProps) => {
  const { canvas, isSelected, onSelect, onAddToReconstruction } = props;

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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

}