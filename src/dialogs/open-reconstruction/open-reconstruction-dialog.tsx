import { useState } from 'react';
import { IIIFIcon } from '@/components/iiif-icon';
import { Input } from '@/shadcn/input';
import { Label } from '@/shadcn/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/shadcn/dialog';
import { Button } from '@/shadcn/button';
import { Alert, AlertDescription } from '@/shadcn/alert';
import { IconAlertCircle } from '@tabler/icons-react';

interface OpenReconstructionDialogProps {

  open: boolean;

  onOpenChange: (open: boolean) => void;

}

export const OpenReconstructionDialog = (props: OpenReconstructionDialogProps) => {

  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetDialog = () => {
    setUrl('');
    setError(null);
  };

  const onOpenChange = (open: boolean) => {
    if (!open) resetDialog();
    props.onOpenChange(open);
  }

  const onImport = () => {
      if (!url.trim()) {
      setError('Please enter a manifest URL');
      return;
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