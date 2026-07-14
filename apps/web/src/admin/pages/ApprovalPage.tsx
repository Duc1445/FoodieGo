import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Badge } from '@foodiego/ui';
import { Check, X, Store, Eye, Car } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLoading } from '../components/AdminLoading';
import { AdminAPI, ADMIN_QUERY_KEY } from '../../shared/services/admin.api';

export function ApprovalPage() {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'merchant' | 'driver'>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-pending-users', roleFilter],
    queryFn: () => AdminAPI.getPendingUsers(roleFilter === 'all' ? undefined : roleFilter),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => AdminAPI.approveUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-users'] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'stats'] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'users'] });
      toast.success('User approved successfully');
    },
    onError: (err: any) => toast.error(err.message)
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => AdminAPI.rejectUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-users'] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'stats'] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'users'] });
      toast.success('User rejected');
      setRejectingId(null);
      setReason('');
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleRejectSubmit = (id: string) => {
    if (reason.trim().length === 0) {
      toast.error('Rejection reason is required');
      return;
    }
    rejectMut.mutate({ id, reason });
  };

  if (isLoading) return <AdminLoading text="Loading pending approvals..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Pending Approvals</h2>
        <div className="flex bg-white rounded-lg shadow-sm border overflow-hidden">
          <button 
            className={`px-4 py-2 text-sm font-medium ${roleFilter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => setRoleFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-l ${roleFilter === 'merchant' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => setRoleFilter('merchant')}
          >
            Merchants
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-l ${roleFilter === 'driver' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => setRoleFilter('driver')}
          >
            Drivers
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No pending applications.
                </td>
              </tr>
            )}
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.role === 'merchant' ? <Store className="h-5 w-5 text-slate-500" /> : <Car className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="secondary" className={user.role === 'merchant' ? 'bg-orange-100 text-orange-800' : 'bg-cyan-100 text-cyan-800'}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.phone || 'N/A'}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{user.address || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mr-2">
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{user.role === 'merchant' ? 'Merchant' : 'Driver'} Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-3 gap-4 border-b pb-4">
                          <div className="font-medium text-gray-500">Full Name</div>
                          <div className="col-span-2">{user.full_name}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-b pb-4">
                          <div className="font-medium text-gray-500">Email</div>
                          <div className="col-span-2">{user.email}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-b pb-4">
                          <div className="font-medium text-gray-500">Phone</div>
                          <div className="col-span-2">{user.phone || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-b pb-4">
                          <div className="font-medium text-gray-500">Address</div>
                          <div className="col-span-2">{user.address || 'N/A'}</div>
                        </div>
                        
                        {user.role === 'merchant' && (
                          <>
                            <div className="grid grid-cols-3 gap-4 border-b pb-4">
                              <div className="font-medium text-gray-500">Business Name</div>
                              <div className="col-span-2">{user.business_name || 'N/A'}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-b pb-4">
                              <div className="font-medium text-gray-500">Business License</div>
                              <div className="col-span-2">{user.business_license || 'N/A'}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-b pb-4">
                              <div className="font-medium text-gray-500">Tax Code</div>
                              <div className="col-span-2">{user.tax_code || 'N/A'}</div>
                            </div>
                          </>
                        )}

                        {user.role === 'driver' && (
                          <>
                            <div className="grid grid-cols-3 gap-4 border-b pb-4">
                              <div className="font-medium text-gray-500">Identity Card</div>
                              <div className="col-span-2">{user.identity_card || 'N/A'}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-b pb-4">
                              <div className="font-medium text-gray-500">Driver License</div>
                              <div className="col-span-2">{user.driver_license || 'N/A'}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-b pb-4">
                              <div className="font-medium text-gray-500">Vehicle Type</div>
                              <div className="col-span-2">{user.vehicle_type || 'N/A'}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-b pb-4">
                              <div className="font-medium text-gray-500">Vehicle Plate</div>
                              <div className="col-span-2 uppercase">{user.vehicle_plate || 'N/A'}</div>
                            </div>
                          </>
                        )}

                        <div className="grid grid-cols-3 gap-4 pb-4">
                          <div className="font-medium text-gray-500">Applied On</div>
                          <div className="col-span-2">{new Date(user.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {rejectingId === user.id ? (
                    <div className="flex flex-col items-end gap-2 inline-flex align-middle ml-2">
                      <Input 
                        placeholder="Reason for rejection..." 
                        value={reason} 
                        onChange={e => setReason(e.target.value)}
                        className="w-48"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectSubmit(user.id)} disabled={rejectMut.isPending}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => approveMut.mutate(user.id)} disabled={approveMut.isPending}>
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2" onClick={() => setRejectingId(user.id)}>
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
