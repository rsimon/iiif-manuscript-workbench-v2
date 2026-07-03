import { AppHeader } from '@/layout/app-header';
import { TooltipProvider } from '@/shadcn/tooltip';

export const App = () => {

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full flex-col bg-muted">
        <AppHeader />
      </div>
    </TooltipProvider>
  )

}