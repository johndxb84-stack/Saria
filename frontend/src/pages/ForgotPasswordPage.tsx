import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Heart, Mail, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
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
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-white/60 text-sm mb-6">
                If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly. The link expires in 1 hour.
              </p>
              <Link to="/login" className="btn-primary w-full py-3 text-base block text-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Forgot password?</h2>
              <p className="text-white/60 text-sm mb-8">
                Enter your email and we'll send you a link to reset your password.
              </p>

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
                    <input
                      type="email"
                      className="input-field pl-10"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-white/55 text-sm hover:text-white transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Back to Sign In
          </Link>
        </div>

        <div className="text-center mt-3 flex items-center justify-center gap-2 text-xs text-primary-300">
          <Lock className="w-3 h-3" />
          <span>Reset links expire after 1 hour</span>
        </div>
      </div>
    </div>
  );
}
