import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@foodiego/ui';
import { Input } from '@foodiego/ui';
import { Button } from '@foodiego/ui';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useLocationStore } from '../stores/useLocationStore';
import { debounce } from 'lodash-es';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export function LocationSelector() {
  const { lat, lng, address, setLocation } = useLocationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<[number, number]>([lat, lng]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [tempAddress, setTempAddress] = useState(address);
  
  // Update local state when opened
  useEffect(() => {
    if (isOpen) {
      setPosition([lat, lng]);
      setTempAddress(address);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, lat, lng, address]);

  // Debounced search for Nominatim API
  const fetchAddress = useRef(
    debounce(async (query: string) => {
      if (!query || query.length < 3) {
        setSearchResults([]);
        return;
      }
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Error fetching address:', err);
      }
    }, 500)
  ).current;

  useEffect(() => {
    fetchAddress(searchQuery);
  }, [searchQuery]);

  const handleSelectResult = (result: any) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    setPosition([newLat, newLng]);
    setTempAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleConfirm = () => {
    setLocation(position[0], position[1], tempAddress);
    setIsOpen(false);
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setPosition([newLat, newLng]);
          
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`);
            const data = await response.json();
            setTempAddress(data.display_name || 'Current Location');
          } catch (err) {
            setTempAddress('Current Location');
          }
        },
        (err) => console.error(err)
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 max-w-xs truncate">
          <MapPin size={16} className="text-primary shrink-0" />
          <span className="truncate">{address}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-background border-b z-10 relative">
          <DialogTitle>Delivery Location</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Search address (e.g. District 1, HCMC)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg mt-1 z-50 max-h-48 overflow-y-auto">
                {searchResults.map((res) => (
                  <div 
                    key={res.place_id} 
                    className="p-2 hover:bg-muted cursor-pointer text-sm"
                    onClick={() => handleSelectResult(res)}
                  >
                    {res.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Button variant="outline" onClick={useCurrentLocation} className="w-full justify-start gap-2">
            <Navigation size={16} />
            Use my current location
          </Button>

          <div className="h-[300px] rounded-md overflow-hidden border relative z-0">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-muted-foreground truncate max-w-[350px]" title={tempAddress}>
              {tempAddress}
            </div>
            <Button onClick={handleConfirm}>Confirm Location</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
