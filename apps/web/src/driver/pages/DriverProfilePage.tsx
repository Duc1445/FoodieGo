import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthAPI } from '../../shared/services/auth.api';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton, Badge } from '@foodiego/ui';
import { toast } from 'sonner';
import { Settings, Save } from 'lucide-react';

export function DriverProfilePage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.getUser('driver'));

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => AuthAPI.getProfile(),
    enabled: !!user?.id,
  });

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    vehicle_plate: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        vehicle_plate: (profile as any).vehicle_plate || '',
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<any>) => AuthAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Card><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="p-2 border rounded bg-muted text-muted-foreground">
                  {profile?.email}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="p-2 border rounded bg-muted flex items-center gap-2">
                  <Badge variant={profile?.is_active ? "default" : "destructive"}>
                    {profile?.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{(profile as any)?.approval_status}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Driver License</label>
                <div className="p-2 border rounded bg-muted text-muted-foreground">
                  {(profile as any)?.driver_license || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Type</label>
                <div className="p-2 border rounded bg-muted text-muted-foreground">
                  {(profile as any)?.vehicle_type || 'Not provided'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2 border rounded bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Plate</label>
              <input
                type="text"
                value={formData.vehicle_plate}
                onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                className="w-full p-2 border rounded bg-background"
                required
              />
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
