import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shadcn/button';
import { ScrollArea } from '@/shadcn/scroll-area';
import { ImportManifestDialog } from '@/dialogs/import-manifest';
import { useAppStore } from '@/store/app-store';
import { useSourcesStore } from '../sources-store';
import { EmptySourceTree } from './empty-source-tree';
import { SourceTreeItem } from './source-tree-item';
import { SourceTreeToolbar } from './source-tree-toolbar';


export const SourceTree = () => {
  const sources = useAppStore(state => state.sources);

  const expanded = useSourcesStore(state => state.expanded);
  const toggle = useSourcesStore(state => state.toggleSourceExpanded);

  const selection = useSourcesStore(state => state.selection);
  const setSelection = useSourcesStore(state => state.setSelection);

  const [showImportDialog, setShowImportDialog] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <SourceTreeToolbar />

      {sources.length === 0 ? (
        <EmptySourceTree 
          onImport={() => setShowImportDialog(true)} />
      ) : (
        <>
          <ScrollArea className="grow min-h-0 py-2.5">
            {sources.map(source => (
              <SourceTreeItem
                key={source.manifest.id}
                source={source}
                isExpanded={expanded.has(source.manifest.id)}
                isSelected={selection?.manifestId === source.manifest.id && !selection?.canvasId}
                selectedCanvasId={selection?.canvasId}
                onSelectManifest={() => setSelection({ manifestId: source.manifest.id })}
                onSelectCanvas={canvasId => setSelection({ manifestId: source.manifest.id, canvasId })}
                onToggleExpanded={() => toggle(source.manifest.id)}
                onRemove={() => {}} // removeSourceManifest(source.id)}
                onAddToReconstruction={canvas => {
                  // addCanvasToReconstruction(source.id, canvas)
                }} />
              ))}
            </ScrollArea>

            <div className="p-2.5 pb-1 border-t">
              <Button 
                className="w-full font-normal"
                onClick={() => setShowImportDialog(true)}>
                Import IIIF
              </Button>

              <Button 
                variant="link"
                className="w-full text-xs font-normal hover:text-primary text-muted-foreground">
                <Trash2 className="size-4 mb-0.5" /> Reset project
              </Button>
            </div>
          </>
        )
      }

      <ImportManifestDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} />
    </div>

  )

}