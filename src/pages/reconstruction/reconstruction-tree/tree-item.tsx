import { useEffect, useRef, useState } from 'react';
import { IconGripVertical, IconStack2 } from '@tabler/icons-react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { DropIndicator as LineIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { attachInstruction, extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { cn, withStopPropagation } from '@/shadcn/utils';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas, SourceCanvas } from '@/types';
import { ITEM_GAP, TreeDropIndicator, viewTransitionName } from './use-drag-and-drop';
import type { DragPayload } from './use-drag-and-drop';
import { ReconstructionTreeItemActions } from './tree-item-actions';

interface ReconstructionTreeItemProps {

  item: ReconstructionCanvas;

  index: number;

  isSelected: boolean;

  onSelect(event: React.MouseEvent): void;

  pinnedEdge?: 'top' | 'bottom';

}

export const ReconstructionTreeItem = (props: ReconstructionTreeItemProps) => {
  const { item, index, isSelected, onSelect, pinnedEdge } = props;

  const ref = useRef<HTMLLIElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [instruction, setInstruction] = useState<Instruction | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return combine(
      draggable({
        element,
        dragHandle: handleRef.current ?? undefined,
        getInitialData: (): DragPayload =>
          ({ kind: 'root', id: item.id, index, itemType: item.type }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false)
      }),
      dropTargetForElements({
        element,
        getData: ({ input, element, source }) => {
          const payload = source.data as unknown as DragPayload;

          // Composites may never become children: block the middle zone
          // when a composite is being dragged.
          const block: Instruction['type'][] =
            payload.kind === 'root' && payload.itemType === 'composite'
              ? ['make-child']
              : [];

          return attachInstruction({ id: item.id, index }, {
            input,
            element,
            currentLevel: 0,
            indentPerLevel: 0,
            mode: 'standard',
            block
          });
        },
        onDrag: ({ self }) => setInstruction(extractInstruction(self.data)),
        onDragLeave: () => setInstruction(null),
        onDrop: () => setInstruction(null)
      })
    );
  }, [item.id, index, item.type]);

  return (
    <li
      ref={ref}
      className={cn(
        'relative border rounded-md shadow-xs bg-white',
        isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : undefined,
        isDragging ? 'opacity-40' : undefined
      )}
      style={{ viewTransitionName: viewTransitionName(item.id) }}>
      <div
        className="group"
        onMouseDown={e => e.preventDefault()}
        onClick={onSelect}>
        <div className="flex items-stretch cursor-default">
          <div
            ref={handleRef}
            aria-hidden="true"
            onMouseDown={withStopPropagation()}
            className="flex flex-col gap-0.5 cursor-grab select-none pl-1.5 pr-1 items-center
            justify-start pt-2.5 text-muted-foreground">
            <IconGripVertical
              className="size-3.5" />
            <span className="text-xs">{index + 1}</span>
          </div>

          {item.type === 'original' ? (
            <div className="grow flex justify-between pr-1.5 items-start">
              <TreeItemContent 
                source={item.source}
                label={item.label} />
              
              <ReconstructionTreeItemActions 
                className="mt-1.5" />
            </div>
          ) : (
            <div className="px-1.5 pt-2.5 pb-1.5 pr-2.5 grow">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-center pb-1">
                  <IconStack2 className="size-4.5 text-muted-foreground/80" stroke={1.5} /> 
                  <span className="text-sm">{item.label}</span>
                  <span className="text-xs text-muted-foreground ml-0.5">{item.sources.length} canvases</span>
                </div>

                <ReconstructionTreeItemActions />
              </div>

              <div>
                {item.sources.length > 0 ? (
                  <ul
                    className="py-1.5 px-0 flex flex-col gap-2">
                    {item.sources.map(source => (
                      <CompositeChildItem
                        key={source.canvas.id}
                        compositeId={item.id}
                        source={source} />
                    ))}
                  </ul>
                ) : (
                  <div className="border border-foreground/25 border-dashed rounded-sm my-1.5 py-2.5 px-4
                    text-sm text-muted-foreground text-center font-light">
                    Empty composite — drop canvases here
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {instruction ? (
        <TreeDropIndicator instruction={instruction} />
      ) : pinnedEdge ? (
        <LineIndicator edge={pinnedEdge} gap={ITEM_GAP} />
      ) : null}
    </li>
  )

}

interface CompositeChildItemProps {

  compositeId: string;

  source: SourceCanvas;

}

const CompositeChildItem = (props: CompositeChildItemProps) => {
  const { compositeId, source } = props;

  const ref = useRef<HTMLLIElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return draggable({
      element,
      dragHandle: handleRef.current ?? undefined,
      getInitialData: (): DragPayload =>
        ({ kind: 'child', compositeId, canvasId: source.canvas.id }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false)
    });
  }, [compositeId, source.canvas.id]);

  return (
    <li
      ref={ref}
      className={cn(
        'flex items-stretch -ml-1 rounded-md border bg-muted',
        isDragging ? 'opacity-40' : undefined
      )}
      style={{ viewTransitionName: viewTransitionName(source.canvas.id) }}>
      <div
        ref={handleRef}
        aria-hidden="true"
        onMouseDown={withStopPropagation()}
        className="flex cursor-grab select-none pl-1.5 items-start pt-2.5">
        <IconGripVertical
          className="size-3.5 text-muted-foreground" />
      </div>

      <TreeItemContent 
        source={source}
        label={source.canvas.getLabel()} />
    </li>
  )

}

interface TreeItemContentProps {

  label: string; 

  source: SourceCanvas;

}

const TreeItemContent = (props: TreeItemContentProps) => {
  const { label, source } = props;

  const sources = useAppStore(state => state.sources);

  return (
    <div className="w-full flex gap-2 min-w-0 px-2 py-2">
      <img
        src={source.canvas.getThumbnailURL(80)}
        alt={`${label} preview image`}
        className="w-9 h-11 rounded-xs shadow-xs object-cover ring-1 ring-foreground/20"
        loading="lazy" />

      <div className="flex flex-col gap-0.5 justify-start min-w-0">
        <span className="min-w-0 truncate text-sm">
          {label}
        </span>
        <span className="text-muted-foreground text-xs">
          {sources.find(s => s.manifest.id === source.sourceManifestId)?.manifest.getLabel()}
        </span>
      </div>
    </div>
  )

}