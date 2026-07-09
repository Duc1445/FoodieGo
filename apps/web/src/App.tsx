import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ThemeProvider } from './providers/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { lazy, Suspense } from 'react';
import { Skeleton } from '@foodiego/ui';

const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(module => ({ default: module.SearchPage })));
const RestaurantDetailPage = lazy(() => import('./pages/RestaurantDetailPage').then(module => ({ default: module.RestaurantDetailPage })));
const FoodDetailPage = lazy(() => import('./pages/FoodDetailPage').then(module => ({ default: module.FoodDetailPage })));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex justify-center items-center h-[50vh]">
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

import { ErrorBoundary } from './components/ErrorBoundary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><LandingPage /></Suspense> },
      { path: 'search', element: <Suspense fallback={<PageLoader />}><SearchPage /></Suspense> },
      { path: 'restaurant/:id', element: <Suspense fallback={<PageLoader />}><RestaurantDetailPage /></Suspense> },
      { path: 'food/:id', element: <Suspense fallback={<PageLoader />}><FoodDetailPage /></Suspense> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <div>Admin Dashboard (To be implemented)</div> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <div>Login Form (To be implemented)</div> },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
