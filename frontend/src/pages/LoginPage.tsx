import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const path = user.role === 'doctor' ? '/doctor' : user.role === 'nurse' ? '/nurse' : '/patient';
      navigate(path, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 glass-pill rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-lg leading-tight">Dr. Saria El Hachem</div>
              <div className="text-white/60 text-sm">Patient Portal</div>
            </div>
          </Link>
        </div>

        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-white/60 text-sm mb-8">Sign in to access your medical records securely</p>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-400/15 border border-red-400/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                <input type="email" className="input-field pl-10" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                <input type={showPassword ? 'text' : 'password'} className="input-field pl-10 pr-10"
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/80"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="text-sky-200 hover:text-white transition-colors">Forgot your password?</Link>
          </div>
          <div className="mt-3 text-center text-sm">
            <span className="text-white/55">New patient? </span>
            <Link to="/register" className="text-sky-200 font-semibold hover:text-white transition-colors">Register for portal access</Link>
          </div>
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/40">
            <Lock className="w-3 h-3" />
            <span>Your data is encrypted and protected</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-white/55 text-sm hover:text-white transition-colors">← Back to website</Link>
        </div>
      </div>
    </div>
  );
}
