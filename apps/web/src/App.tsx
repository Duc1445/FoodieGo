import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './shared/providers/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Skeleton } from '@foodiego/ui';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { RoleGuard } from './shared/components/RoleGuard';

// Layouts
const CustomerLayout = lazy(() => import('./customer/layouts/CustomerLayout').then(module => ({ default: module.CustomerLayout })));
const AuthLayout = lazy(() => import('./customer/layouts/AuthLayout').then(module => ({ default: module.AuthLayout })));
const MerchantLayout = lazy(() => import('./merchant/layouts/MerchantLayout').then(module => ({ default: module.MerchantLayout })));

// Customer Pages
const LandingPage = lazy(() => import('./customer/pages/LandingPage').then(module => ({ default: module.LandingPage })));
const SearchPage = lazy(() => import('./customer/pages/SearchPage').then(module => ({ default: module.SearchPage })));
const RestaurantDetailPage = lazy(() => import('./customer/pages/RestaurantDetailPage').then(module => ({ default: module.RestaurantDetailPage })));
const FoodDetailPage = lazy(() => import('./customer/pages/FoodDetailPage').then(module => ({ default: module.FoodDetailPage })));
const CartPage = lazy(() => import('./customer/pages/CartPage').then(module => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./customer/pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('./customer/pages/OrderSuccessPage').then(module => ({ default: module.OrderSuccessPage })));
const MyOrdersPage = lazy(() => import('./customer/pages/MyOrdersPage').then(module => ({ default: module.MyOrdersPage })));
const ProfilePage = lazy(() => import('./customer/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const CustomerLogin = lazy(() => import('./customer/pages/auth/Login').then(module => ({ default: module.Login })));
const CustomerRegister = lazy(() => import('./customer/pages/auth/Register').then(module => ({ default: module.Register })));

// Merchant Pages
const MerchantDashboardPage = lazy(() => import('./merchant/pages/MerchantDashboardPage').then(module => ({ default: module.MerchantDashboardPage })));
const MerchantLogin = lazy(() => import('./merchant/pages/auth/Login').then(module => ({ default: module.Login })));
const MerchantRegister = lazy(() => import('./merchant/pages/auth/Register').then(module => ({ default: module.Register })));

// Admin Pages
const AdminLogin = lazy(() => import('./admin/pages/auth/Login').then(module => ({ default: module.Login })));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex justify-center items-center h-[50vh]">
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

const router = createBrowserRouter([
  // Customer Portal
  {
    path: '/',
    element: <Suspense fallback={<PageLoader />}><CustomerLayout /></Suspense>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><LandingPage /></Suspense> },
      { path: 'search', element: <Suspense fallback={<PageLoader />}><SearchPage /></Suspense> },
      { path: 'restaurant/:id', element: <Suspense fallback={<PageLoader />}><RestaurantDetailPage /></Suspense> },
      { path: 'food/:id', element: <Suspense fallback={<PageLoader />}><FoodDetailPage /></Suspense> },
      { path: 'cart', element: <RoleGuard role="customer"><Suspense fallback={<PageLoader />}><CartPage /></Suspense></RoleGuard> },
      { path: 'checkout', element: <RoleGuard role="customer"><Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense></RoleGuard> },
      { path: 'order/:orderId', element: <RoleGuard role="customer"><Suspense fallback={<PageLoader />}><OrderSuccessPage /></Suspense></RoleGuard> },
      { path: 'my-orders', element: <RoleGuard role="customer"><Suspense fallback={<PageLoader />}><MyOrdersPage /></Suspense></RoleGuard> },
      { path: 'profile', element: <RoleGuard role="customer"><Suspense fallback={<PageLoader />}><ProfilePage /></Suspense></RoleGuard> },
    ],
  },
  {
    path: '/',
    element: <Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>,
    children: [
      { path: 'login', element: <Suspense fallback={<PageLoader />}><CustomerLogin /></Suspense> },
      { path: 'register', element: <Suspense fallback={<PageLoader />}><CustomerRegister /></Suspense> },
    ],
  },
  
  // Merchant Portal
  {
    path: '/merchant',
    element: <RoleGuard role="merchant"><Suspense fallback={<PageLoader />}><MerchantLayout /></Suspense></RoleGuard>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><MerchantDashboardPage /></Suspense> },
    ],
  },
  {
    path: '/merchant',
    element: <Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>,
    children: [
      { path: 'login', element: <Suspense fallback={<PageLoader />}><MerchantLogin /></Suspense> },
      { path: 'register', element: <Suspense fallback={<PageLoader />}><MerchantRegister /></Suspense> },
    ],
  },

  // Admin Portal (Skeleton)
  {
    path: '/admin',
    element: <RoleGuard role="admin"><Suspense fallback={<PageLoader />}><div className="min-h-screen flex items-center justify-center">Admin Portal Content</div></Suspense></RoleGuard>,
  },
  {
    path: '/admin',
    element: <Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>,
    children: [
      { path: 'login', element: <Suspense fallback={<PageLoader />}><AdminLogin /></Suspense> },
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
