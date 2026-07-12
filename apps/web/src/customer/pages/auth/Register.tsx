import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthAPI } from '../../../shared/services/auth.api';
import { Button } from '@foodiego/ui';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await AuthAPI.register({ email, password, full_name: fullName || 'Customer', role: 'customer' });
      toast.success('Registration successful! Please log in.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 space-y-4 border rounded-xl shadow-sm bg-card">
        <h2 className="text-2xl font-bold text-center">Customer Register</h2>
        
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
              value={fullName} 
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
            <label className="block text-sm font-medium">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-2 mt-1 border rounded text-black bg-white" 
              required 
              disabled={isLoading}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className="w-full p-2 mt-1 border rounded text-black bg-white" 
              required 
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
