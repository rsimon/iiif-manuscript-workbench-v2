import { useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CozyCanvas } from 'cozy-iiif';
import { Button } from '@/shadcn/button';
import { Checkbox } from '@/shadcn/checkbox';
import { cn, withStopPropagation } from '@/shadcn/utils';
import { useAppStore } from '@/store/app-store';
import type { SourceManifest } from '@/types';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/shadcn/tooltip';

interface ManifestTreeItemProps {

  source: SourceManifest;

  isExpanded: boolean;

  isSelected: boolean;

  selectedCanvasId?: string;

  onSelectManifest(): void;

  onSelectCanvas(canvasId: string): void;

  onToggleExpanded(): void;

  onRemove(): void;

}

export const SourceTreeItem = (props: ManifestTreeItemProps) => {
  const { manifest } = props.source;

  const reconstruction = useAppStore(state => state.reconstruction);
  const addCanvas = useAppStore(state => state.addCanvasToReconstruction);
  const removeCanvas = useAppStore(state => state.removeCanvasFromReconstruction);

  // Canvas IDs in in this manifest that are in the reconstruction
  const inReconstruction = useMemo(() => new Set(reconstruction
    .filter(r => r.sourceManifestId === manifest.id)
    .map(r => r.canvas.id)
  ), [reconstruction, manifest]);

  const onSetIsInReconstruction = (canvas: CozyCanvas, isInReconstruction: boolean) => {
    if (isInReconstruction)
      addCanvas(props.source.manifest.id, canvas);
    else
      removeCanvas(canvas.id);
  }
  
  return (
    <div className="px-1 py-0 text-sm">
      <div className="flex pr-2.5 gap-1 rounded-md justify-between items-center">
        <div
          className="flex gap-0.5 min-w-0 flex-1 items-center"
          onClick={props.onSelectManifest}>
          <Button
            variant="ghost"
            onClick={withStopPropagation(() => props.onToggleExpanded())}
            className="text-muted-foreground size-8 flex items-center justify-center hover:bg-secondary">
            {props.isExpanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>

          <div className="flex-1 min-w-0 text-foreground truncate uppercase">
            {manifest.getLabel()}
          </div>
        </div>
        
        <div className={cn(
          'tracking-wide text-xs',
          inReconstruction.size === 0 ? 'text-muted-foreground/80' : 'text-primary'
        )}>
          {inReconstruction.size}/{manifest.canvases.length}
        </div>
      </div>

      {props.isExpanded && manifest.canvases.length > 0 && (
        <div className="pl-0.5 space-y-1">
          <TooltipProvider delay={500}>
            {manifest.canvases.map(canvas => (
              <CanvasTreeItem
                key={canvas.id}
                canvas={canvas}
                isSelected={props.selectedCanvasId === canvas.id}
                isInReconstruction={inReconstruction.has(canvas.id)}
                onSelect={() => props.onSelectCanvas(canvas.id)} 
                onSetInReconstruction={isAdded => onSetIsInReconstruction(canvas, isAdded)} />
            ))}
          </TooltipProvider>
        </div>
      )}
    </div>
  )

}

interface CanvasTreeItemProps {

  canvas: CozyCanvas;

  isSelected: boolean;

  isInReconstruction: boolean;
  
  onSelect(): void;

  onSetInReconstruction(inReconstruction: boolean): void;

}

export const CanvasTreeItem = (props: CanvasTreeItemProps) => {

  return (
    <div
      className={cn(
        'p-2 rounded group flex cursor-default items-center justify-between gap-2 text-sm transition-colors',
        props.isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'
      )}
      onClick={props.onSelect}>

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="relative">
          <img
            src={props.canvas.getThumbnailURL(80)}
            alt={`${props.canvas.getLabel()} preview image`}
            className={cn(
              'size-9 rounded shadow-xs object-cover',
              props.isInReconstruction ? 'ring-2 ring-primary/80 ring-offset-0' : undefined
            )}
            loading="lazy" />

          <div onClick={e => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger 
                className="absolute -top-1.5 -right-2"
                tabIndex={-1}>
                <Checkbox
                  id={`check-${props.canvas.id}`}
                  className="cursor-pointer size-4.5 border-foreground/35 bg-white rounded-full" 
                  checked={props.isInReconstruction} 
                  onCheckedChange={props.onSetInReconstruction} />
              </TooltipTrigger>

              <TooltipContent
                side="right"
                sideOffset={10}>
                Add {props.canvas.getLabel()} to the reconstruction
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <span className="flex-1 min-w-0 truncate text-xs">{props.canvas.getLabel()}</span>
      </div>
    </div>
  )

}