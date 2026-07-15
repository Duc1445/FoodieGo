import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { Button } from '@foodiego/ui';
import { Shield, Users, LogOut, CheckSquare, Ticket, LifeBuoy, List, BadgePercent } from 'lucide-react';

export function AdminLayout() {
  const user = useAuthStore((state) => state.getUser('admin'));
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const location = useLocation();

  const handleLogout = () => {
    logout('admin');
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', icon: Shield, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/categories', icon: List, label: 'Categories' },
    { to: '/admin/voucher-approvals', icon: BadgePercent, label: 'Voucher Approval' },
    { to: '/admin/approvals', icon: CheckSquare, label: 'Approvals' },
    { to: '/admin/promotions', icon: Ticket, label: 'Promotions' },
    { to: '/admin/support', icon: LifeBuoy, label: 'Support Tickets' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Shield className="w-6 h-6 text-red-500 mr-2" />
          <span className="text-lg font-bold text-white">System Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mr-3" /> {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Overview</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">{user?.full_name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
