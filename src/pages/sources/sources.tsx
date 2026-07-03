import { useState } from 'react';
import { Panel, Separator } from 'react-resizable-panels';
import { EmptySources } from './empty-sources';
import { SourceToolbar } from './source-toolbar';
import { AnimatedPanel, AnimatedPanelGroup } from '@/components/animated-panel-group';

export const Sources = () => {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  return (
    <main className="grow flex flex-col">
      <AnimatedPanelGroup className="bg-muted flex grow h-full min-h-0">
        <Panel 
          className="bg-white border-r"
          minSize={200}
          defaultSize={300}>
          <div className="flex flex-col h-full">
            <SourceToolbar />
            <EmptySources />
          </div>
        </Panel>

        <Separator />
        
        <Panel className="min-h-full grow p-4">
          <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}>
            {isRightPanelOpen ? 'Close panel' : 'Open panel'}
          </button>
        </Panel>

        <Separator />

        <AnimatedPanel 
          open={isRightPanelOpen}
          onOpenChange={setIsRightPanelOpen}
          minSize={40}
          openSize={300}
          className="bg-amber-300">

        </AnimatedPanel>
      </AnimatedPanelGroup>
    </main>
  )

}