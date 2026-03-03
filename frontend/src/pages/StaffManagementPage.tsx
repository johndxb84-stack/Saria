import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { User } from '../types';
import { ArrowLeft, Plus, Users, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function StaffManagementPage() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get<User[]>('/patients/staff/list');
      setStaff(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await api.post('/patients/create-nurse', form);
      setMsg(`Nurse account created for ${form.first_name} ${form.last_name}`);
      setForm({ first_name: '', last_name: '', email: '', password: '', phone: '' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create nurse account');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id: string) => {
    if (!confirm('Deactivate this nurse account?')) return;
    try {
      await api.put(`/patients/${id}/deactivate`);
      load();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/doctor')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-900">
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-sm text-gray-500">Manage nurse accounts and portal access</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Add Nurse
          </button>
        </div>

        {/* Messages */}
        {msg && (
          <div className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-600">
            <CheckCircle className="w-4 h-4" /> {msg}
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Add nurse form */}
        {showForm && (
          <form onSubmit={handleCreate} className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Create Nurse Account</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input type="text" className="input-field" value={form.first_name} onChange={set('first_name')} required />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input type="text" className="input-field" value={form.last_name} onChange={set('last_name')} required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input-field" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="tel" className="input-field" value={form.phone} onChange={set('phone')} placeholder="+971 XX XXX XXXX" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Password * (min. 8 chars)</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} className="input-field pr-10" value={form.password} onChange={set('password')} required minLength={8} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Share this password securely with the nurse. They can change it after first login.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Creating...' : 'Create Account'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        {/* Staff list */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4 text-gray-900">
            <Users className="w-5 h-5 text-gray-500" />
            <h2 className="font-bold text-gray-900">Nursing Staff ({staff.length})</h2>
          </div>

          {staff.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No nurses added yet. Click "Add Nurse" to create an account.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {staff.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 glass-pill rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
                      <span className="text-gray-900 font-bold text-sm">{s.first_name[0]}{s.last_name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                      {s.phone && <p className="text-xs text-gray-400">{s.phone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={s.is_active ? 'badge-green' : 'badge-red'}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {s.is_active && (
                      <button
                        onClick={() => deactivate(s.id)}
                        className="text-xs text-red-500 hover:text-gray-900 font-medium px-3 py-1 border border-red-200 rounded-lg hover:bg-red-400/15 transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role descriptions */}
        <div className="mt-6 card border-sky-200" style={{background:"#f0f9ff"}}>
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Access Levels</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="badge-blue mt-0.5">Doctor</span>
              <span>Full access — view all patients, approve registrations, manage records, add/remove staff</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="badge-purple mt-0.5">Nurse</span>
              <span>Clinical access — view all patients, add and update medical records, upload files</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="badge-gray mt-0.5">Patient</span>
              <span>Personal access — view own records, files, and results only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
