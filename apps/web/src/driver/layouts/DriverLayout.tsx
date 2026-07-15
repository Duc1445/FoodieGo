import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '../../shared/stores/useAuthStore';
import { Button } from '@foodiego/ui';
import { Truck, MapPin, ClipboardList, Settings, LogOut, History, DollarSign } from 'lucide-react';

export function DriverLayout() {
  const user = useAuthStore((state) => state.getUser('driver'));
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout('driver');
    navigate('/driver/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Truck className="w-6 h-6 text-primary mr-2" />
          <span className="text-lg font-bold text-primary">Driver Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { to: '/driver', icon: ClipboardList, label: 'Dashboard' },
            { to: '/driver/available', icon: MapPin, label: 'Available Orders' },
            { to: '/driver/active', icon: Truck, label: 'Active Deliveries' },
            { to: '/driver/history', icon: History, label: 'History' },
            { to: '/driver/earnings', icon: DollarSign, label: 'Earnings' },
            { to: '/driver/profile', icon: Settings, label: 'Profile' }
          ].map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/driver' && location.pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link 
                key={item.to}
                to={item.to} 
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-3" /> {item.label}
              </Link>
            );
          })}
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
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
