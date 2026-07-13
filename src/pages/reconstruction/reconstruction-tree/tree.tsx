import { useEffect, useRef, useState } from 'react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';
import { useDragAndDrop, withViewTransition } from './use-drag-and-drop';
import type { DragPayload, FallbackDropTarget } from './use-drag-and-drop';
import { ReconstructionTreeItem } from './tree-item';
import { useAppStore } from '@/store/app-store';
import { useReconstructionStore } from '../reconstruction-store';
import { ScrollArea } from '@/shadcn/scroll-area';
import { ReconstructionTreeToolbar } from './tree-toolbar';

export const ReconstructionTree = () => {
  const canvases = useAppStore(state => state.reconstruction);
  const onChange = useAppStore(state => state.updateReconstruction);

  const selection = useReconstructionStore(state => state.selection) ?? [];
  const setSelection = useReconstructionStore(state => state.setSelection);

  const anchorIndexRef = useRef<number | null>(null);

  const onSelect = (index: number, event: React.MouseEvent) => {
    const item = canvases[index];

    if (event.shiftKey && anchorIndexRef.current !== null) {
      const start = Math.min(anchorIndexRef.current, index);
      const end = Math.max(anchorIndexRef.current, index);
      setSelection(canvases.slice(start, end + 1));
    } else if (event.metaKey || event.ctrlKey) {
      const isSelected = selection.some(s => s.id === item.id);
      setSelection(isSelected
        ? selection.filter(s => s.id !== item.id)
        : [...selection, item]);
      anchorIndexRef.current = index;
    } else {
      setSelection([item]);
      anchorIndexRef.current = index;
    }
  }

  const { extractChild, mergeInto, reorderRoot } = useDragAndDrop();

  const listRef = useRef<HTMLUListElement>(null);
  const [fallback, setFallback] = useState<FallbackDropTarget | null>(null);

  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!viewportEl) return;

    return combine(
      autoScrollForElements({ element: viewportEl }),
      // Keeps scrolling once the pointer has moved past the panel's own
      // edge, so a card can be dragged from the bottom of a long list to
      // the top without first scrolling it into view by hand.
      unsafeOverflowAutoScrollForElements({
        element: viewportEl,
        getOverflow: () => ({
          forTopEdge: { top: 150 },
          forBottomEdge: { bottom: 150 }
        })
      })
    );
  }, [viewportEl]);

  useEffect(() => {
    const element = listRef.current;
    if (!element) return;

    return combine(
      monitorForElements({
        onDrop({ source, location }) {
          const target = location.current.dropTargets[0];
          if (!target) return;

          const payload = source.data as unknown as DragPayload;

          const type = target.data.kind === 'list-fallback'
            ? (target.data.edge === 'top' ? 'reorder-above' : 'reorder-below')
            : extractInstruction(target.data)?.type;

          if (!type) return;

          const targetIndex = target.data.index as number;

          if (type === 'make-child') {
            withViewTransition(() => onChange(mergeInto(canvases, target.data.id as string, payload)));
          } else if (type === 'reorder-above' || type === 'reorder-below') {
            if (payload.kind === 'root') {
              const finishIndex = getReorderDestinationIndex({
                startIndex: payload.index,
                indexOfTarget: targetIndex,
                closestEdgeOfTarget: type === 'reorder-above' ? 'top' : 'bottom',
                axis: 'vertical'
              });

              if (finishIndex !== payload.index)
                withViewTransition(() => onChange(reorderRoot(canvases, payload.index, finishIndex)));
            } else {
              const insertIndex = type === 'reorder-above' ? targetIndex : targetIndex + 1;

              withViewTransition(() => onChange(extractChild(canvases, payload, insertIndex)));
            }
          }
          // composite onto composite, or blocked instructions: no-op
        }
      }),
      // Fallback drop target spanning the whole list: catches drags that land
      // in the gaps between cards, or past the first/last card, where no
      // individual card's own drop target is under the pointer. Without this,
      // overshooting a card even slightly loses the drop target entirely.
      dropTargetForElements({
        element,
        getData: ({ input }) => {
          const items = Array.from(element.children) as HTMLElement[];
          if (items.length === 0) return {};

          const boundaryIndex = items.findIndex(el => {
            const rect = el.getBoundingClientRect();
            return input.clientY < rect.top + rect.height / 2;
          });

          return boundaryIndex === -1
            ? { kind: 'list-fallback', id: canvases[items.length - 1].id, index: items.length - 1, edge: 'bottom' }
            : { kind: 'list-fallback', id: canvases[boundaryIndex].id, index: boundaryIndex, edge: 'top' };
        },
        onDrag: ({ self, location }) => {
          // Only pin when no more specific (card-level) drop target is under
          // the pointer, so a card's own hover state always takes precedence.
          const isInnermost = location.current.dropTargets[0] === self;
          setFallback(isInnermost && self.data.kind === 'list-fallback' ? (self.data as FallbackDropTarget) : null);
        },
        onDragLeave: () => setFallback(null),
        onDrop: () => setFallback(null)
      })
    );
  }, [canvases, onChange, extractChild, mergeInto, reorderRoot]);

  return (
    <div className="flex flex-col h-full bg-neutral-100">
      <ReconstructionTreeToolbar />

      <ScrollArea 
        className="grow min-h-0" 
        viewportRef={setViewportEl}>
        <ul ref={listRef} className="h-full flex flex-col gap-1.5 p-2.5">
          {canvases.map((item, index) => (
            <ReconstructionTreeItem
              key={item.id}
              item={item}
              index={index}
              isSelected={selection.some(s => s.id === item.id)}
              onSelect={event => onSelect(index, event)}
              pinnedEdge={fallback?.index === index ? fallback.edge : undefined} />
          ))}
        </ul>
      </ScrollArea>
    </div>
  )

}
