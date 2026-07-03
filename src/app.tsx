import { Route, Switch } from 'wouter';
import { AppHeader } from '@/layout/app-header';
import { TooltipProvider } from '@/shadcn/tooltip';
import { Sources } from './pages/sources';
import { Reconstruction } from './pages/reconstruction';
import { Preview } from './pages/preview';

export const App = () => {

  return (
    <TooltipProvider>
      <header>
        <AppHeader />
      </header>

      <main>
        <Switch>
          <Route path="sources" component={Sources} />
          <Route path="reconstruction" component={Reconstruction} />
          <Route path="preview" component={Preview} />
        </Switch>
      </main>
    </TooltipProvider>
  )

}