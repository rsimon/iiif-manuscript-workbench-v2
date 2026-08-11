import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import pLimit from 'p-limit';
import { cn } from '@/shadcn/utils';
import { Skeleton } from '@/shadcn/skeleton';

const IDLE_DELAY_MS = 350;
const FETCH_TIMEOUT_MS = 30000;

const limit = pLimit(5);

const preload = (src: string) => new Promise<void>((resolve, reject) => {
  const img = new Image();

  // Additional load timeout for convenience
  const timer = setTimeout(() => {
    img.src = '';
    reject();
  }, FETCH_TIMEOUT_MS);

  const settle = (fn: () => void) => () => { clearTimeout(timer); fn(); };
  
  img.onload = settle(resolve);
  img.onerror = settle(reject);

  img.src = src;
});

interface LazyThumbnailProps {

  src: string;

  alt: string;

  className?: string;

}

export const LazyThumbnail = (props: LazyThumbnailProps) => {
  const { src, alt, className } = props;

  const [loaded, setLoaded] = useState(false);

  const { ref, inView } = useInView({ rootMargin: '200px 0px', skip: loaded });

  useEffect(() => {
    if (!inView || loaded) return;

    let cancelled = false;

    const timer = setTimeout(() => {
      limit(async () => {
        if (cancelled) return;
        await preload(src).catch(() => {});
        if (!cancelled) setLoaded(true);
      });
    }, IDLE_DELAY_MS);

    return () => { 
      cancelled = true; 
      clearTimeout(timer); 
    };
  }, [inView, loaded, src]);

  return (
    <div ref={ref} className={cn(className, 'relative overflow-hidden')}>
      {loaded ? (
        <img 
          src={src} 
          alt={alt} 
          className="size-full object-cover" />
      ) : ( 
        <Skeleton className="size-full" />
      )}
    </div>
  );
};