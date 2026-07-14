import { Card, CardHeader, CardTitle, CardContent } from '@foodiego/ui';

export function MerchantDashboardPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-white text-black">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold tracking-tight">Merchant Dashboard</h1>
        <p className="text-muted-foreground mt-2">View your analytics and performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0.00</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Active Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
