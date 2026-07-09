import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">FoodieGo</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
