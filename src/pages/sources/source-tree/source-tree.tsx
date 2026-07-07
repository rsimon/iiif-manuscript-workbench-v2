import { useMemo, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { GroupedVirtuoso } from 'react-virtuoso';
import type { CozyCanvas } from 'cozy-iiif';
import { Badge } from '@/shadcn/badge';
import { Button } from '@/shadcn/button';
import { ScrollArea } from '@/shadcn/scroll-area';
import { TooltipProvider } from '@/shadcn/tooltip';
import { cn } from '@/shadcn/utils';
import { ImportManifestDialog } from '@/dialogs/import-manifest';
import { useAppStore } from '@/store/app-store';
import { useSourcesStore } from '../sources-store';
import { EmptySourceTree } from './empty-source-tree';
import { CanvasTreeItem, SourceTreeItem } from './source-tree-item';
import { SourceTreeToolbar } from './source-tree-toolbar';

export const SourceTree = () => {
  const sources = useAppStore(state => state.sources);

  const reconstruction = useAppStore(state => state.reconstruction);
  const addCanvas = useAppStore(state => state.addCanvasToReconstruction);
  const removeCanvas = useAppStore(state => state.removeCanvasFromReconstruction);

  const expanded = useSourcesStore(state => state.expanded);
  const toggle = useSourcesStore(state => state.toggleSourceExpanded);

  const selection = useSourcesStore(state => state.selection);
  const setSelection = useSourcesStore(state => state.setSelection);

  const [showImportDialog, setShowImportDialog] = useState(false);

  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);

  // Map: canvasIds in reconstruction, by manifest ID
  const inReconstructionByManifest = useMemo(() => 
    reconstruction.reduce<Map<string, Set<string>>>((map, r) => {
      if (!r.sourceManifestId) return map;

      const set = map.get(r.sourceManifestId) || new Set();
      set.add(r.canvas.id);
      map.set(r.sourceManifestId, set);
      return map;
    }, new Map())
  , [reconstruction]);

  // No. of visible canvas rows per manifest
  const groupCounts = useMemo(() =>
    sources.map(source =>
      expanded.has(source.manifest.id) ? source.manifest.canvases.length : 0
    ), [sources, expanded]);

  // No. of items before each group, to map the flat GroupedVirtuoso index
  // back to a canvas index inside the manifest
  const groupOffsets = useMemo(() =>
    groupCounts.reduce<{ offsets: number[]; total: number }>(
      ({ offsets, total }, count) => ({
        offsets: [...offsets, total],
        total: total + count,
      }),
      { offsets: [], total: 0 }
    ).offsets, [groupCounts]);

  const onSetCanvasInReconstruction = (sourceManifestId: string, canvas: CozyCanvas, isInReconstruction: boolean) => {
    if (isInReconstruction)
      addCanvas(sourceManifestId, canvas);
    else
      removeCanvas(canvas.id);
  }

  const renderManifestGroup = (idx: number) => {
    const source = sources[idx];
    const count = inReconstructionByManifest.get(source.manifest.id)?.size ?? 0;

    return (
      <SourceTreeItem
        source={source}
        isExpanded={expanded.has(source.manifest.id)}
        isSelected={selection?.manifestId === source.manifest.id && !selection?.canvasId}
        inReconstruction={count}
        onSelectManifest={() => setSelection({ manifestId: source.manifest.id })}
        onToggleExpanded={() => toggle(source.manifest.id)} />
    )
  }

  const renderCanvasRow = (idx: number, groupIdx: number) => {
    const source = sources[groupIdx];

    const canvasIndex = idx - groupOffsets[groupIdx];
    const canvas = source.manifest.canvases[canvasIndex];

    const isInReconstruction = inReconstructionByManifest.get(source.manifest.id)?.has(canvas.id) ?? false;
                    
    return (
      <div className={cn('pl-0.5', canvasIndex > 0 && 'pt-1')}>
        <CanvasTreeItem
          canvas={canvas}
          isSelected={selection?.manifestId === source.manifest.id && selection?.canvasId === canvas.id}
          isInReconstruction={isInReconstruction}
          onSelect={() => setSelection({ manifestId: source.manifest.id, canvasId: canvas.id })}
          onSetInReconstruction={isAdded => onSetCanvasInReconstruction(source.manifest.id, canvas, isAdded)} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <SourceTreeToolbar />

      {sources.length === 0 ? (
        <EmptySourceTree
          onImport={() => setShowImportDialog(true)} />
      ) : (
        <>
          <ScrollArea className="grow min-h-0" viewportRef={setViewportEl}>
            <div className="py-2.5">
              <TooltipProvider delay={500}>
                <GroupedVirtuoso
                  customScrollParent={viewportEl ?? undefined}
                  groupCounts={groupCounts}
                  components={{
                    Group: ({ style, ...rest}) => (
                      <div {...rest} style={{...style}} />
                    )
                  }}
                  groupContent={renderManifestGroup} 
                  itemContent={renderCanvasRow} />
              </TooltipProvider>
            </div>
          </ScrollArea>

          <div className="p-2.5 pb-1 border-t">
            <Button 
              disabled={reconstruction.length === 0}
              className="w-full font-normal"
              size="lg"
              onClick={() => setShowImportDialog(true)}>
              Continue to Compose 
              <Badge 
                className="bg-white/25">
                {reconstruction.length}
              </Badge>
            </Button>

            <Button 
              className="w-full font-normal mt-1.5"
              variant="outline"
              onClick={() => setShowImportDialog(true)}>
              <Upload /> Import IIIF
            </Button>

            <Button 
              variant="link"
              className="w-full text-xs font-normal text-muted-foreground">
              <Trash2 className="size-4 mb-0.5" /> Reset project
            </Button>
          </div>
        </>
      )}

      <ImportManifestDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} />
    </div>

  )

}