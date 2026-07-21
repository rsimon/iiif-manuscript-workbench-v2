import { useState } from 'react';
import { Panel, Separator } from 'react-resizable-panels';
import { AnimatedPanel, AnimatedPanelGroup } from '@/components/animated-panel';
import { Viewer } from './viewer';
import { ThumbnailStrip } from './thumbnail-strip';
import { Metadata } from './metadata/metadata';

export const Preview = () => {
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  return (
    <main className="bg-muted grow">
      <AnimatedPanelGroup className="flex grow h-full min-h-0">
        <Panel
          minSize={240}
          defaultSize={300}
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
          <Metadata />
        </AnimatedPanel>
      </AnimatedPanelGroup>
    </main>
  )

}