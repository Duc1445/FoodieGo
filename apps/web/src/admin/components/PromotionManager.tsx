import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PromotionAPI, PROMOTIONS_QUERY_KEY, type Promotion, type CreatePromotionDto } from '../../shared/services/promotion.api';
import { Button } from '@foodiego/ui';
import { Input } from '@foodiego/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@foodiego/ui';
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react';
import { toast } from 'sonner';

export function PromotionManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const { data: promotions, isLoading } = useQuery({
    queryKey: [PROMOTIONS_QUERY_KEY],
    queryFn: () => PromotionAPI.getAllPromotions(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePromotionDto) => PromotionAPI.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMOTIONS_QUERY_KEY] });
      toast.success('Promotion created successfully');
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to create promotion');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePromotionDto> }) =>
      PromotionAPI.updatePromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMOTIONS_QUERY_KEY] });
      toast.success('Promotion updated successfully');
      setIsDialogOpen(false);
      setEditingPromotion(null);
    },
    onError: () => {
      toast.error('Failed to update promotion');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => PromotionAPI.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMOTIONS_QUERY_KEY] });
      toast.success('Promotion deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete promotion');
    },
  });

  const handleCreate = () => {
    setEditingPromotion(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: CreatePromotionDto) => {
    if (editingPromotion) {
      updateMutation.mutate({ id: editingPromotion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading promotions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Promotion Management</h2>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      <div className="grid gap-4">
        {promotions && promotions.length > 0 ? (
          promotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              onEdit={() => handleEdit(promotion)}
              onDelete={() => handleDelete(promotion.id)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                No promotions found. Create your first promotion.
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isDialogOpen && (
        <PromotionDialog
          promotion={editingPromotion}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingPromotion(null);
          }}
        />
      )}
    </div>
  );
}

interface PromotionCardProps {
  promotion: Promotion;
  onEdit: () => void;
  onDelete: () => void;
}

function PromotionCard({ promotion, onEdit, onDelete }: PromotionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">{promotion.code}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {promotion.discountType === 'percentage'
            ? `${promotion.discountValue}% off`
            : `${promotion.discountValue.toFixed(2)} off`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className={promotion.isActive ? 'text-green-600' : 'text-red-600'}>
              {promotion.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {promotion.minOrderValue && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min Order</span>
              <span>₫{promotion.minOrderValue.toLocaleString()}</span>
            </div>
          )}
          {promotion.maxDiscountValue && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Discount</span>
              <span>₫{promotion.maxDiscountValue.toLocaleString()}</span>
            </div>
          )}
          {promotion.usageLimit && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usage</span>
              <span>{promotion.usageCount}/{promotion.usageLimit}</span>
            </div>
          )}
          {promotion.validFrom && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid From</span>
              <span>{new Date(promotion.validFrom).toLocaleDateString()}</span>
            </div>
          )}
          {promotion.validUntil && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid Until</span>
              <span>{new Date(promotion.validUntil).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface PromotionDialogProps {
  promotion?: Promotion | null;
  onSubmit: (data: CreatePromotionDto) => void;
  onClose: () => void;
}

function PromotionDialog({ promotion, onSubmit, onClose }: PromotionDialogProps) {
  const [formData, setFormData] = useState<CreatePromotionDto>(
    promotion || {
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderValue: 0,
      maxDiscountValue: undefined,
      usageLimit: undefined,
      validFrom: undefined,
      validUntil: undefined,
      isActive: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{promotion ? 'Edit Promotion' : 'Create Promotion'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Code</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SAVE10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Discount Type</label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-lg"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {formData.discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount'}
              </label>
              <Input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Order Value</label>
              <Input
                type="number"
                value={formData.minOrderValue || 0}
                onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>
            {formData.discountType === 'percentage' && (
              <div>
                <label className="block text-sm font-medium mb-2">Maximum Discount</label>
                <Input
                  type="number"
                  value={formData.maxDiscountValue || ''}
                  onChange={(e) => setFormData({ ...formData, maxDiscountValue: parseFloat(e.target.value) || undefined })}
                  min="0"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Usage Limit</label>
              <Input
                type="number"
                value={formData.usageLimit || ''}
                onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || undefined })}
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valid From</label>
              <Input
                type="datetime-local"
                value={formData.validFrom || ''}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value || undefined })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valid Until</label>
              <Input
                type="datetime-local"
                value={formData.validUntil || ''}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value || undefined })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium">Active</label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {promotion ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
