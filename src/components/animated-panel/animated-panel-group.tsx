import { useEffect, useState, type ReactNode } from 'react';
import { Group } from 'react-resizable-panels';
import { cn } from '@/shadcn/utils';

interface AnimatedPanelGroupProps {

  className?: string;

  children: ReactNode;

}

export const AnimatedPanelGroup = (props: AnimatedPanelGroupProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Don't animate on initial render (glitch!), but enable animate after
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Group
      className={cn(
        props.className,
        animate && '*:transition-[flex] *:duration-300 has-data-[separator=active]:*:transition-none'
      )}>

      {props.children}
    </Group>
  )
  
}