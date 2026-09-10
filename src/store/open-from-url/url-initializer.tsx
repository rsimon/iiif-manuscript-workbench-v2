import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
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

const removeQueryParam = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('iiif-content');
  window.history.replaceState(null, '', url);
}

export const URLInitializer = () => {

  const initialized = useRef(false);
    
  const [error, setError] = useState<string | null>(null);

  const [_, navigate] = useLocation();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const contentURL = new URLSearchParams(window.location.search).get('iiif-content');
    if (!contentURL) return;

    openReconstructionFromURL(contentURL)
      .then(({ sources, reconstruction }) => {
        useAppStore.getState().loadProject(sources, reconstruction);
        removeQueryParam();
        navigate('/reconstruction');
      })
      .catch(error => {
        setError(error instanceof Error ? error.message : 'Could not load reconstruction');
      });
  }, [navigate]);

  return (
    <AlertDialog open={error !== null}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Could not open reconstruction
          </AlertDialogTitle>
          <AlertDialogDescription>{error}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={() => setError(null)}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

}