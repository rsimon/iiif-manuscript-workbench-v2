import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CozyCanvas } from 'cozy-iiif';
import { Button } from '@/shadcn/button';
import { Checkbox } from '@/shadcn/checkbox';
import { cn, withStopPropagation } from '@/shadcn/utils';
import type { SourceManifest } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shadcn/tooltip';

interface ManifestTreeItemProps {

  source: SourceManifest;

  inReconstruction: number;

  isExpanded: boolean;

  isSelected: boolean;

  onSelectManifest(): void;

  onToggleExpanded(): void;

}

// Renders just the manifest header row. The canvas rows for an expanded
// manifest are rendered separately by the caller (as virtualized list items).
export const SourceTreeItem = (props: ManifestTreeItemProps) => {
  const { manifest } = props.source;

  return (
    <div className="px-1 py-0 text-sm bg-white/80 backdrop-blur">
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
          props.inReconstruction === 0 ? 'text-muted-foreground/80' : 'text-primary'
        )}>
          {props.inReconstruction}/{manifest.canvases.length}
        </div>
      </div>
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