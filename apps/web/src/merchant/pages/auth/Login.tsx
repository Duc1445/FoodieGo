import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { AuthAPI } from '../../../shared/services/auth.api';
import { Button } from '@foodiego/ui';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getDashboardPath } from '../../../shared/auth/session';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await AuthAPI.login({ email, password, role: 'merchant' });
      
      login({ ...data.user, role: 'merchant' }, data.token);
      toast.success('Welcome back, Merchant!');
      navigate(getDashboardPath('merchant'), { replace: true });
    } catch (err: any) {
      const data = err.response?.data;
      let msg = data?.message || 'Login failed. Please check your credentials.';

      if (data?.code === 'ACCOUNT_PENDING') {
        msg = 'Your application is currently under review by our admin team. Please check back later.';
      } else if (data?.code === 'ACCOUNT_REJECTED') {
        msg = `Your application was rejected. Reason: ${data?.reason || 'No reason provided.'}`;
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 space-y-4 border rounded-xl shadow-sm bg-card">
        <h2 className="text-2xl font-bold text-center">Merchant Portal Login</h2>
        
        {error && (
          <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="merchant-email" className="block text-sm font-medium">Email</label>
            <input 
              id="merchant-email"
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-2 mt-1 border rounded text-black bg-white" 
              required 
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="merchant-password" className="block text-sm font-medium">Password</label>
            <input 
              id="merchant-password"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-2 mt-1 border rounded text-black bg-white" 
              required 
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? 'Logging in...' : 'Login to Dashboard'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Want to partner with us?{' '}
          <Link to="/merchant/register" className="text-primary hover:underline font-medium">
            Apply here
          </Link>
        </div>
      </div>
    </div>
  );
}
