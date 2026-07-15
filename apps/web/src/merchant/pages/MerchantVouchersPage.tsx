import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@foodiego/ui';
import { Plus, Trash2, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { PromotionAPI, PROMOTIONS_QUERY_KEY, type CreatePromotionDto, type Promotion } from '../../shared/services/promotion.api';
import { formatVnd } from '../../shared/constants/pricing';

export function MerchantVouchersPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<CreatePromotionDto>({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: 50000,
    usage_limit: 100,
    is_active: false,
  });

  const { data: vouchers, isLoading } = useQuery({
    queryKey: [...PROMOTIONS_QUERY_KEY, 'merchant'],
    queryFn: () => PromotionAPI.getMerchantVouchers(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePromotionDto) => PromotionAPI.createMerchantVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROMOTIONS_QUERY_KEY, 'merchant'] });
      toast.success('Voucher submitted for admin approval');
      setIsFormOpen(false);
      setFormData({ code: '', discount_type: 'percentage', discount_value: 10, min_order_value: 50000, usage_limit: 100, is_active: false });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create voucher'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => PromotionAPI.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROMOTIONS_QUERY_KEY, 'merchant'] });
      toast.success('Voucher deleted');
    },
    onError: () => toast.error('Failed to delete voucher'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const statusBadge = (voucher: Promotion) => {
    if (voucher.approval_status === 'APPROVED') return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    if (voucher.approval_status === 'REJECTED') return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vouchers</h1>
          <p className="text-muted-foreground">Create vouchers for your restaurant. Admin approval is required before activation.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Voucher
        </Button>
      </div>

      {isLoading ? (
        <p>Loading vouchers...</p>
      ) : !vouchers?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No vouchers yet. Create one to offer discounts to customers.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {vouchers.map((voucher) => (
            <Card key={voucher.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{voucher.code}</CardTitle>
                {statusBadge(voucher)}
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {voucher.discount_type === 'percentage'
                      ? `${voucher.discount_value}% off`
                      : `${formatVnd(voucher.discount_value)} off`}
                    {voucher.min_order_value ? ` · Min ${formatVnd(voucher.min_order_value)}` : ''}
                    {voucher.rejection_reason && (
                      <p className="text-red-600 mt-1">Reason: {voucher.rejection_reason}</p>
                    )}
                  </div>
                  {voucher.approval_status !== 'APPROVED' && (
                    <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(voucher.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create Voucher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Code</label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
              </div>
              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount (VND)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Discount Value</label>
                <Input type="number" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="text-sm font-medium">Minimum Order (VND)</label>
                <Input type="number" value={formData.min_order_value} onChange={(e) => setFormData({ ...formData, min_order_value: Number(e.target.value) })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
