import { useEffect, useRef, useState } from 'react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/tree-item';
import { attachInstruction, extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { cn } from '@/shadcn/utils';
import type { ReconstructionCanvas, SourceCanvas } from '@/types';
import type { DragPayload } from './use-drag-and-drop';

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
    <li>
      <div
        ref={ref}
        className={cn(
          'relative px-3 py-2 border rounded-md bg-amber-200 cursor-grab',
          isDragging ? 'opacity-40' : undefined
        )}>
 
        {item.label}
 
        {item.type === 'composite' && (
          <span style={{ marginLeft: 8, color: '#999', fontSize: '0.8em' }}>
            {item.sources.length} canvases
          </span>
        )}
 
        {instruction && <DropIndicator instruction={instruction} />}
      </div>
 
      {item.type === 'composite' && (
        item.sources.length > 0 ? (
          <ul style={{
            listStyle: 'none',
            margin: '4px 0 0',
            paddingLeft: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}>
            {item.sources.map(source => (
              <CompositeChildItem
                key={source.canvas.id}
                compositeId={item.id}
                source={source} />
            ))}
          </ul>
        ) : (
          <div style={{
            margin: '4px 0 0 24px',
            padding: '10px 12px',
            border: '1px dashed #ccc',
            borderRadius: 4,
            color: '#999',
            fontSize: '0.875em',
            textAlign: 'center'
          }}>
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
    <li>
      <div
        ref={ref}
        style={{
          padding: '6px 12px',
          border: '1px solid #ddd',
          borderRadius: 4,
          background: '#fafafa',
          cursor: 'grab',
          fontSize: '0.875em',
          opacity: isDragging ? 0.4 : 1
        }}>
        {source.canvas.getLabel()}
      </div>
    </li>
  )

}