import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CozyCanvas, CozyManifest } from 'cozy-iiif';
import type { ReconstructionCanvas, SourceManifest } from '@/types';
import { /* getEmptyCanvasLabel, */ parseCanvas, parseManifest, removeCanvasFromReconstruction } from './app-store-utils';

interface AppStore {

  baseURI: string;

  sources: SourceManifest[];

  reconstruction: ReconstructionCanvas[];

  // Actions: sources
  addSource: (url: string, manifest: CozyManifest) => void;
  removeSource: (manifestId: string) => void;
  removeAllSources: () => void;

  // Actions: reconstruction
  addCanvasToReconstruction: (sourceId: string, canvas: CozyCanvas) => void;
  addCanvasesToReconstruction: (arg: { sourceId: string, canvas: CozyCanvas}[]) => void;
  // createEmptyCanvas: (width?: number, height?: number) => void;
  removeCanvasFromReconstruction: (canvasId: string) => void;
  removeCanvasesFromReconstruction: (canvasIds: string[]) => void;
  updateReconstruction: (updated: ReconstructionCanvas[]) => void;
  // renameCanvas: (canvasId: string, label: string) => void;

  // Actions: combined
  resetAll: () => void;

}

export const useAppStore = create<AppStore>()(
  persist(
    set => ({

      baseURI: `${window.location.origin}/manifest/0001`,
    
      sources: [],

      reconstruction: [],

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

      addCanvasToReconstruction: (sourceId, canvas) => set(({ reconstruction }) => {
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
                canvas
              }
            }
          ]
        };
      }),

      addCanvasesToReconstruction: arg => set(({ reconstruction }) => {
        const toAdd = arg.filter(t => !reconstruction.some(r => r.id === t.canvas.id));
        if (toAdd.length === 0) return {};

        return {
          reconstruction: [
            ...reconstruction,
            ...toAdd.map(t => ({
              type: 'original' as const,
              id: t.canvas.id,
              label: t.canvas.getLabel(),
              source: {
                sourceManifestId: t.sourceId,
                canvas: t.canvas
              }
            }))
          ]
        }
      }),

      /*
      createEmptyCanvas: (width = 1000, height = 1000) => set(({ baseURI, reconstruction }) => ({
        reconstruction: [
          ...reconstruction,
          { 
            canvas: parseCanvas({
              id: `${baseURI}/canvas/${crypto.randomUUID()}`,
              type: 'Canvas',
              label: {
                en: getEmptyCanvasLabel(reconstruction)
              },
              width,
              height
            }) 
          }
        ]
      })),
      */

      removeCanvasFromReconstruction: canvasId => set(({ reconstruction }) => ({
        reconstruction: removeCanvasFromReconstruction(reconstruction, canvasId)
      })),

      removeCanvasesFromReconstruction: canvasIds => set(({ reconstruction }) => ({
        reconstruction: removeCanvasFromReconstruction(reconstruction, canvasIds)
      })),

      updateReconstruction: reconstruction => set({ reconstruction }),

      resetAll: () => set(() => ({
        reconstruction: [],
        sources: []
      }))
    }), {
      name: 'iiif-workbench-state',
      version: 2,
      storage: createJSONStorage(() => localStorage),

      partialize: state => ({
        ...state,

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