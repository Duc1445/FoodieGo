import { Outlet } from 'react-router-dom';

export function MerchantLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 hidden md:block">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-bold text-lg">Restaurant Portal</span>
        </div>
        <div className="p-4">
          {/* Sidebar Navigation */}
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
          <span className="font-semibold">Dashboard</span>
        </header>
        <main className="flex-1 p-6 bg-zinc-50 dark:bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
