import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, CheckCircle, AlertCircle, Eye, EyeOff, CreditCard, Globe } from 'lucide-react';
import api from '../utils/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: '',
    phone: '', date_of_birth: '', gender: '', address: '',
    emergency_contact: '', emergency_phone: '',
    is_uae_resident: '' as '' | 'yes' | 'no',
    id_number: ''
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleEIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
    let formatted = digits;
    if (digits.length > 3) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length > 7) formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    if (digits.length > 14) formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 14)}-${digits.slice(14)}`;
    setForm(f => ({ ...f, id_number: formatted }));
  };

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
    if (!form.is_uae_resident) {
      setError('Please indicate whether you are a UAE resident');
      return;
    }
    if (!form.id_number.trim()) {
      setError(form.is_uae_resident === 'yes' ? 'Emirates ID number is required' : 'Passport number is required');
      return;
    }
    if (!consentGiven) {
      setError('You must agree to the Privacy Policy and Terms of Service to register.');
      return;
    }
    if (form.is_uae_resident === 'yes' && !/^784-\d{4}-\d{7}-\d$/.test(form.id_number.trim())) {
      setError('Emirates ID must follow the format: 784-XXXX-XXXXXXX-X (15 digits)');
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
        emergency_phone: form.emergency_phone || undefined,
        id_type: form.is_uae_resident === 'yes' ? 'eid' : 'passport',
        id_number: form.id_number.trim()
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
      <div className="min-h-screen min-h-screen flex items-center justify-center p-4 text-gray-900">
        <div className="glass rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Registration Successful!</h2>
          <p className="text-gray-500 mb-6">
            You have been successfully registered. You can now sign in and access your medical records.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full py-3">
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-gray-900">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-100 border border-sky-200 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-sky-600" />
            </div>
            <div className="text-left">
              <div className="text-gray-900 font-bold text-lg">Dr. Saria El Hachem</div>
              <div className="text-gray-500 text-sm">Patient Registration</div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-500 text-sm mb-8">
            Register to access your medical records securely. Your account will be activated by Dr. El Hachem.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
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

            {/* Identification */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
                Identification
              </h3>
              <p className="text-sm text-gray-500 mb-4">Required for medical record verification.</p>

              {/* Residency question */}
              <p className="text-sm font-medium text-gray-700 mb-3">Are you a UAE resident? *</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_uae_resident: 'yes', id_number: '' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    form.is_uae_resident === 'yes'
                      ? 'border-sky-300 bg-sky-50 text-gray-900'
                      : 'border-gray-200 hover:border-sky-200 text-gray-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm text-gray-900">Yes, UAE Resident</div>
                    <div className="text-xs text-gray-500">I have an Emirates ID</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_uae_resident: 'no', id_number: '' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    form.is_uae_resident === 'no'
                      ? 'border-sky-300 bg-sky-50 text-gray-900'
                      : 'border-gray-200 hover:border-sky-200 text-gray-600'
                  }`}
                >
                  <Globe className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm text-gray-900">No, Non-Resident / Visitor</div>
                    <div className="text-xs text-gray-500">I will provide my passport</div>
                  </div>
                </button>
              </div>

              {/* EID field */}
              {form.is_uae_resident === 'yes' && (
                <div>
                  <label className="label">Emirates ID Number (EID) *</label>
                  <input
                    type="text"
                    className="input-field font-mono tracking-wide"
                    placeholder="784-XXXX-XXXXXXX-X"
                    value={form.id_number}
                    onChange={handleEIDChange}
                    maxLength={18}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Format: 784-YYYY-NNNNNNN-C · 15 digits total</p>
                </div>
              )}

              {/* Passport field */}
              {form.is_uae_resident === 'no' && (
                <div>
                  <label className="label">Passport Number *</label>
                  <input
                    type="text"
                    className="input-field uppercase"
                    placeholder="e.g. A12345678"
                    value={form.id_number}
                    onChange={e => setForm(f => ({ ...f, id_number: e.target.value.toUpperCase() }))}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">As printed on your passport</p>
                </div>
              )}
            </div>

            {/* Account */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
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
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
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

            {/* Explicit consent — required by UAE PDPL */}
            <div className={`rounded-xl p-4 border ${consentGiven ? 'bg-sky-50 border-sky-200' : 'bg-gray-50 border-gray-200'} transition-colors`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 flex-shrink-0 cursor-pointer"
                  checked={consentGiven}
                  onChange={e => setConsentGiven(e.target.checked)}
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  I have read and agree to the{' '}
                  <Link to="/privacy" target="_blank" className="text-sky-600 font-medium hover:underline">Privacy Policy</Link>
                  {' '}and{' '}
                  <Link to="/terms" target="_blank" className="text-sky-600 font-medium hover:underline">Terms of Service</Link>.
                  I consent to Dr. El Hachem and her authorized medical team accessing and managing my health
                  records electronically, and to my data being stored securely on servers in the UAE.{' '}
                  <span className="text-red-500 font-medium">*</span>
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading || !consentGiven} className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : 'Submit Registration'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="text-sky-600 font-semibold hover:text-gray-900">Sign In</Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-gray-500 text-sm hover:text-gray-900">← Back to website</Link>
        </div>
      </div>
    </div>
  );
}
