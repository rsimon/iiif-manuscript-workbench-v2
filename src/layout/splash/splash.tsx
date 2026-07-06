import { useState } from 'react';
import { Import } from 'lucide-react';
import { Button } from '@/shadcn/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/shadcn/dialog';
import { Checkbox } from '@/shadcn/checkbox';
import { Label } from '@/shadcn/label';
import { useAppStore } from '@/store/app-store';
import { useSplashStore } from './splash-store';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shadcn/carousel';
import { ImportManifestDialog } from '@/dialogs/import-manifest';

const SPLASH_CONTENT = [{
  title: '1. Select Sources',
  content: 'Import IIIF sources, preview, and pick the canvases you need.'
},{
  title: '2. Compose',
  content: 'Arrange, reorder, and create composites from multiple images in the Canvas Composer.'
},{
  title: '3. Preview and Export',
  content: 'Review your reconstruction and export it as a IIIF manifest.'
}];

export const Splash = () => {
  const dismissed = useSplashStore(state => state.dismissed);
  const dismiss = useSplashStore(state => state.dismiss);

  const [open, setOpen] = useState(!dismissed);

  const hasSources = useAppStore(state => state.sources.length > 0);

  const [showImportDialog, setShowImportDialog] = useState(false);

  const onImportFirstSource = () => {
    setShowImportDialog(true);
    setOpen(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-xl gap-4">
          <DialogTitle className="tracking-wide">
            IIIF Manuscript Workbench
          </DialogTitle>

          <p className="text-muted-foreground leading-relaxed">
            Rebuild manuscripts virtually — combine canvases from any IIIF source into
            a single manifest that opens in any IIIF viewer.
          </p>

          <div className="py-10 px-14">
            <Carousel>
              <CarouselContent className="px-4">
                {SPLASH_CONTENT.map(({ title, content }) => (
                  <CarouselItem
                    key={title}
                    className="leading-relaxed">
                    <h3 className="font-medium">{title}</h3>
                    <p>
                      {content}
                    </p>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          {hasSources ? (
            <Button
              size="lg"
              className="h-11"
              onClick={() => setOpen(false)}>
              Resume your reconstruction
            </Button>
          ) : (
            <Button
              size="lg"
              className="gap-2.5 h-11"
              onClick={onImportFirstSource}>
              <Import className="size-5" /> Import your first source
            </Button>
          )}

          <DialogFooter className="justify-center sm:justify-center">
            <Label className="text-xs font-normal text-muted-foreground">
              <Checkbox
                checked={dismissed}
                onCheckedChange={dismiss} />
              Don't show this message again
            </Label>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportManifestDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} />
    </>
  )

}
