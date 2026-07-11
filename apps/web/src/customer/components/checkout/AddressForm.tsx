import { useState, useRef } from 'react';
import { Input } from '@foodiego/ui';
import { MapPin, Phone } from 'lucide-react';

interface AddressFormProps {
  onChange: (address: string, phone: string) => void;
}

export function AddressForm({ onChange }: AddressFormProps) {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const addressRef = useRef('');
  const phoneRef = useRef('');

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
            onChange={(e) => {
              const val = e.target.value;
              setAddress(val);
              addressRef.current = val;
              onChange(val, phoneRef.current);
            }}
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
            onChange={(e) => {
              const val = e.target.value;
              setPhone(val);
              phoneRef.current = val;
              onChange(addressRef.current, val);
            }}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
