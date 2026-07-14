import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPI, ADMIN_QUERY_KEY, type User } from '../../shared/services/admin.api';
import { Button } from '@foodiego/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@foodiego/ui';
import { Shield, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLoading } from './AdminLoading';
export function UserManager() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<string>('');

  const { data: users, isLoading } = useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'users', roleFilter],
    queryFn: () => AdminAPI.getAllUsers(roleFilter ? { role: roleFilter } : undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => AdminAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'users'] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'stats'] });
      toast.success('User deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });



  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId);
    }
  };



  if (isLoading) {
    return <AdminLoading text="Loading users..." />;
  }

  const filteredUsers = users || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage user accounts and roles</CardDescription>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-input bg-background rounded-lg text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="customer">Customers</option>
              <option value="merchant">Merchants</option>
              <option value="driver">Drivers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No users found</div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onDelete={() => handleDelete(user.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface UserCardProps {
  user: User;
  onDelete: () => void;
}

function UserCard({ user, onDelete }: UserCardProps) {
  const roleColors = {
    customer: 'bg-blue-100 text-blue-800',
    merchant: 'bg-purple-100 text-purple-800',
    driver: 'bg-green-100 text-green-800',
    admin: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium">{user.full_name || user.email}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
            {user.role}
          </span>
          {user.approval_status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              user.approval_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {user.approval_status}
            </span>
          )}
        </div>
        {user.rejection_reason && (
          <p className="text-sm text-red-600 mt-1">Reason: {user.rejection_reason}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Joined: {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Ban className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
