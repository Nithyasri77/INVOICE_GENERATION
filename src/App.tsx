/**
 * Purpose: App root — composes all global providers around the route tree
 * Responsibilities: Mount AuthProvider (session state), TanStack QueryClientProvider (server
 *                    state/caching), Radix TooltipProvider, and the global ToastProvider once,
 *                    above the router
 * Dependencies: react-router-dom, @tanstack/react-query, AuthContext, AppRoutes, Toast, Tooltip
 * Export: App (default)
 */
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { ToastProvider } from './components/ui/Toast';
import { TooltipProvider } from './components/ui/Tooltip';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <ToastProvider />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
