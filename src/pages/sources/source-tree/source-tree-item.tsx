import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CozyCanvas } from 'cozy-iiif';
import { Button } from '@/shadcn/button';
import { Checkbox } from '@/shadcn/checkbox';
import { Label } from '@/shadcn/label';
import { cn, withStopPropagation } from '@/shadcn/utils';
import { useAppStore } from '@/store/app-store';
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

  onToggleExpanded(): void;

}

export const SourceTreeItem = (props: ManifestTreeItemProps) => {
  const { manifest } = props.source;

  const allChecked = props.inReconstruction === manifest.canvases.length;
  const someChecked = props.inReconstruction > 0 && !allChecked;

  const addCanvases = useAppStore(state => state.addCanvasesToReconstruction);
  const removeCanvases = useAppStore(state => state.removeCanvasesFromReconstruction);

  const onClickCheckbox = () => {
    if (allChecked) {
      removeCanvases(manifest.canvases.map(c => c.id));
    } else {
      addCanvases(manifest.canvases.map(canvas => ({ 
        sourceId: manifest.id,
        canvas
      })));
    }
  }

  return (
    <div className="py-1.5 text-sm bg-white/80 backdrop-blur">
      <div className="flex pr-1.5 gap-1 rounded-md justify-between items-center">
        <div
          className="flex gap-0.5 min-w-0 flex-1 items-center">
          <Button
            id={`toggle-${manifest.id}`}
            variant="ghost"
            onClick={withStopPropagation(() => props.onToggleExpanded())}
            className="text-muted-foreground size-7 flex items-center justify-center hover:bg-secondary">
            {props.isExpanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>

          <Checkbox
            className="mr-1.25 mb-px" 
            indeterminate={someChecked}
            checked={allChecked}
            onCheckedChange={onClickCheckbox} />

          <Label
            htmlFor={`toggle-${manifest.id}`}
            className="block flex-1 min-w-0 text-foreground font-normal truncate">
            {manifest.getLabel()}
          </Label>
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
        'ml-5 p-2 rounded-md group flex cursor-default items-center justify-between gap-2 text-sm transition-colors',
        props.isSelected ? 'bg-muted text-accent-foreground' : 'hover:bg-muted'
      )}
      onClick={props.onSelect}>

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="relative">
          <img
            src={props.canvas.getThumbnailURL(80)}
            alt={`${props.canvas.getLabel()} preview image`}
            className={cn(
              'size-9 rounded-sm shadow-xs object-cover',
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