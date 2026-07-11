import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './shared/providers/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Skeleton } from '@foodiego/ui';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { RoleGuard } from './shared/components/RoleGuard';
import { ProtectedRoute } from './shared/components/ProtectedRoute';

const CustomerLayout = lazy(() => import('./customer/layouts/CustomerLayout').then(module => ({ default: module.CustomerLayout })));
const AuthLayout = lazy(() => import('./customer/layouts/AuthLayout').then(module => ({ default: module.AuthLayout })));
const MerchantLayout = lazy(() => import('./merchant/layouts/MerchantLayout').then(module => ({ default: module.MerchantLayout })));
const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout').then(module => ({ default: module.AdminLayout })));

const LandingPage = lazy(() => import('./customer/pages/LandingPage').then(module => ({ default: module.LandingPage })));
const SearchPage = lazy(() => import('./customer/pages/SearchPage').then(module => ({ default: module.SearchPage })));
const RestaurantDetailPage = lazy(() => import('./customer/pages/RestaurantDetailPage').then(module => ({ default: module.RestaurantDetailPage })));
const FoodDetailPage = lazy(() => import('./customer/pages/FoodDetailPage').then(module => ({ default: module.FoodDetailPage })));
const CartPage = lazy(() => import('./customer/pages/CartPage').then(module => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./customer/pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('./customer/pages/OrderSuccessPage').then(module => ({ default: module.OrderSuccessPage })));
const MyOrdersPage = lazy(() => import('./customer/pages/MyOrdersPage').then(module => ({ default: module.MyOrdersPage })));
const OrderDetailPage = lazy(() => import('./customer/pages/OrderDetailPage').then(module => ({ default: module.OrderDetailPage })));
const ProfilePage = lazy(() => import('./customer/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const CustomerLogin = lazy(() => import('./customer/pages/auth/Login').then(module => ({ default: module.Login })));
const CustomerRegister = lazy(() => import('./customer/pages/auth/Register').then(module => ({ default: module.Register })));

const MerchantDashboardPage = lazy(() => import('./merchant/pages/MerchantDashboardPage').then(module => ({ default: module.MerchantDashboardPage })));
const MerchantMenuPage = lazy(() => import('./merchant/pages/MerchantMenuPage').then(module => ({ default: module.MerchantMenuPage })));
const MerchantLogin = lazy(() => import('./merchant/pages/auth/Login').then(module => ({ default: module.Login })));
const MerchantRegister = lazy(() => import('./merchant/pages/auth/Register').then(module => ({ default: module.Register })));

const AdminDashboardPage = lazy(() => import('./admin/pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));
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

const UnauthorizedPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <h1 className="text-4xl font-bold text-red-500">403</h1>
    <p className="text-lg text-muted-foreground">You are not authorized to access this page.</p>
    <a href="/" className="text-primary underline">Go to Home</a>
  </div>
);

const router = createBrowserRouter([
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  {
    path: '/',
    element: <Suspense fallback={<PageLoader />}><CustomerLayout /></Suspense>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><LandingPage /></Suspense> },
      { path: 'search', element: <Suspense fallback={<PageLoader />}><SearchPage /></Suspense> },
      { path: 'restaurant/:id', element: <Suspense fallback={<PageLoader />}><RestaurantDetailPage /></Suspense> },
      { path: 'food/:id', element: <Suspense fallback={<PageLoader />}><FoodDetailPage /></Suspense> },
      { path: 'cart', element: <ProtectedRoute allowedRoles={['customer']}><Suspense fallback={<PageLoader />}><CartPage /></Suspense></ProtectedRoute> },
      { path: 'checkout', element: <ProtectedRoute allowedRoles={['customer']}><Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense></ProtectedRoute> },
      { path: 'order/:orderId', element: <ProtectedRoute allowedRoles={['customer']}><Suspense fallback={<PageLoader />}><OrderSuccessPage /></Suspense></ProtectedRoute> },
      { path: 'orders', element: <ProtectedRoute allowedRoles={['customer']}><Suspense fallback={<PageLoader />}><MyOrdersPage /></Suspense></ProtectedRoute> },
      { path: 'orders/:id', element: <ProtectedRoute allowedRoles={['customer']}><Suspense fallback={<PageLoader />}><OrderDetailPage /></Suspense></ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute allowedRoles={['customer']}><Suspense fallback={<PageLoader />}><ProfilePage /></Suspense></ProtectedRoute> },
    ],
  },
  {
    path: '/login',
    element: <Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>,
    children: [{ index: true, element: <Suspense fallback={<PageLoader />}><CustomerLogin /></Suspense> }],
  },
  {
    path: '/register',
    element: <Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>,
    children: [{ index: true, element: <Suspense fallback={<PageLoader />}><CustomerRegister /></Suspense> }],
  },
  {
    path: '/merchant',
    element: <RoleGuard role="merchant"><Suspense fallback={<PageLoader />}><MerchantLayout /></Suspense></RoleGuard>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><MerchantDashboardPage /></Suspense> },
      { path: 'menu', element: <Suspense fallback={<PageLoader />}><MerchantMenuPage /></Suspense> },
    ],
  },
  {
    path: '/merchant/login',
    element: <Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>,
    children: [{ index: true, element: <Suspense fallback={<PageLoader />}><MerchantLogin /></Suspense> }],
  },
  {
    path: '/merchant/register',
    element: <Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>,
    children: [{ index: true, element: <Suspense fallback={<PageLoader />}><MerchantRegister /></Suspense> }],
  },
  {
    path: '/admin',
    element: <RoleGuard role="admin"><Suspense fallback={<PageLoader />}><AdminLayout /></Suspense></RoleGuard>,
    errorElement: <ErrorBoundary />,
    children: [{ index: true, element: <Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense> }],
  },
  {
    path: '/admin/login',
    element: <Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>,
    children: [{ index: true, element: <Suspense fallback={<PageLoader />}><AdminLogin /></Suspense> }],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
