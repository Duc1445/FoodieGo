import { useState, useEffect } from 'react';
import { Input } from '@foodiego/ui';
import { MapPin, Phone } from 'lucide-react';

interface AddressFormProps {
  onChange: (address: string, phone: string) => void;
}

export function AddressForm({ onChange }: AddressFormProps) {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Report changes to parent whenever they update
  useEffect(() => {
    onChange(address, phone);
  }, [address, phone, onChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Delivery Address *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone Number *</label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
