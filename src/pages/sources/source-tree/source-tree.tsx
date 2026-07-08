import { useMemo, useState } from 'react';
import { IconUpload } from '@tabler/icons-react';
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
import type { SourceManifest } from '@/types';

interface SourceTreeProps {

  // Canvas IDs in the reconstruction, by manifest ID
  inReconstructionByManifest: Map<string, Set<string>>;

  // Canvases visible after possible filtering, by manifest ID
  visibleCanvases: { source: SourceManifest, canvases: CozyCanvas[] }[];

}

export const SourceTree = (props: SourceTreeProps) => {
  const sources = useAppStore(state => state.sources);

  const reconstruction = useAppStore(state => state.reconstruction);
  const addCanvas = useAppStore(state => state.addCanvasToReconstruction);
  const removeCanvas = useAppStore(state => state.removeCanvasFromReconstruction);

  const collapsed = useSourcesStore(state => state.collapsed);
  const toggle = useSourcesStore(state => state.toggleSourceExpanded);

  const selection = useSourcesStore(state => state.selection);
  const setSelection = useSourcesStore(state => state.setSelection);

  const [showImportDialog, setShowImportDialog] = useState(false);

  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);

  // No. of visible canvas rows per manifest
  const groupCounts = useMemo(() =>
    sources.map((source, idx) =>
      !collapsed.has(source.manifest.id) ? props.visibleCanvases[idx].canvases.length : 0
    ), [sources, collapsed, props.visibleCanvases]);

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
    const count = props.inReconstructionByManifest.get(source.manifest.id)?.size ?? 0;

    return (
      <SourceTreeItem
        source={source}
        isCollapsed={collapsed.has(source.manifest.id)}
        isSelected={selection?.manifestId === source.manifest.id && !selection?.canvasId}
        inReconstruction={count}
        onToggleExpanded={() => toggle(source.manifest.id)} />
    )
  }

  const renderCanvasRow = (idx: number, groupIdx: number) => {
    const source = sources[groupIdx];

    const canvasIndex = idx - groupOffsets[groupIdx];
    const canvas = props.visibleCanvases[groupIdx].canvases[canvasIndex];

    const isInReconstruction = props.inReconstructionByManifest.get(source.manifest.id)?.has(canvas.id) ?? false;
                    
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
            <div className="py-2.5 pl-1 pr-2.5">
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

          <div className="p-2.5 border-t">
            <Button 
              disabled={reconstruction.length === 0}
              className="w-full font-normal"
              size="lg"
              onClick={() => setShowImportDialog(true)}>
              Continue to Reconstruction 
              <Badge 
                className="bg-white/25">
                {reconstruction.length}
              </Badge>
            </Button>

            <Button 
              className="w-full font-normal mt-1.5"
              variant="outline"
              onClick={() => setShowImportDialog(true)}>
              <IconUpload /> Import IIIF
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