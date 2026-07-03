import { useState } from 'react';
import { Panel, Separator } from 'react-resizable-panels';
import { AnimatedPanel, AnimatedPanelGroup } from '@/components/animated-panel-group';
import { SourcePreview } from './source-preview';
import { SourceTree } from './source-tree';

export const Sources = () => {
  const [isInspectorOpen, setInspectorOpen] = useState(false);

  return (
    <main className="grow flex flex-col">
      <AnimatedPanelGroup className="bg-muted flex grow h-full min-h-0">
        <Panel 
          className="bg-white border-r"
          minSize={200}
          defaultSize={300}>
          <SourceTree />
        </Panel>

        <Separator />
        
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

        </AnimatedPanel>
      </AnimatedPanelGroup>
    </main>
  )

}