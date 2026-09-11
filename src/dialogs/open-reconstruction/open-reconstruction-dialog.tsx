import { useState } from 'react';
import { useLocation } from 'wouter';
import { IconAlertCircle, IconLoader2 } from '@tabler/icons-react';
import { IIIFIcon } from '@/components/iiif-icon';
import { Alert, AlertDescription } from '@/shadcn/alert';
import { Button } from '@/shadcn/button';
import { Input } from '@/shadcn/input';
import { Label } from '@/shadcn/label';
import { useAppStore } from '@/store/app-store';
import { openReconstructionFromURL } from '@/store/open-from-url';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/shadcn/dialog';

interface OpenReconstructionDialogProps {

  open: boolean;

  onOpenChange: (open: boolean) => void;

}

export const OpenReconstructionDialog = (props: OpenReconstructionDialogProps) => {
  const loadProject = useAppStore(state => state.loadProject);

  const [_, navigate] = useLocation();

  const [url, setUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetDialog = () => {
    setUrl('');
    setError(null);
  };

  const onOpenChange = (open: boolean) => {
    if (!open) resetDialog();
    props.onOpenChange(open);
  }

  const onImport = async () => {
    if (!url.trim()) {
      setError('Please enter a manifest URL');
      return;
    }

    setError(null);
    setFetching(true);

    try {
      const parsed = await openReconstructionFromURL(url.trim());
      loadProject(parsed.sources, parsed.reconstruction);
      navigate('/reconstruction');
      props.onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not load reconstruction');
    } finally {
      setFetching(false);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl gap-4">
        <DialogHeader className="gap-2">
          <DialogTitle className="flex items-center gap-2">
            <IIIFIcon color className="size-6 mb-0.75" />
            Open Reconstruction
          </DialogTitle>
          <DialogDescription>
            Open a manifest you exported previously from this editor for further editing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {fetching ? (
            <div className="p-4 animate-spin flex justify-center items-center">
              <IconLoader2 className="size-4 animate-spin" />
            </div>
          ) : (
            <>
              <Label htmlFor="manifest-url">Manifest URL</Label>
              <Input
                id="reconstruction-url"
                placeholder="https://example.org/iiif/manifest.json"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter')
                    onImport();
                }}
              />
              
              {error && (
                <Alert 
                  variant="destructive"
                  className="rounded">
                  <IconAlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            className="tracking-wide"
            onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
              
          <Button 
            className="tracking-wide"
            onClick={onImport}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}