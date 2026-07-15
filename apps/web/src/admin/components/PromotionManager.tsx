import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PromotionAPI, PROMOTIONS_QUERY_KEY, type Promotion, type CreatePromotionDto } from '../../shared/services/promotion.api';
import { Button } from '@foodiego/ui';
import { Input } from '@foodiego/ui';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@foodiego/ui';
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLoading } from './AdminLoading';
import { formatVnd } from '../../shared/constants/pricing';

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
    return <AdminLoading text="Loading promotions..." />;
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
          <span className="font-bold text-lg text-emerald-600">
            {promotion.discount_type === 'percentage' 
              ? `${promotion.discount_value}% OFF` 
              : `${formatVnd(promotion.discount_value)} OFF`}
          </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={promotion.is_active ? 'default' : 'secondary'} className={promotion.is_active ? 'bg-emerald-100 text-emerald-800' : ''}>
            {promotion.is_active ? 'Active' : 'Inactive'}
          </Badge>
          </div>
          {promotion.min_order_value && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min Order</span>
              <span>{formatVnd(promotion.min_order_value)}</span>
            </div>
          )}
          {promotion.max_discount_value && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Discount</span>
              <span>{formatVnd(promotion.max_discount_value)}</span>
            </div>
          )}
          {promotion.usage_limit && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usage</span>
              <span>{promotion.usage_count}/{promotion.usage_limit}</span>
            </div>
          )}
          {promotion.valid_from && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid From</span>
              <span>{new Date(promotion.valid_from).toLocaleDateString()}</span>
            </div>
          )}
          {promotion.valid_until && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid Until</span>
              <span>{new Date(promotion.valid_until).toLocaleDateString()}</span>
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
      discount_type: 'percentage',
      discount_value: 0,
      min_order_value: 0,
      max_discount_value: undefined,
      usage_limit: undefined,
      valid_from: undefined,
      valid_until: undefined,
      is_active: true,
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
                className="bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-white dark:border-slate-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Discount Type</label>
              <select
                className="w-full p-2 border rounded-md bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-white dark:border-slate-700"
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Discount Value</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                className="bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-white dark:border-slate-700"
                required
              />
            </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Min Order Value</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.min_order_value || ''}
                className="bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-white dark:border-slate-700"
                onChange={(e) => setFormData({ ...formData, min_order_value: parseFloat(e.target.value) || undefined })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Discount Value</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.max_discount_value || ''}
                className="bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-white dark:border-slate-700"
                onChange={(e) => setFormData({ ...formData, max_discount_value: parseFloat(e.target.value) || undefined })}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Usage Limit (Optional)</label>
            <Input
              type="number"
              min="1"
              value={formData.usage_limit || ''}
              className="bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-white dark:border-slate-700"
              onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || undefined })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Valid From</label>
              <Input
                type="datetime-local"
                value={formData.valid_from ? new Date(formData.valid_from).toISOString().slice(0, 16) : ''}
                className="bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-white dark:border-slate-700 [color-scheme:light] dark:[color-scheme:dark]"
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valid Until</label>
              <Input
                type="datetime-local"
                value={formData.valid_until ? new Date(formData.valid_until).toISOString().slice(0, 16) : ''}
                className="bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-white dark:border-slate-700 [color-scheme:light] dark:[color-scheme:dark]"
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active
            </label>
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
