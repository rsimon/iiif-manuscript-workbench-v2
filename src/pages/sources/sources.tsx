import { Group, Panel, Separator } from 'react-resizable-panels';
import { EmptySources } from './empty-sources';
import { SourceToolbar } from './source-toolbar';

export const Sources = () => {

  return (
    <main className="grow flex flex-col">
      <Group className="bg-muted flex grow h-full min-h-0">
        <Panel 
          className="bg-white border-r"
          defaultSize={300}>
          <div className="flex flex-col h-full">
            <SourceToolbar />
            <EmptySources />
          </div>
        </Panel>

        <Separator />
        
        <Panel className="min-h-full grow p-4">
          
        </Panel>
      </Group>
    </main>
  )

}