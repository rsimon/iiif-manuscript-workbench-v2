import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CozyCanvas, CozyManifest } from 'cozy-iiif';
import type { PhysicalSize, ReconstructionCanvas, SourceManifest } from '@/types';
import {
  appendEmptyCanvas,
  mergeInto,
  moveCanvas,
  parseCanvas,
  parseManifest,
  removeCanvasFromReconstruction
} from './app-store-utils';

interface AppStore {

  baseURI: string;

  sources: SourceManifest[];

  // Physical sizes by canvas ID
  sizes: Map<string, PhysicalSize>;

  reconstruction: ReconstructionCanvas[];

  // Actions: sources
  addSource: (url: string, manifest: CozyManifest) => void;
  removeSource: (manifestId: string) => void;
  removeAllSources: () => void;

  // Actions: reconstruction
  addCanvasToReconstruction: (sourceId: string, canvas: CozyCanvas) => void;
  addCanvasesToReconstruction: (sources: { sourceId: string, canvas: CozyCanvas}[]) => void;
  appendEmptyCanvas: (width?: number, height?: number) => void;
  mergeCanvases: (toMerge: ReconstructionCanvas[]) => void;
  moveCanvas: (canvasId: string, direction: MoveDirection) => void;
  removeCanvasFromReconstruction: (canvasId: string) => void;
  removeCanvasesFromReconstruction: (canvasIds: string[]) => void;
  updateReconstruction: (updated: ReconstructionCanvas[]) => void;
  // renameCanvas: (canvasId: string, label: string) => void;

  // Actions: combined
  setPhysicalSize: (sourceId: string, size?: PhysicalSize) => void;
  resetAll: () => void;

}

export type MoveDirection = 'up' | 'down' | 'top' | 'bottom';

export const useAppStore = create<AppStore>()(
  persist(
    set => ({

      baseURI: `${window.location.origin}/manifest/0001`,
    
      sources: [],

      reconstruction: [],

      sizes: new Map(),

      addSource: (url, manifest) => set(({ sources }) => {
        // Check if already added
        if (sources.some(s => s.url === url)) return {};
        return {
          sources: [...sources, { url, manifest }]
        };
      }),

      removeSource: manifestId => set(({ sources }) => ({
        sources: sources.filter(s => s.manifest.id !== manifestId)
      })),

      removeAllSources: () => set({ sources: [] }),

      addCanvasToReconstruction: (sourceId, canvas) => set(({ reconstruction, sizes }) => {
        // Don't re-add
        if (reconstruction.find(r => r.id === canvas.id)) return {};

        return {
          reconstruction: [
            ...reconstruction, 
            {
              type: 'original',
              id: canvas.id,
              label: canvas.getLabel(),
              source: {
                sourceManifestId: sourceId,
                canvas,
                physicalSize: sizes.get(canvas.id)
              }
            }
          ]
        };
      }),

      addCanvasesToReconstruction: sources => set(({ reconstruction, sizes }) => {
        const toAdd = sources.filter(s => !reconstruction.some(r => r.id === s.canvas.id));
        if (toAdd.length === 0) return {};

        return {
          reconstruction: [
            ...reconstruction,
            ...toAdd.map(s => ({
              type: 'original' as const,
              id: s.canvas.id,
              label: s.canvas.getLabel(),
              source: {
                sourceManifestId: s.sourceId,
                canvas: s.canvas,
                physicalSize: sizes.get(s.canvas.id)
              }
            }))
          ]
        }
      }),

      appendEmptyCanvas: (fallbackWidth = 2000, fallbackHeight = 3000) => set(({ baseURI, reconstruction }) => ({
        reconstruction: appendEmptyCanvas(reconstruction, baseURI, fallbackWidth, fallbackHeight)
      })),

      mergeCanvases: toMerge => set(({ baseURI, reconstruction  }) => ({
        reconstruction: mergeInto(toMerge, reconstruction, baseURI)
      })),

      moveCanvas: (canvasId, direction) => set(({ reconstruction }) => ({
        reconstruction: moveCanvas(reconstruction, canvasId, direction)
      })),

      removeCanvasFromReconstruction: canvasId => set(({ reconstruction }) => ({
        reconstruction: removeCanvasFromReconstruction(reconstruction, canvasId)
      })),

      removeCanvasesFromReconstruction: canvasIds => set(({ reconstruction }) => ({
        reconstruction: removeCanvasFromReconstruction(reconstruction, canvasIds)
      })),

      updateReconstruction: reconstruction => set({ reconstruction }),

      setPhysicalSize: (sourceCanvasId, size) => set(({ reconstruction, sizes }) => {
        // Update 'sizes' map
        const updatedSizes = new Map(sizes);
        if (size)
          updatedSizes.set(sourceCanvasId, size);
        else
          updatedSizes.delete(sourceCanvasId);

        // Traverse reconstruction and update, in case it's already added
        const updatedReconstruction = reconstruction.map(r => {
          if (r.type === 'original') {
            return r.source.canvas.id === sourceCanvasId ? {
              ...r, 
              physicalSize: size
            } : r;
          } else {
            const isAffected = r.sources.some(s => s.canvas.id === sourceCanvasId);
            return isAffected ? {
              ...r,
              sources: r.sources.map(source => source.canvas.id === sourceCanvasId ? {
                ...source,
                physicalSize: size
              } : source)
            } : r;
          }
        });

        return { sizes: updatedSizes, reconstruction: updatedReconstruction };
      }),

      resetAll: () => set(() => ({
        reconstruction: [],
        sources: [],
        sizes: new Map()
      }))
    }), {
      name: 'iiif-workbench-state',
      version: 2,
      storage: createJSONStorage(() => localStorage),

      partialize: state => ({
        ...state,

        sizes: Array.from(state.sizes.entries()),

        sources: state.sources.map(s => ({
          ...s,
          manifest: s.manifest.source
        })),

        reconstruction: state.reconstruction.map(r => r.type === 'original' ? {
          ...r,
          source: {
            ...r.source,
            canvas: r.source.canvas.source
          }
        } : {
          ...r,
          sources: r.sources.map(s => ({
            ...s,
            canvas: s.canvas.source
          }))
        })
      }),

      merge: (persisted: any, current: AppStore) => {
        if (!persisted) return current;

        return {
          ...current,
          ...persisted,

          sizes: new Map(persisted.sizes ?? []),

          sources: (persisted.sources ?? []).map((s: any) => ({
            url: s.url,
            manifest: parseManifest(s.manifest)
          })),

          reconstruction: (persisted.reconstruction ?? []).map((r: any) => r.type === 'original' ? {
            ...r,
            source: {
              ...r.source,
              canvas: parseCanvas(r.source.canvas)
            }
          } : {
            ...r,
            sources: r.sources.map((s: any) => ({
              ...s,
              canvas: parseCanvas(s.canvas)
            }))
          })
        }
      }
    }
  )
);