import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: '',
    phone: '', date_of_birth: '', gender: '', address: '',
    emergency_contact: '', emergency_phone: ''
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, password: form.password,
        phone: form.phone || undefined, date_of_birth: form.date_of_birth || undefined,
        gender: form.gender || undefined, address: form.address || undefined,
        emergency_contact: form.emergency_contact || undefined,
        emergency_phone: form.emergency_phone || undefined
      });
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Registration Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for registering. Your account is <strong>pending review</strong> by
            Dr. El Hachem. Once approved, you will be able to sign in and access your
            medical records.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please contact the clinic if you need urgent access.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full py-3">
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-lg">Dr. Saria El Hachem</div>
              <div className="text-primary-200 text-sm">Patient Registration</div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-500 text-sm mb-8">
            Register to access your medical records securely. Your account will be activated by Dr. El Hachem.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
                Personal Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input type="text" className="input-field" placeholder="Fatima" value={form.first_name} onChange={set('first_name')} required />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input type="text" className="input-field" placeholder="Al Mansouri" value={form.last_name} onChange={set('last_name')} required />
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input type="date" className="input-field" value={form.date_of_birth} onChange={set('date_of_birth')} />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className="input-field" value={form.gender} onChange={set('gender')}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address</label>
                  <input type="text" className="input-field" placeholder="Dubai, UAE" value={form.address} onChange={set('address')} />
                </div>
              </div>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
                Account Credentials
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Email Address *</label>
                  <input type="email" className="input-field" placeholder="you@email.com" value={form.email} onChange={set('email')} required autoComplete="email" />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input type="tel" className="input-field" placeholder="+971 XX XXX XXXX" value={form.phone} onChange={set('phone')} />
                </div>
                <div></div>
                <div>
                  <label className="label">Password * (min. 8 chars)</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={8} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input type={showPassword ? 'text' : 'password'} className="input-field" placeholder="••••••••" value={form.confirm_password} onChange={set('confirm_password')} required />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
                Emergency Contact (Optional)
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Contact Name</label>
                  <input type="text" className="input-field" placeholder="Full name" value={form.emergency_contact} onChange={set('emergency_contact')} />
                </div>
                <div>
                  <label className="label">Contact Phone</label>
                  <input type="tel" className="input-field" placeholder="+971 XX XXX XXXX" value={form.emergency_phone} onChange={set('emergency_phone')} />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
              <strong>Privacy Notice:</strong> Your medical information is confidential and will only
              be accessible to you and Dr. El Hachem's authorized medical team. By registering,
              you consent to Dr. El Hachem managing your health records electronically.
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : 'Submit Registration'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign In</Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-primary-200 text-sm hover:text-white">← Back to website</Link>
        </div>
      </div>
    </div>
  );
}
