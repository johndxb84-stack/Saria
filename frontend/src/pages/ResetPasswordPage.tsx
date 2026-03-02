import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Heart, Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-white">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Invalid Reset Link</h2>
          <p className="text-white/60 text-sm mb-6">This reset link is missing or malformed.</p>
          <Link to="/forgot-password" className="btn-primary block py-3 text-base">Request a New Link</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md">
        {/* Logo */}
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
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-white/60 text-sm mb-6">
                Your password has been updated. Redirecting you to the login page...
              </p>
              <Link to="/login" className="btn-primary w-full py-3 text-base block text-center">
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Set new password</h2>
              <p className="text-white/60 text-sm mb-8">Choose a strong password for your account.</p>

              {error && (
                <div className="mb-5 flex items-start gap-3 bg-red-400/15 border border-red-400/30 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pl-10 pr-10"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/80"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pl-10"
                      placeholder="Repeat your password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <Link to="/forgot-password" className="text-sky-200 hover:text-white">
                  Request a new link
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6 flex items-center justify-center gap-2 text-xs text-white/55">
          <Lock className="w-3 h-3" />
          <span>Your data is encrypted and protected</span>
        </div>
      </div>
    </div>
  );
}
