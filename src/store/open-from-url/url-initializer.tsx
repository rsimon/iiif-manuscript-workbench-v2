import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { IconLoader2 } from '@tabler/icons-react';
import { useAppStore } from '../app-store';
import { openReconstructionFromURL } from './open-from-url';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shadcn/alert-dialog';

interface URLInitializerProps {

  children?: ReactNode;

}

const removeQueryParam = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('iiif-content');
  window.history.replaceState(null, '', url);
}

const CONTENT_URL = new URLSearchParams(window.location.search)
  .get('iiif-content');

const HAS_CONTENT_PARAM = new URLSearchParams(window.location.search)
  .has('iiif-content');

export const URLInitializer = ({ children }: URLInitializerProps) => {

  const initialized = useRef(false);
  const [loading, setLoading] = useState(Boolean(CONTENT_URL));

  const [error, setError] = useState<string | undefined>();

  const [_, navigate] = useLocation();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!CONTENT_URL) return;

    openReconstructionFromURL(CONTENT_URL)
      .then(({ sources, reconstruction }) => {
        useAppStore.getState().loadProject(sources, reconstruction);
        removeQueryParam();
        navigate('/reconstruction');
      })
      .catch(error => {
        setError(error instanceof Error ? error.message : 'Could not load reconstruction');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const onCloseError = () => {
    setError(undefined);
    removeQueryParam();
  }

  return (
    <>
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 
            bg-white/50 supports-backdrop-filter:backdrop-blur-xs text-foreground/70">
          <IconLoader2 className="size-5 animate-spin" />
        </div>
      )}

      <AlertDialog open={Boolean(error)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Could not open reconstruction
            </AlertDialogTitle>
            <AlertDialogDescription
              className="leading-relaxed mt-1 space-y-4">
              <div>
                The manifest at <a href={CONTENT_URL!} target="_blank">{CONTENT_URL}</a> could not
                be loaded as a reconstruction project. Note that only manifests exported previously
                with this tool can be imported as a project.
              </div>

              <code className="bg-red-100 px-2.5 py-2 rounded-sm border border-red-500 text-red-500 block w-full">
                Error: {error}
              </code>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={onCloseError}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!HAS_CONTENT_PARAM && children}
    </>
  )

}