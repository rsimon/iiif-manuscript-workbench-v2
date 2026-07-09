import { Group, Panel, Separator } from 'react-resizable-panels';
import { CanvasComposer } from './canvas-composer';
import { ReconstructionTree } from './reconstruction-tree/reconstruction-tree';
import { useAppStore } from '@/store/app-store';

export const Reconstruction = () => {

  const reconstruction = useAppStore(state => state.reconstruction);

  return (
    <main className="grow min-h-0">
      <Group>
        <Panel
          minSize={240}
          defaultSize={300}
          className="border-r">
          <ReconstructionTree 
            canvases={reconstruction} 
            onChange={canvases => { console.log('not implemented', canvases) }} />
        </Panel>

        <Separator />

        <Panel>
          <CanvasComposer />
        </Panel>
      </Group>
    </main>
  )

}