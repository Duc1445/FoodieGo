import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { api } from '../../../shared/api/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<{ success: boolean; data: { token: string; user: any } }>('/auth/login', { email, password, role: 'merchant' });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        navigate('/merchant');
      }
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 space-y-4 border rounded-xl shadow-sm bg-card">
        <h2 className="text-2xl font-bold text-center">Merchant Portal Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 mt-1 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 mt-1 border rounded" required />
          </div>
          <button type="submit" className="w-full py-2 font-bold text-white bg-primary rounded hover:bg-primary/90">Login to Dashboard</button>
        </form>
        <div className="text-sm text-center">
          Want to partner with us? <Link to="/merchant/auth/register" className="text-primary hover:underline">Apply here</Link>
        </div>
      </div>
    </div>
  );
}
