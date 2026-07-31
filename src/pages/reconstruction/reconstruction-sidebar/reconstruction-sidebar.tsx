import { ScrollArea } from '@/shadcn/scroll-area';
import { useReconstructionStore } from '../reconstruction-store';
import { useComposerStore } from '../canvas-composer/composer-store';
import { EmptySidebar } from './empty-sidebar/empty-sidebar';
import { MultiSelection } from './multi-selection';
import { SingleSelection } from './single-selection';

export const ReconstructionSidebar = () => {
  const selection = useReconstructionStore(state => state.selection);

  const selectedImage = useComposerStore(state => state.selectedImage);

  return (
    <ScrollArea className="h-full">
      {selection.length === 0 ? (
        <EmptySidebar />
      ) : selection.length > 1 ? (
        <MultiSelection
          selection={selection} />
      ) : (
        <SingleSelection
          canvas={selection[0]}
          imageSelection={selectedImage} />
      )}
    </ScrollArea>
  )

}