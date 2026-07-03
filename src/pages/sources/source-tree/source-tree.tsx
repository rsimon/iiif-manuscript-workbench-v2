import { EmptySourceTree } from './empty-source-tree';
import { SourceTreeToolbar } from './source-tree-toolbar';

export const SourceTree = () => {

  return (
    <div className="flex flex-col h-full">
      <SourceTreeToolbar />
      <EmptySourceTree />
    </div>

  )

}