import { useMemo, useState } from 'react';
import { Panel, Separator } from 'react-resizable-panels';
import { AnimatedPanel, AnimatedPanelGroup } from '@/components/animated-panel-group';
import { useAppStore } from '@/store/app-store';
import { MetadataInspector } from './metadata-inspector';
import { SourcePreview } from './source-preview';
import { useSelectedSource, useSourcesStore } from './sources-store';
import { SourceTree } from './source-tree';

export const Sources = () => {
  const [isInspectorOpen, setInspectorOpen] = useState(false);

  const sources = useAppStore(state => state.sources);
  const reconstruction = useAppStore(state => state.reconstruction);

  const { manifest, canvas } = useSelectedSource();

  const showInReconstructionOnly = useSourcesStore(state => state.showInReconstructionOnly);

  // Map: canvasIds in reconstruction, by manifest ID
  const inReconstructionByManifest = useMemo(() => 
    reconstruction.reduce<Map<string, Set<string>>>((map, r) => {
      if (!r.sourceManifestId) return map;

      const set = map.get(r.sourceManifestId) || new Set();
      set.add(r.canvas.id);
      map.set(r.sourceManifestId, set);
      return map;
    }, new Map())
  , [reconstruction]);

  // Visible canvases (in the sources tree and preview pagination)
  const visibleCanvases = useMemo(() =>
    showInReconstructionOnly 
      ? sources.map(s => ({
          source: s, 
          canvases: s.manifest.canvases.filter(canvas => reconstruction.some(r => r.canvas.id === canvas.id))
        }))
      : sources.map(s => ({ source: s, canvases: s.manifest.canvases }))
    , [sources, showInReconstructionOnly, inReconstructionByManifest]);

  const onSelectNext = () => {
    
  }

  const onSelectPrevious = () => {

  }

  return (
    <main className="grow min-h-0 flex flex-col">
      <AnimatedPanelGroup className="flex grow h-full min-h-0">
        <Panel
          minSize={260}
          defaultSize={340}
          className="border-r">
          <SourceTree 
            inReconstructionByManifest={inReconstructionByManifest}
            visibleCanvases={visibleCanvases} />
        </Panel>

        <Separator />

        <Panel className="min-h-full grow">
          <SourcePreview
            visibleCanvases={visibleCanvases}
            isFiltered={showInReconstructionOnly}
            isInspectorOpen={isInspectorOpen}
            currentManifest={manifest}
            currentCanvas={canvas}
            setInspectorOpen={setInspectorOpen} 
            onSelectNext={onSelectNext}
            onSelectPrevious={onSelectPrevious} />
        </Panel>

        <Separator />

        <AnimatedPanel 
          open={isInspectorOpen}
          onOpenChange={setInspectorOpen}
          minSize={40}
          openSize={300}
          className="bg-white border-l">
          <MetadataInspector />
        </AnimatedPanel>
      </AnimatedPanelGroup>
    </main>
  )

}