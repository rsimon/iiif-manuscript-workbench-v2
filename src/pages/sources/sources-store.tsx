import { create } from 'zustand';
import { useAppStore } from '@/store/app-store';

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