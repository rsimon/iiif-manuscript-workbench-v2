import { useMemo } from 'react';
import { create } from 'zustand';
import { useAppStore } from '@/store/app-store';
import type { SourceManifest } from '@/types';

interface SourcesStore {

  selection?: SourceSelection;

  expanded: Set<string>;

  showInReconstructionOnly: boolean;

  // Actions: selection
  setSelection: (selection?: SourceSelection) => void;

  // Actions: collapse/expand
  collapseAll: () => void;
  expandAll: () => void;
  toggleSourceExpanded: (manifestId: string) => void;
  
  // Actions: view filtering
  setShowInReconstructionOnly: (showInReconstructionOnly: boolean) => void;

}

interface SourceSelection {

  manifestId: string;

  canvasId: string;

}

export const useSourcesStore = create<SourcesStore>()(set => ({

  selection: undefined,

  expanded: new Set(),

  showInReconstructionOnly: false,

  setSelection: selection => set(() => ({ selection })),

  collapseAll: () => set(() => ({ expanded: new Set() })),

  expandAll: () => set(() => ({ expanded: new Set(useAppStore.getState().sources.map(s => s.manifest.id)) })),

  toggleSourceExpanded: manifestId => set(({ expanded }) => expanded.has(manifestId) ? {
    expanded: new Set([...expanded].filter(id => id !== manifestId))
  } : {
    expanded: new Set([...expanded, manifestId])
  }),

  setShowInReconstructionOnly: showInReconstructionOnly => set({ showInReconstructionOnly  })

}));

export const useSelectedSource = () => {
  const sources = useAppStore(state => state.sources);
  const selection = useSourcesStore(state => state.selection);

  return useMemo(() => {
    if (!selection) return {};

    const { manifestId, canvasId } = selection;

    const manifest = sources.find(s => s.manifest.id === manifestId)?.manifest;

    const canvas = canvasId
      ? manifest?.canvases.find(c => c.id === canvasId)
      : manifest?.canvases[0];

    return { manifest, canvas };
  }, [selection, sources]);
  
}

// Helper: automatically selects the first available canvas
const autoSelect = (sources: SourceManifest[]) => {
  const { selection, setSelection } = useSourcesStore.getState();
  if (selection || sources.length === 0) return;

  const first = sources[0];
  setSelection(first
    ? { manifestId: first.manifest.id, canvasId: first.manifest.canvases[0]?.id }
    : undefined
  );
}

// Autoselect once after the store hydrates
autoSelect(useAppStore.getState().sources);

// Autoselect after the store changes from no sources to >1 source
useAppStore.subscribe((state, prevState) => {
  if (prevState.sources.length === 0 && state.sources.length > 0)
    autoSelect(state.sources);
});