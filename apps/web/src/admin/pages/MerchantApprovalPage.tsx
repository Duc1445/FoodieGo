import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@foodiego/ui';
import { Check, X, Store } from 'lucide-react';
import { toast } from 'sonner';

interface PendingMerchant {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  created_at: string;
}

const fetchPendingMerchants = async () => {
  const token = localStorage.getItem('foodiego-auth-token');
  const res = await fetch('http://localhost:3001/api/v1/users/admin/merchants/pending', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data as PendingMerchant[];
};

const approveMerchant = async (id: string) => {
  const token = localStorage.getItem('foodiego-auth-token');
  const res = await fetch(`http://localhost:3001/api/v1/users/admin/merchants/${id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

const rejectMerchant = async ({ id, reason }: { id: string; reason: string }) => {
  const token = localStorage.getItem('foodiego-auth-token');
  const res = await fetch(`http://localhost:3001/api/v1/users/admin/merchants/${id}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export function MerchantApprovalPage() {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const { data: merchants, isLoading } = useQuery({
    queryKey: ['admin-pending-merchants'],
    queryFn: fetchPendingMerchants,
  });

  const approveMut = useMutation({
    mutationFn: approveMerchant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-merchants'] });
      toast.success('Merchant approved');
    },
    onError: (err: any) => toast.error(err.message)
  });

  const rejectMut = useMutation({
    mutationFn: rejectMerchant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-merchants'] });
      toast.success('Merchant rejected');
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

  if (isLoading) return <div className="p-8 text-gray-500">Loading pending merchants...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Pending Approvals</h2>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {merchants?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No pending merchants.
                </td>
              </tr>
            )}
            {merchants?.map((merchant) => (
              <tr key={merchant.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Store className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{merchant.full_name}</div>
                      <div className="text-sm text-gray-500">{merchant.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{merchant.phone || 'N/A'}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{merchant.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(merchant.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {rejectingId === merchant.id ? (
                    <div className="flex flex-col items-end gap-2">
                      <Input 
                        placeholder="Reason for rejection..." 
                        value={reason} 
                        onChange={e => setReason(e.target.value)}
                        className="w-64"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectSubmit(merchant.id)} disabled={rejectMut.isPending}>
                          Confirm Reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => approveMut.mutate(merchant.id)} disabled={approveMut.isPending}>
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setRejectingId(merchant.id)}>
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
