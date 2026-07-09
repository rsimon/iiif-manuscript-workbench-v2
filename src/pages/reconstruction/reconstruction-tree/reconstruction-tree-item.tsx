import { useEffect, useRef, useState } from 'react';
import { IconStack2 } from '@tabler/icons-react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/tree-item';
import { attachInstruction, extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { cn } from '@/shadcn/utils';
import type { ReconstructionCanvas, SourceCanvas } from '@/types';
import { viewTransitionName, type DragPayload } from './use-drag-and-drop';

interface ReconstructionTreeItemProps {

  item: ReconstructionCanvas;
  
  index: number;

}

export const ReconstructionTreeItem = (props: ReconstructionTreeItemProps) => {
  const { item, index } = props;

  const ref = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [instruction, setInstruction] = useState<Instruction | null>(null);
 
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
 
    return combine(
      draggable({
        element,
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
      className={cn(
        'relative px-3 py-2 border rounded-md shadow-xs cursor-grab',
        isDragging ? 'opacity-40' : undefined
      )}
      style={{ viewTransitionName: viewTransitionName(item.id) }}>
      <div
        ref={ref}>

        {item.type === 'original' ? (
          <div>
            <img
              src={item.source.canvas.getThumbnailURL(80)}
              alt={`${item.label} preview image`}
              className="size-9 rounded-sm shadow-xs object-cover ring-1 ring-foreground/10"
              loading="lazy" />

            <span className="flex-1 min-w-0 truncate text-xs">{props.item.label}</span>
          </div>
        ) : (
          <div>
            <IconStack2 /> {item.label} <span style={{ marginLeft: 8, color: '#999', fontSize: '0.8em' }}>
              {item.sources.length} canvases
            </span>
          </div>
        )}
 
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

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
 
    return draggable({
      element,
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
          'cursor-grab border border-amber-500',
          isDragging ? 'opacity-40' : undefined
        )}>
        {source.canvas.getLabel()}
      </div>
    </li>
  )

}