import { ScrollArea } from '@/shadcn/scroll-area';
import { useAppStore } from '@/store/app-store';
import { useReconstructionStore } from '../reconstruction-store';
import { useComposerStore } from '../canvas-composer/composer-store';
import { EmptySidebar } from './empty-sidebar/empty-sidebar';
import { MultiSelection } from './multi-selection';
import { SingleSelection } from './single-selection';

export const ReconstructionSidebar = () => {
  const reconstruction = useAppStore(state => state.reconstruction);

  const selection = useReconstructionStore(state => state.selection);

  // const selectedImage = useComposerStore(state => state.selectedImage);
  const imagesByCanvasId = useComposerStore(state => state.imagesByCanvasId);

  return (
    <ScrollArea className="h-full">
      {selection.length === 0 ? (
        <EmptySidebar />
      ) : selection.length > 1 ? (
        <MultiSelection
          selection={selection}
          reconstruction={reconstruction}
          imagesByCanvasId={imagesByCanvasId} />
      ) : (
        <SingleSelection
          canvas={selection[0]}
          // index={reconstruction.findIndex(r => r.id === selection[0].id)}
          // images={imagesByCanvasId.get(selection[0].id) ?? []}
          // selectedImage={selectedImage} 
          />
      )}
    </ScrollArea>
  )

}