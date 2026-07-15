import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@foodiego/ui';
import { Check, X, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { PromotionAPI, PROMOTIONS_QUERY_KEY } from '../../shared/services/promotion.api';
import { AdminLoading } from './AdminLoading';
import { formatVnd } from '../../shared/constants/pricing';

export function VoucherApprovalManager() {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const { data: vouchers, isLoading } = useQuery({
    queryKey: [...PROMOTIONS_QUERY_KEY, 'pending'],
    queryFn: () => PromotionAPI.getPendingVouchers(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => PromotionAPI.approveVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      toast.success('Voucher approved');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to approve voucher'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => PromotionAPI.rejectVoucher(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      toast.success('Voucher rejected');
      setRejectingId(null);
      setReason('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to reject voucher'),
  });

  if (isLoading) return <AdminLoading text="Loading pending vouchers..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Ticket className="w-6 h-6" /> Pending Voucher Approvals
        </h2>
        <p className="text-slate-500">Review merchant vouchers before they become active.</p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm text-card-foreground">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Restaurant</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4">Min Order</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!vouchers?.length ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No pending vouchers.</td>
              </tr>
            ) : (
              vouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{voucher.code}</td>
                  <td className="px-6 py-4 text-muted-foreground">{voucher.restaurant_name || '-'}</td>
                  <td className="px-6 py-4 text-foreground">
                    {voucher.discount_type === 'percentage'
                      ? `${voucher.discount_value}%`
                      : formatVnd(voucher.discount_value)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{voucher.min_order_value ? formatVnd(voucher.min_order_value) : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => approveMutation.mutate(voucher.id)} disabled={approveMutation.isPending}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setRejectingId(voucher.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Voucher</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Reason</label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rejection reason..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => rejectingId && rejectMutation.mutate({ id: rejectingId, reason })}
              disabled={!reason.trim() || rejectMutation.isPending}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
