import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PromotionAPI, PROMOTIONS_QUERY_KEY, type Promotion, type ValidationResult } from '../../shared/services/promotion.api';
import { Button } from '@foodiego/ui';
import { Input } from '@foodiego/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@foodiego/ui';
import { Ticket, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatVnd } from '../../shared/constants/pricing';

interface VoucherSelectorProps {
  orderValue: number;
  restaurantId?: string | null;
  onVoucherApplied: (result: ValidationResult) => void;
  appliedVoucher?: ValidationResult;
}

export function VoucherSelector({ orderValue, restaurantId, onVoucherApplied, appliedVoucher }: VoucherSelectorProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const { data: promotions, isLoading } = useQuery({
    queryKey: [PROMOTIONS_QUERY_KEY, 'active', restaurantId],
    queryFn: () => PromotionAPI.getActivePromotions(restaurantId || undefined),
    enabled: !!restaurantId,
  });

  const validateMutation = useMutation({
    mutationFn: (voucherCode: string) => PromotionAPI.validateVoucher(voucherCode, orderValue, restaurantId || undefined),
    onSuccess: (result) => {
      if (result.valid) {
        toast.success(`Voucher applied! You save ${formatVnd(result.discountAmount || 0)}`);
        onVoucherApplied(result);
        setCode('');
      } else {
        toast.error(result.reason || 'Invalid voucher');
      }
      setIsValidating(false);
    },
    onError: () => {
      toast.error('Failed to validate voucher');
      setIsValidating(false);
    },
  });

  const handleApplyVoucher = () => {
    if (!code.trim()) return;
    setIsValidating(true);
    validateMutation.mutate(code);
  };

  const handleRemoveVoucher = () => {
    onVoucherApplied({ valid: false });
    toast.info('Voucher removed');
  };

  const handleSelectPromotion = (promotion: Promotion) => {
    setCode(promotion.code);
    setIsValidating(true);
    validateMutation.mutate(promotion.code);
  };

  if (appliedVoucher?.valid) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">{appliedVoucher.promotion?.code}</p>
                <p className="text-sm text-green-700">Discount: {formatVnd(appliedVoucher.discountAmount || 0)}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemoveVoucher}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Apply Voucher
        </CardTitle>
        <CardDescription>Enter a voucher code or select from available promotions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="voucher-code" className="text-sm font-medium">Voucher Code</label>
            <Input
              id="voucher-code"
              placeholder="Enter code..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyVoucher()}
            />
          </div>
          <Button 
            onClick={handleApplyVoucher} 
            disabled={!code.trim() || isValidating}
            className="mt-6"
          >
            {isValidating ? 'Validating...' : 'Apply'}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading available promotions...</div>
        ) : promotions && promotions.length > 0 ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Available Promotions</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {promotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleSelectPromotion(promotion)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{promotion.code}</p>
                      <p className="text-sm text-muted-foreground">
                        {promotion.discount_type === 'percentage' 
                          ? `${promotion.discount_value}% off`
                          : `${formatVnd(promotion.discount_value)} off`}
                        {promotion.min_order_value && (
                          <span className="ml-2">(Min: {formatVnd(promotion.min_order_value)})</span>
                        )}
                      </p>
                    </div>
                    {promotion.usage_limit && (
                      <span className="text-xs text-muted-foreground">
                        {promotion.usage_count}/{promotion.usage_limit} used
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No active promotions available</div>
        )}
      </CardContent>
    </Card>
  );
}
