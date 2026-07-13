import { useMemo, type ReactNode } from 'react';
import { Link, useLocation} from 'wouter';
import { cn  } from '@/shadcn/utils';
import { IIIFIcon } from '@/components/iiif-icon';
import { useAppStore } from '@/store/app-store';
import { Badge } from '@/shadcn/badge';
import { Help } from './menu-help';
import { Project } from './menu-project';

interface NavItemProps {
  
  href: string;

  className?: string;

  children: ReactNode;

}

const NavItem = (props: NavItemProps) => {
  const [location] = useLocation();

  return (
    <Link 
      href={props.href}
      className={cn(
        'px-2.5 h-12 flex items-center border-b-4 border-transparent text-sm',
        location === props.href ? 'border-b-primary' : 'text-muted-foreground/80',
        props.className
      )}>{props.children}</Link>
  )

}

export const AppHeader = () => {
  const reconstruction = useAppStore(state => state.reconstruction);

  const sourceCanvasCount = useMemo(() => 
    reconstruction.flatMap(s => s.type === 'original' ? s.source : s.sources).length
  , [reconstruction]);

  return (
    <header className="flex justify-between items-center px-4 text-sm 
      relative z-10 shadow-[0_0_1px_rgba(0,0,0,0.5)]">
      <IIIFIcon 
        color 
        className="size-8 mb-0.5" />

      <nav className="flex items-center gap-3 pt-0.5">
        <NavItem href="/sources">
          1. Select Sources
        </NavItem>
        
        <NavItem 
          href="/reconstruction"
          className="flex gap-1">
          <span>2. Reconstruct</span>
          <Badge 
            variant="secondary" 
            className="font-normal">
            {sourceCanvasCount}
          </Badge>
        </NavItem>

        <NavItem href="/preview">
          3. Preview and Export
        </NavItem>
      </nav>

      <div className="text-muted-foreground/80 flex items-center">
        <Project />
        <Help />
      </div>
    </header>
  )

}