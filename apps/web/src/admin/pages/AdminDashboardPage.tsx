import { useState } from 'react';
import { PromotionManager } from '../components/PromotionManager';
import { UserManager } from '../components/UserManager';
import { RestaurantManager } from '../components/RestaurantManager';
import { OrderManager } from '../components/OrderManager';

type TabType = 'overview' | 'users' | 'restaurants' | 'orders' | 'promotions';

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'users' as TabType, label: 'Users' },
    { id: 'restaurants' as TabType, label: 'Restaurants' },
    { id: 'orders' as TabType, label: 'Orders' },
    { id: 'promotions' as TabType, label: 'Promotions' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold mb-2 text-slate-800">System Overview</h2>
        <p className="text-slate-500">Welcome to the Admin Portal. Here you can monitor system activity and manage users.</p>
      </div>

      <div className="border-b">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500 mb-4">Total Users</h3>
            <div className="h-16 bg-slate-100 rounded-md animate-pulse"></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500 mb-4">Total Restaurants</h3>
            <div className="h-16 bg-slate-100 rounded-md animate-pulse"></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500 mb-4">System Alerts</h3>
            <div className="h-16 bg-slate-100 rounded-md animate-pulse"></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500 mb-4">Active Orders</h3>
            <div className="h-16 bg-slate-100 rounded-md animate-pulse"></div>
          </div>
        </div>
      )}

      {activeTab === 'users' && <UserManager />}
      {activeTab === 'restaurants' && <RestaurantManager />}
      {activeTab === 'orders' && <OrderManager />}
      {activeTab === 'promotions' && <PromotionManager />}
    </div>
  );
}
