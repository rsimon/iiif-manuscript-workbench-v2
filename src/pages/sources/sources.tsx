import { Button } from '@/shadcn/button';
import { Library } from 'lucide-react';
import { Group, Panel, Separator } from 'react-resizable-panels';

export const Sources = () => {

  return (
    <main className="grow flex flex-col">
      <Group className="bg-muted flex grow h-full min-h-0">
        <Panel 
          className="bg-white border-r"
          defaultSize={300}>
          <div className="flex h-full flex-col gap-8 items-center justify-center p-6 text-center">
            <div className="flex flex-col items-center">
              <Library 
                className="mb-2 h-8 w-8 text-muted-foreground" />

              <p className="text-sm text-muted-foreground">
                No source manifests
              </p>
            </div>

            <Button>
              Import from URL
            </Button>
          </div>
        </Panel>

        <Separator />
        
        <Panel className="min-h-full grow p-4">
          
        </Panel>
      </Group>
    </main>
  )

}