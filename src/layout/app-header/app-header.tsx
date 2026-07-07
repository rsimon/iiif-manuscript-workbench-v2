import type { ReactNode } from 'react';
import { Link, useLocation} from 'wouter';
import { cn  } from '@/shadcn/utils';
import { IIIFIcon } from '@/components/iiif-icon';

interface NavItemProps {
  
  href: string;

  children: ReactNode;

}

const NavItem = (props: NavItemProps) => {

  const [location] = useLocation();

  return (
    <Link 
      href={props.href}
      className={cn(
        'px-2.5 h-12 flex items-center border-b-4 border-transparent text-sm',
        location === props.href ? 'border-b-primary' : 'text-muted-foreground/80'
      )}>{props.children}</Link>
  )

}

export const AppHeader = () => {

  return (
    <header className="flex justify-between items-center px-4 text-sm 
      relative z-10 shadow-[0_0_1px_rgba(0,0,0,0.5)]">
      <IIIFIcon 
        color 
        className="size-8 mb-0.5" />

      <nav className="flex items-center gap-3 pt-0.5">
        <NavItem href="/sources">1. Select Sources</NavItem>
        <NavItem href="/reconstruction">2. Compose</NavItem>
        <NavItem href="/preview">3. Preview and Export</NavItem>
      </nav>

      <div className="text-muted-foreground/80 flex gap-4 items-center">
        <div className="cursor-pointer hover:underline hover:text-primary">Help</div>
        <div className="cursor-pointer hover:underline hover:text-primary">About</div>
      </div>
    </header>
  )

}