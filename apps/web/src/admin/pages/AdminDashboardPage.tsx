export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold mb-2 text-slate-800">System Overview</h2>
        <p className="text-slate-500">Welcome to the Admin Portal. Here you can monitor system activity and manage users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Placeholder cards */}
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
    </div>
  );
}
