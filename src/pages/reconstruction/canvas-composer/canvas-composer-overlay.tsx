import { useEffect, useMemo, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { useAppStore } from '@/store/app-store';
import type { DragPayload } from '../reconstruction-tree/use-drag-and-drop';

type OverlayItem = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type ScreenItem = OverlayItem & {
  left: number;
  top: number;
  widthPx: number;
  heightPx: number;
};

interface CanvasComposerOverlayProps {
  viewer: OpenSeadragon.Viewer | null;
  items: OverlayItem[];
  selectedIds: string[];
}

type ComposerDropTarget =
  | { kind: 'reorder-target'; id: string; index: number; edge: 'top' | 'bottom' }
  | { kind: 'list-fallback'; id: string; index: number; edge: 'top' | 'bottom' };

export const CanvasComposerOverlay = (props: CanvasComposerOverlayProps) => {
  const { viewer, items, selectedIds } = props;
  const overlayContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<ComposerDropTarget | null>(null);
  const [screenItems, setScreenItems] = useState<ScreenItem[]>([]);
  const reconstruction = useAppStore(state => state.reconstruction);
  const updateReconstruction = useAppStore(state => state.updateReconstruction);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    if (!viewer) return;

    const computeScreenItems = () => {
      if (!viewer) return;
      const next = items.map(item => {
        const topLeft = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(item.x, item.y), true);
        const bottomRight = viewer.viewport.pixelFromPoint(
          new OpenSeadragon.Point(item.x + item.width, item.y + item.height),
          true
        );

        return {
          ...item,
          left: topLeft.x,
          top: topLeft.y,
          widthPx: Math.max(0, bottomRight.x - topLeft.x),
          heightPx: Math.max(0, bottomRight.y - topLeft.y)
        };
      });

      setScreenItems(next);
    };

    const resizeObserver = new ResizeObserver(computeScreenItems);
    resizeObserver.observe(viewer.container);

    viewer.addHandler('update-viewport', computeScreenItems);
    computeScreenItems();

    return () => {
      viewer.removeHandler('update-viewport', computeScreenItems);
      resizeObserver.disconnect();
    };
  }, [viewer, items]);

  useEffect(() => {
    const container = overlayContainerRef.current;
    if (!container || items.length === 0) return;

    const itemElements = items
      .map(item => ({ item, element: itemRefs.current[item.id] }))
      .filter((entry): entry is { item: OverlayItem; element: HTMLDivElement } => entry.element !== null);

    const itemAdapters = itemElements.map(({ item, element }, index) =>
      combine(
        draggable({
          element,
          getInitialData: (): DragPayload => ({ kind: 'root', id: item.id, index, itemType: 'original' }),
          onDragStart: () => setDraggingId(item.id),
          onDrop: () => setDraggingId(null)
        }),
        dropTargetForElements({
          element,
          getData: ({ input }) => {
            const rect = element.getBoundingClientRect();
            const edge = input.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';
            return { kind: 'reorder-target', id: item.id, index, edge };
          },
          onDrag: ({ self }) => setDropTarget(self.data as ComposerDropTarget),
          onDragLeave: () => setDropTarget(current => current?.id === item.id ? null : current),
          onDrop: ({ source, self }) => {
            setDraggingId(null);
            setDropTarget(null);
            const payload = source.data as unknown as DragPayload;
            if (payload.kind !== 'root') return;

            const target = self.data as ComposerDropTarget;
            if (target.kind !== 'reorder-target') return;

            const finishIndex = getReorderDestinationIndex({
              startIndex: payload.index,
              indexOfTarget: target.index,
              closestEdgeOfTarget: target.edge,
              axis: 'vertical'
            });

            if (finishIndex !== payload.index) {
              updateReconstruction(reorder({ list: reconstruction, startIndex: payload.index, finishIndex }));
            }
          }
        })
      )
    );

    const fallbackAdapter = dropTargetForElements({
      element: container,
      getData: ({ input }) => {
        if (screenItems.length === 0) return {};

        const boundaryIndex = screenItems.findIndex(item => input.clientY < item.top + item.heightPx / 2);
        return boundaryIndex === -1
          ? { kind: 'list-fallback', id: screenItems[screenItems.length - 1].id, index: screenItems.length - 1, edge: 'bottom' }
          : { kind: 'list-fallback', id: screenItems[boundaryIndex].id, index: boundaryIndex, edge: 'top' };
      },
      onDrag: ({ self }) => setDropTarget(self.data as ComposerDropTarget),
      onDragLeave: () => setDropTarget(null),
      onDrop: ({ source, self }) => {
        setDraggingId(null);
        setDropTarget(null);

        const payload = source.data as unknown as DragPayload;
        if (payload.kind !== 'root') return;

        const target = self.data as ComposerDropTarget;
        if (target.kind !== 'list-fallback') return;

        const finishIndex = getReorderDestinationIndex({
          startIndex: payload.index,
          indexOfTarget: target.index,
          closestEdgeOfTarget: target.edge,
          axis: 'vertical'
        });

        if (finishIndex !== payload.index) {
          updateReconstruction(reorder({ list: reconstruction, startIndex: payload.index, finishIndex }));
        }
      }
    });

    return combine(...itemAdapters, fallbackAdapter);
  }, [items, screenItems, reconstruction, updateReconstruction]);

  if (!viewer || items.length === 0) {
    return null;
  }

  return (
    <>
      <div ref={overlayContainerRef} className="absolute inset-0 z-20 pointer-events-none">
        {screenItems.map(item => {
          const isDragging = draggingId === item.id;
          const isTarget = dropTarget?.id === item.id;
          const edge = isTarget ? dropTarget?.edge : undefined;

          return (
            <div
              key={item.id}
              ref={el => { itemRefs.current[item.id] = el; }}
              className="absolute rounded-sm"
              style={{
                left: item.left,
                top: item.top,
                width: item.widthPx,
                height: item.heightPx,
                pointerEvents: 'auto',
                boxSizing: 'border-box',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab'
              }}
            >
              <div
                className="absolute inset-0 rounded-sm"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.06)',
                  pointerEvents: 'none'
                }}
              />

              <div
                className="absolute inset-0 rounded-sm"
                style={{
                  border: `2px solid ${selectedSet.has(item.id) ? '#2563eb' : '#6b7280'}`,
                  boxSizing: 'border-box',
                  pointerEvents: 'none'
                }}
              />

              {isTarget && edge === 'top' && (
                <div className="absolute left-0 right-0 top-0 h-1 bg-blue-600" />
              )}
              {isTarget && edge === 'bottom' && (
                <div className="absolute left-0 right-0 bottom-0 h-1 bg-blue-600" />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
