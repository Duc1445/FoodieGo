export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold mb-2">Welcome to your Dashboard</h2>
        <p className="text-muted-foreground">This is your merchant control center. You can manage your menu, view orders, and update settings here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Today's Orders</h3>
          <div className="h-16 bg-gray-100 rounded-md animate-pulse"></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Total Revenue</h3>
          <div className="h-16 bg-gray-100 rounded-md animate-pulse"></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Active Menu Items</h3>
          <div className="h-16 bg-gray-100 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
