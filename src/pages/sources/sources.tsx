import { useState } from 'react';
import { Panel, Separator } from 'react-resizable-panels';
import { AnimatedPanel, AnimatedPanelGroup } from '@/components/animated-panel-group';
import { SourcePreview } from './source-preview';
import { SourceTree } from './source-tree';
import { MetadataInspector } from './metadata-inspector';

export const Sources = () => {
  const [isInspectorOpen, setInspectorOpen] = useState(false);

  return (
    <main className="grow min-h-0 flex flex-col">
      <AnimatedPanelGroup className="flex grow h-full min-h-0">
        <Panel
          minSize={260}
          defaultSize={340}>
          <SourceTree />
        </Panel>

        <Separator className="w-px bg-border" />

        <Panel className="min-h-full grow">
          <SourcePreview
            isInspectorOpen={isInspectorOpen}
            setInspectorOpen={setInspectorOpen} />
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