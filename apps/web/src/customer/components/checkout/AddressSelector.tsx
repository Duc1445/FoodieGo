import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { AuthAPI } from '../../../shared/services/auth.api';
import { AddressForm } from './AddressForm';

interface AddressSelectorProps {
  selectedId: string | null;
  onSelect: (addressId: string) => void;
  onAddressData: (address: string, phone: string) => void;
}

export function AddressSelector({ selectedId, onSelect, onAddressData }: AddressSelectorProps) {
  const { user } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: () => AuthAPI.getAddresses(user!.id),
    enabled: !!user?.id,
  });

  if (isLoading) return <div>Loading addresses...</div>;

  if (addresses.length === 0 || isAdding) {
    return (
      <div className="space-y-4">
        {addresses.length > 0 && (
          <button 
            type="button" 
            onClick={() => setIsAdding(false)}
            className="text-primary text-sm font-medium hover:underline"
          >
            &larr; Back to saved addresses
          </button>
        )}
        <AddressForm 
          onChange={(addr, phone) => {
            onAddressData(addr, phone);
            onSelect(''); // Clear selected ID since this is a manual entry
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {addresses.map((addr) => (
          <label 
            key={addr.id} 
            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedId === addr.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
          >
            <input
              type="radio"
              name="address"
              value={addr.id}
              checked={selectedId === addr.id}
              onChange={() => {
                onSelect(addr.id);
                onAddressData(addr.address, addr.phone);
              }}
              className="mt-1 w-4 h-4 text-primary"
            />
            <div>
              <p className="font-medium text-sm">{addr.address}</p>
              <p className="text-sm text-muted-foreground">{addr.phone}</p>
              {addr.isDefault && (
                <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">
                  Default
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
      
      <button 
        type="button" 
        onClick={() => {
          setIsAdding(true);
          onSelect('');
          onAddressData('', '');
        }}
        className="w-full py-3 border border-dashed rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
      >
        + Use a different address
      </button>
    </div>
  );
}
