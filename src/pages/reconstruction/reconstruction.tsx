import { Group, Panel, Separator } from 'react-resizable-panels';
import { CanvasComposer } from './canvas-composer';
import { ReconstructionTree } from './reconstruction-tree/tree';

export const Reconstruction = () => {

  return (
    <main className="grow min-h-0">
      <Group>
        <Panel
          minSize={240}
          defaultSize={360}
          className="border-r border-neutral-300/80">
          <ReconstructionTree />
        </Panel>

        <Separator />

        <Panel>
          <CanvasComposer />
        </Panel>
      </Group>
    </main>
  )

}