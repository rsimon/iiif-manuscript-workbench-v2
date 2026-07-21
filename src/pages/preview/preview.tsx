import { useState } from 'react';
import { Panel, Separator } from 'react-resizable-panels';
import { AnimatedPanel, AnimatedPanelGroup } from '@/components/animated-panel';
import { Viewer } from './viewer';
import { ThumbnailStrip } from './thumbnail-strip';
import { MetadataInspector } from './metadata-inspector';

export const Preview = () => {
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  return (
    <main className="bg-muted grow">
      <AnimatedPanelGroup className="flex grow h-full min-h-0">
        <Panel
          minSize={100}
          defaultSize={240}
          className="border-r">
          <ThumbnailStrip />
        </Panel>

        <Separator />

        <Panel>
          <Viewer />
        </Panel>

        <Separator />
        
        <AnimatedPanel 
          open={isMetadataOpen}
          onOpenChange={setIsMetadataOpen}
          minSize={40}
          openSize={300}
          className="bg-white border-l">
          <MetadataInspector />
        </AnimatedPanel>
      </AnimatedPanelGroup>
    </main>
  )

}