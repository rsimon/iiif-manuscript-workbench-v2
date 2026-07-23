import type { CanvasClickEvent, Viewer } from 'openseadragon';
import { useReconstructionStore } from '../reconstruction-store';
import { useEffect } from 'react';
import type { ComposerLayout } from './composer-types';
import { getImageAt, getItemAt } from './composer-utils';
import { useComposerStore } from './composer-store';
import { useAppStore } from '@/store/app-store';

export const useComposerSelection = (viewer: Viewer | undefined, layout: ComposerLayout) => {
  const setSelectedItems = useReconstructionStore(state => state.setSelection);
  const setSelectedImage = useComposerStore(state => state.setSelectedImage);

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