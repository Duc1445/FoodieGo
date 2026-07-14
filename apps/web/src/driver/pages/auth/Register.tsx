import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthAPI } from '../../../shared/services/auth.api';
import { Button } from '@foodiego/ui';
import { AlertCircle, Loader2, Truck } from 'lucide-react';
import { toast } from 'sonner';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [full_name, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [driver_license, setDriverLicense] = useState('');
  const [vehicle_type, setVehicleType] = useState('');
  const [vehicle_plate, setVehiclePlate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await AuthAPI.register({ 
        email, 
        password, 
        full_name, 
        phone, 
        role: 'driver',
        driver_license,
        vehicle_type,
        vehicle_plate
      } as any);
      
      toast.success('Registration successful! Your application is now pending approval.');
      navigate('/driver/login', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 space-y-4 border rounded-xl shadow-sm bg-card">
        <div className="flex items-center justify-center mb-4">
          <Truck className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-center">Driver Registration</h2>
        
        {error && (
          <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input 
              type="text" 
              value={full_name} 
              onChange={e => setFullName(e.target.value)} 
              className="w-full p-2 mt-1 border rounded text-black bg-white" 
              required 
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-2 mt-1 border rounded text-black bg-white" 
              required 
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="w-full p-2 mt-1 border rounded text-black bg-white" 
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-2 mt-1 border rounded text-black bg-white" 
              required 
              minLength={6}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Driver License</label>
            <input 
              type="text" 
              value={driver_license} 
              onChange={e => setDriverLicense(e.target.value)} 
              className="w-full p-2 mt-1 border rounded text-black bg-white" 
              required 
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Vehicle Type</label>
            <select 
              value={vehicle_type} 
              onChange={e => setVehicleType(e.target.value)} 
              className="w-full p-2 mt-1 border rounded text-black bg-white" 
              required 
              disabled={isLoading}
            >
              <option value="">Select a vehicle type</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Bicycle">Bicycle</option>
              <option value="Car">Car</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Vehicle Plate</label>
            <input 
              type="text" 
              value={vehicle_plate} 
              onChange={e => setVehiclePlate(e.target.value)} 
              className="w-full p-2 mt-1 border rounded text-black bg-white" 
              required 
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/driver/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-muted-foreground hover:underline">
            Back to Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
