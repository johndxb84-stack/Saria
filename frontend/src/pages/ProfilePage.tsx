import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  // Password change
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(res => setProfile(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaveMsg(''); setSaveError('');
    try {
      await api.put('/patients/me/profile', {
        phone: profile.phone, address: profile.address,
        emergency_contact: profile.emergency_contact, emergency_phone: profile.emergency_phone
      });
      setSaveMsg('Profile updated successfully');
    } catch (err: any) {
      setSaveError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(''); setPwError('');
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    if (pwForm.newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { current_password: pwForm.current, new_password: pwForm.newPw });
      setPwMsg('Password changed successfully');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err: any) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const dashboardPath = user?.role === 'doctor' ? '/doctor' : user?.role === 'nurse' ? '/nurse' : '/patient';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(dashboardPath)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500 capitalize">{user?.role} Account</p>
          </div>
        </div>

        {/* Profile avatar */}
        <div className="card flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 text-2xl font-bold">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{profile?.first_name} {profile?.last_name}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-1 capitalize">
              {profile?.role} · Member since {new Date(profile?.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Contact Info (patient only for editable) */}
        {user?.role === 'patient' && (
          <form onSubmit={handleProfileSave} className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Personal Information</h2>

            {saveMsg && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" /> {saveMsg}
              </div>
            )}
            {saveError && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" /> {saveError}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input type="text" className="input-field bg-gray-50" value={profile?.first_name || ''} disabled />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input type="text" className="input-field bg-gray-50" value={profile?.last_name || ''} disabled />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input type="text" className="input-field bg-gray-50" value={profile?.date_of_birth || '—'} disabled />
              </div>
              <div>
                <label className="label">Gender</label>
                <input type="text" className="input-field bg-gray-50 capitalize" value={profile?.gender || '—'} disabled />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" className="input-field" value={profile?.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+971 XX XXX XXXX" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <input type="text" className="input-field" value={profile?.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="Dubai, UAE" />
              </div>
              <div>
                <label className="label">Emergency Contact</label>
                <input type="text" className="input-field" value={profile?.emergency_contact || ''} onChange={e => setProfile({ ...profile, emergency_contact: e.target.value })} placeholder="Full name" />
              </div>
              <div>
                <label className="label">Emergency Phone</label>
                <input type="tel" className="input-field" value={profile?.emergency_phone || ''} onChange={e => setProfile({ ...profile, emergency_phone: e.target.value })} placeholder="+971 XX XXX XXXX" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary mt-4">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* View-only for doctor/nurse */}
        {user?.role !== 'patient' && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Name</span>
                <span className="font-medium text-gray-900">{profile?.first_name} {profile?.last_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{profile?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-900">{profile?.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Role</span>
                <span className="font-medium text-gray-900 capitalize">{profile?.role}</span>
              </div>
            </div>
          </div>
        )}

        {/* Change Password */}
        <form onSubmit={handlePasswordChange} className="card">
          <h2 className="font-bold text-gray-900 mb-4">Change Password</h2>
          {pwMsg && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" /> {pwMsg}
            </div>
          )}
          {pwError && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4" /> {pwError}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-10" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">New Password (min. 8 chars)</label>
              <input type={showPw ? 'text' : 'password'} className="input-field" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} required minLength={8} />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type={showPw ? 'text' : 'password'} className="input-field" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={pwLoading} className="btn-primary">
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
            <button type="button" onClick={() => { logout(); navigate('/'); }} className="btn-danger text-sm">
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
