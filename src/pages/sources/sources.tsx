import { useState } from 'react';
import { Panel, Separator } from 'react-resizable-panels';
import { AnimatedPanel, AnimatedPanelGroup } from '@/components/animated-panel';
import { MeasurementProvider } from '@/dialogs/physical-dimensions';
import { SourceMetadata } from './source-metadata';
import { SourcePreview } from './source-preview';
import { SourceTree } from './source-tree';

export const Sources = () => {
  const [isInspectorOpen, setInspectorOpen] = useState(false);

  return (
    <main className="grow min-h-0">
      <AnimatedPanelGroup className="flex grow h-full min-h-0">
        <Panel
          minSize={240}
          defaultSize={300}
          className="border-r">
          <SourceTree />
        </Panel>

        <Separator />

        <Panel>
          <MeasurementProvider>
            <SourcePreview
              isInspectorOpen={isInspectorOpen}
              setInspectorOpen={setInspectorOpen} />
          </MeasurementProvider>
        </Panel>

        <Separator />

        <AnimatedPanel 
          open={isInspectorOpen}
          onOpenChange={setInspectorOpen}
          minSize={40}
          openSize={300}
          className="bg-white border-l">
          <SourceMetadata />
        </AnimatedPanel>
      </AnimatedPanelGroup>
    </main>
  )

}