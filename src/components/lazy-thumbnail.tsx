import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import pLimit from 'p-limit';
import { cn } from '@/shadcn/utils';
import { Skeleton } from '@/shadcn/skeleton';

const IDLE_DELAY_MS = 350;
const FETCH_TIMEOUT_MS = 30000;

const limit = pLimit(5);

const preload = (src: string, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
  if (signal.aborted) {
    reject(new Error('aborted'));
    return;
  }

  const img = new Image();

  const cleanup = () => {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
    img.onload = null;
    img.onerror = null;
  };

  const cancel = (reason: string) => {
    cleanup();
    img.removeAttribute('src');
    reject(new Error(reason));
  };

  const onAbort = () => cancel('Aborted');

  signal.addEventListener('abort', onAbort, { once: true });

  const timer = setTimeout(() => cancel('Timeout'), FETCH_TIMEOUT_MS);

  img.onload = () => { cleanup(); resolve(); };
  img.onerror = () => { cleanup(); reject(new Error(`Failed to load: ${src}`)); };

  img.src = src;
});

type LazyThumbnailState = 'pending' | 'loaded' | 'failed';

interface LazyThumbnailProps {

  src: string;

  alt: string;

  className?: string;

}

export const LazyThumbnail = (props: LazyThumbnailProps) => {
  const { src, alt, className } = props;

  const [state, setState] = useState<LazyThumbnailState>('pending');

  const { ref, inView } = useInView({
    rootMargin: '200px 0px',
    skip: state !== 'pending',
  });

  useEffect(() => {
    if (!inView || state !== 'pending') return;

    const controller = new AbortController();

    const timer = setTimeout(() => {
      void limit(async () => {
        if (controller.signal.aborted) return;
        await preload(src, controller.signal).then(
          () => { if (!controller.signal.aborted) setState('loaded'); },
          () => { if (!controller.signal.aborted) setState('failed'); },
        );
      });
    }, IDLE_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [inView, state, src]);

  return (
    <div ref={ref} className={cn('relative aspect-square overflow-hidden', className)}>
      {state === 'loaded' ? (
        <img
          src={src}
          alt={alt}
          decoding="async"
          className="size-full object-cover" />
      ) : state === 'pending' ? (
        <Skeleton className="size-full" />
      ) : state === 'failed' ? (
        <div role="img" aria-label={alt} className="bg-muted size-full" />
      ) : null}
    </div>
  )

}