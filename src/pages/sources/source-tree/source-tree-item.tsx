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
    <div className="p-1 text-sm border-b">
      <div
        className="flex gap-0.5" 
        onClick={props.onSelectManifest}>
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            props.onToggleExpanded();
          }}
          className="cursor-pointer flex items-center justify-center rounded hover:bg-secondary">
          {props.isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </Button>

        <div className="flex-1 whitespace-nowrap truncate font-medium flex gap-2 justify-between items-center">
          {manifest.getLabel()}  
        </div>
      </div>

      {props.isExpanded && manifest.canvases.length > 0 && (
        <div className="ml-2.5 pl-1.5 border-l">
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
        'p-1.5 rounded group flex cursor-pointer items-center justify-between gap-2 text-sm transition-colors overflow-hidden',
        isSelected
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/80'
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
          className="size-9 rounded shadow-xs object-cover"
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