
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { Button } from '@foodiego/ui';
import { Store, Utensils, ClipboardList, Settings, LogOut } from 'lucide-react';

import { useQueryClient } from '@tanstack/react-query';

export function MerchantLayout() {
  const user = useAuthStore((state) => state.getUser('merchant'));
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    logout('merchant');
    navigate('/merchant/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Store className="w-6 h-6 text-primary mr-2" />
          <span className="text-lg font-bold text-primary">Merchant Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/merchant" className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary">
            <Store className="w-4 h-4 mr-3" /> Dashboard
          </Link>
          <Link to="/merchant/menu" className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
            <Utensils className="w-4 h-4 mr-3" /> Menu
          </Link>
          <Link to="/merchant/orders" className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
            <ClipboardList className="w-4 h-4 mr-3" /> Orders
          </Link>
          <Link to="/merchant/settings" className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
            <Settings className="w-4 h-4 mr-3" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">{user?.full_name || user?.name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-zinc-50 dark:bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
