import { useState } from 'react';
import { EmptySourceTree } from './empty-source-tree';
import { SourceTreeToolbar } from './source-tree-toolbar';
import { ImportManifestDialog } from '../import-manifest';

export const SourceTree = () => {

   const [showImportDialog, setShowImportDialog] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <SourceTreeToolbar />

      <EmptySourceTree 
        onImport={() => setShowImportDialog(true)} />

      <ImportManifestDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} />
    </div>

  )

}