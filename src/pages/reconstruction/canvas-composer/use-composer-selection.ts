import { Point, type CanvasClickEvent, type Viewer } from 'openseadragon';
import { useReconstructionStore } from '../reconstruction-store';
import { useEffect } from 'react';
import type { ComposerLayout } from '../reconstruction-types';
import { getImageAt, getItemAt } from './composer-utils';
import { useComposerStore } from './composer-store';
import { useAppStore } from '@/store/app-store';

export const useComposerSelection = (viewer: Viewer | undefined, layout: ComposerLayout) => {
  const selection = useReconstructionStore(state => state.selection);
  const setSelectedItems = useReconstructionStore(state => state.setSelection);
  const setSelectedImage = useComposerStore(state => state.setSelectedImage);

  // Clear selected image if canvas selection changes from outside (tree view)
  useEffect(() => {
    const { selectedImage } = useComposerStore.getState();
    if (!selectedImage) return;

    const stillSelected =
      selection.length === 1 && selection[0].id === selectedImage.item.reconstructionCanvasId;

    if (!stillSelected) setSelectedImage();
  }, [selection, setSelectedImage]);

  // Bring a selected canvas into view if it isn't already visible - this is
  // what makes selecting a page in the tree sidebar useful once the composer
  // no longer starts zoomed out to fit the entire manifest. A canvas that's
  // already at least partially on screen is left alone: that can only happen
  // if the selection came from clicking inside the composer itself (you
  // can't click something with zero screen overlap), where re-centering
  // would just be disorienting.
  useEffect(() => {
    if (!viewer) return;
    if (selection.length !== 1) return;

    const item = layout.items.find(i => i.reconstructionCanvasId === selection[0].id);
    if (!item) return;

    const bounds = viewer.viewport.getBounds(true);

    const isVisible =
      item.x < bounds.x + bounds.width && item.x + item.width > bounds.x &&
      item.y < bounds.y + bounds.height && item.y + item.height > bounds.y;

    if (isVisible) return;

    const center = new Point(item.x + item.width / 2, item.y + item.height / 2);
    viewer.viewport.panTo(center, false);
  }, [selection, viewer, layout]);

  useEffect(() => {
    if (!viewer) return;

    const onCanvasClick = (evt: CanvasClickEvent) => {
      if (!evt.quick) return;
      
      const { metaKey } = evt.originalEvent as PointerEvent;

      const point = viewer.viewport.viewerElementToViewportCoordinates(evt.position);
      const item = getItemAt(point, layout);

      if (item) {
        // Snapshot read (prevents re-running the effect)
        const { reconstruction } = useAppStore.getState();
        
        const canvas = reconstruction.find(r => r.id === item.reconstructionCanvasId);
        if (!canvas) return;

        if (metaKey) {
          setSelectedImage();
          setSelectedItems(current => [...current, canvas]);
        } else {
          setSelectedItems(current => {
            if (current.length === 1 && current[0].id === canvas.id) {
              // Same selected canvas, clicked again -> select image
              const { imagesByCanvasId } = useComposerStore.getState();
              const hit = getImageAt(point, layout, reconstruction, imagesByCanvasId);
              setSelectedImage(hit);
              return current;
            } else {
              setSelectedImage();
              return [canvas];
            }
          });
        }
      } else if (!metaKey) {
        setSelectedImage();
        setSelectedItems([]);
      }
    }

    viewer.addHandler('canvas-click', onCanvasClick);

    return () => {
      viewer?.removeHandler('canvas-click', onCanvasClick);
    }
  }, [viewer, layout, setSelectedItems, setSelectedImage]);

}