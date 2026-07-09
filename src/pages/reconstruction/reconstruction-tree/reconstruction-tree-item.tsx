import { useEffect, useRef, useState } from 'react';
import { IconGripVertical, IconStack2 } from '@tabler/icons-react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/tree-item';
import { attachInstruction, extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { cn } from '@/shadcn/utils';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas, SourceCanvas } from '@/types';
import { viewTransitionName, type DragPayload } from './use-drag-and-drop';

interface ReconstructionTreeItemProps {

  item: ReconstructionCanvas;

  index: number;

}

export const ReconstructionTreeItem = (props: ReconstructionTreeItemProps) => {
  const { item, index } = props;

  const sources = useAppStore(state => state.sources);

  const ref = useRef<HTMLLIElement>(null);
  const handleRef = useRef<SVGSVGElement>(null);

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
        'relative p-1.5 border rounded-md shadow-xs bg-white',
        isDragging ? 'opacity-40' : undefined
      )}
      style={{ viewTransitionName: viewTransitionName(item.id) }}>
      <div>
        <div className="flex items-start gap-2">
          <IconGripVertical
            ref={handleRef}
            aria-hidden="true"
            className="mt-1 size-4 shrink-0 cursor-grab text-muted-foreground select-none" />

          {item.type === 'original' ? (
            <div className="flex gap-2 min-w-0">
              <img
                src={item.source.canvas.getThumbnailURL(80)}
                alt={`${item.label} preview image`}
                className="size-12 rounded-sm shadow-xs object-cover ring-1 ring-foreground/20"
                loading="lazy" />

              <div className="flex flex-col gap-0.5 justify-start min-w-0">
                <span className="min-w-0 truncate text-sm">
                  {props.item.label}
                </span>
                <span className="text-muted-foreground text-xs">
                  {sources.find(s => s.manifest.id === item.source.sourceManifestId)?.manifest.getLabel()}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <IconStack2 /> {item.label} <span style={{ marginLeft: 8, color: '#999', fontSize: '0.8em' }}>
                {item.sources.length} canvases
              </span>
            </div>
          )}
        </div>

        {instruction && <DropIndicator instruction={instruction} />}
      </div>

      {item.type === 'composite' && (
        item.sources.length > 0 ? (
          <ul className="p-2 pl-6 flex flex-col gap-1 bg-blue-400" >
            {item.sources.map(source => (
              <CompositeChildItem
                key={source.canvas.id}
                compositeId={item.id}
                source={source} />
            ))}
          </ul>
        ) : (
          <div className="border border-dashed">
            Empty composite — drop canvases here
          </div>
        )
      )}
    </li>
  )

}

interface CompositeChildItemProps {

  compositeId: string;

  source: SourceCanvas;

}

const CompositeChildItem = (props: CompositeChildItemProps) => {
  const { compositeId, source } = props;

  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<SVGSVGElement>(null);

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
    <li style={{ viewTransitionName: viewTransitionName(source.canvas.id) }}>
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 border border-amber-500',
          isDragging ? 'opacity-40' : undefined
        )}>
        <IconGripVertical
          ref={handleRef}
          aria-hidden="true"
          className="size-4 shrink-0 cursor-grab text-muted-foreground select-none" />
        {source.canvas.getLabel()}
      </div>
    </li>
  )

}
