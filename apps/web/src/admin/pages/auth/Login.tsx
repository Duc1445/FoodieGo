import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { AuthAPI } from '../../../shared/services/auth.api';
import { Button } from '@foodiego/ui';
import { AlertCircle, Loader2 } from 'lucide-react';

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
      const data = await AuthAPI.login({ email, password, role: 'admin' });
      localStorage.setItem('foodiego-auth-token', data.token);
      login(data.user, data.token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 space-y-4 border rounded-xl shadow-sm bg-card">
        <h2 className="text-2xl font-bold text-center text-red-600">Admin Portal</h2>
        
        {error && (
          <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Admin Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-2 mt-1 border rounded" 
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
              className="w-full p-2 mt-1 border rounded" 
              required 
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? 'Accessing...' : 'Access System'}
          </Button>
        </form>
      </div>
    </div>
  );
}
