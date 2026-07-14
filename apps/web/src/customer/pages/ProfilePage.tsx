import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Card, Input, Skeleton } from '@foodiego/ui';
import { AlertCircle, Loader2, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { AuthAPI } from '../../shared/services/auth.api';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const user = useAuthStore((state) => state.getUser('customer'));
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout('customer');
    navigate('/login');
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await AuthAPI.getProfile();
      setFormData(prev => ({
        ...prev,
        fullName: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
      }));
      return data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      return AuthAPI.updateProfile({
        full_name: formData.fullName,
        phone: formData.phone,
      });
    },
    onSuccess: () => {
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update profile');
    },
  });


  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {error && (
        <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex gap-3 p-4 rounded-lg bg-green-50 border border-green-200 mb-6">
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      <Card className="p-8 mb-6">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile?.full_name || user?.name}</h2>
            <p className="text-muted-foreground">{profile?.email || user?.email}</p>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Your full name"
                disabled={updateProfileMutation.isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Your phone number"
                disabled={updateProfileMutation.isPending}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => updateProfileMutation.mutate()}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={updateProfileMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="font-medium">{formData.fullName || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{formData.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
              <p className="font-medium">{formData.phone || 'Not provided'}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              Edit Profile
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-8 mb-6">
        <h2 className="text-xl font-bold mb-6">Delivery Addresses</h2>
        <AddressList />
      </Card>

      <Button
        variant="destructive"
        onClick={handleLogout}
        className="w-full gap-2"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
}

function AddressList() {
  const user = useAuthStore((state) => state.getUser('customer'));
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({ address: '', phone: '' });
  
  const { data: addresses = [], refetch } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: () => AuthAPI.getAddresses(user!.id),
    enabled: !!user?.id,
  });

  const addMutation = useMutation({
    mutationFn: () => AuthAPI.addAddress(user!.id, newAddress),
    onSuccess: () => {
      setIsAdding(false);
      setNewAddress({ address: '', phone: '' });
      refetch();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (addressId: string) => AuthAPI.deleteAddress(user!.id, addressId),
    onSuccess: () => refetch()
  });

  return (
    <div>
      {addresses.length === 0 ? (
        <p className="text-muted-foreground text-sm mb-4">No addresses saved yet.</p>
      ) : (
        <div className="space-y-4 mb-6">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="p-4 border rounded-lg flex justify-between items-start">
              <div>
                <p className="font-medium">{addr.address}</p>
                <p className="text-sm text-muted-foreground">{addr.phone}</p>
                {addr.isDefault && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded mt-2 inline-block">Default</span>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(addr.id)} disabled={deleteMutation.isPending}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {isAdding ? (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <Input placeholder="Full Address" value={newAddress.address} onChange={(e) => setNewAddress({...newAddress, address: e.target.value})} />
          <Input placeholder="Phone Number" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} />
          <div className="flex gap-2">
            <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !newAddress.address}>Save Address</Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setIsAdding(true)}>+ Add New Address</Button>
      )}
    </div>
  );
}
