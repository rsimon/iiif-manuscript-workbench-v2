import { ChevronDown, ChevronRight, Images } from 'lucide-react';
import type { CozyCanvas } from 'cozy-iiif';
import { cn } from '@/shadcn/utils';
import type { SourceManifest } from '@/types';
import { CanvasTreeItem } from './canvas-tree-item';

interface ManifestTreeItemProps {

  source: SourceManifest;

  isSelected: boolean;

  selectedCanvasId?: string;

  onSelectManifest(): void;

  onSelectCanvas(canvasId: string): void;

  onToggleExpanded(): void;

  onRemove(): void;

  onAddToReconstruction(canvas: CozyCanvas): void;

}

export const ManifestTreeItem = (props: ManifestTreeItemProps) => {
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
          {props.source.expanded ? (
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

      {props.source.expanded && manifest.canvases.length > 0 && (
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