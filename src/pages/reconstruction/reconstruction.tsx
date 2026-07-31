import { useState } from 'react';
import { Panel, Separator } from 'react-resizable-panels';
import { CanvasComposer } from './canvas-composer';
import { ReconstructionTree } from './reconstruction-tree/tree';
import { AnimatedPanel, AnimatedPanelGroup } from '@/components/animated-panel';
import { ReconstructionSidebar } from './reconstruction-sidebar';

export const Reconstruction = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="grow min-h-0">
      <AnimatedPanelGroup>
        <Panel
          minSize={240}
          defaultSize={360}
          className="border-r border-neutral-300/80">
          <ReconstructionTree />
        </Panel>

        <Separator />

        <Panel>
          <CanvasComposer 
            isSidebarOpen={isSidebarOpen} 
            onChangeSidebarOpen={setSidebarOpen} />
        </Panel>

        <Separator />

        <AnimatedPanel 
          open={isSidebarOpen}
          onOpenChange={setSidebarOpen}
          minSize={40}
          openSize={220}
          className="bg-white border-l">
          <ReconstructionSidebar />
        </AnimatedPanel>
      </AnimatedPanelGroup>
    </main>
  )

}