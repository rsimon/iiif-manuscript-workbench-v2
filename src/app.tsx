import { Route, Router, Redirect } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { AppHeader } from '@/layout/app-header';
import { Splash } from '@/layout/splash';
import { TooltipProvider } from '@/shadcn/tooltip';
import { Sources } from '@/pages/sources';
import { Reconstruction } from '@/pages/reconstruction';
import { Preview } from '@/pages/preview';

export const App = () => {

  return (
    <TooltipProvider>
      <Router hook={useHashLocation}>
        <div className="flex flex-col h-screen overflow-hidden">
          <AppHeader />

          <Route path="/" component={() => <Redirect to="/sources" replace />} />

          <Route path="/sources" component={Sources} />
          <Route path="/reconstruction" component={Reconstruction} />
          <Route path="/preview" component={Preview} />
        </div>
      </Router>

      <Splash />
    </TooltipProvider>
  )

}