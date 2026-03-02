import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { User } from '../types';
import {
  Users, UserCheck, Clock, Search, CheckCircle, XCircle,
  FileText, Plus, Shield, Activity, Bell, UserX, RefreshCw,
  ChevronDown, AlertTriangle, Mail, KeyRound
} from 'lucide-react';

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; msg: string; type: ToastType; }

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium cursor-pointer transition-all
            ${t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}
        >
          {t.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : t.type === 'error' ? <XCircle className="w-4 h-4 flex-shrink-0" /> : <Bell className="w-4 h-4 flex-shrink-0" />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

let toastId = 0;

// ─── Confirm dialog ───────────────────────────────────────────────────────────

interface ConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Confirm', danger }: ConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="glass rounded-2xl p-6 max-w-sm w-full relative overflow-hidden">
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-yellow-600'}`} />
          </div>
          <p className="text-white/80 text-sm leading-relaxed pt-1">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary text-sm py-2 px-4">Cancel</button>
          <button
            onClick={onConfirm}
            className={`text-sm py-2 px-4 rounded-lg font-semibold text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);
  const [pending, setPending] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirm, setConfirm] = useState<{ id: string; action: 'reject' | 'deactivate' } | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [resetPwd, setResetPwd] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const toast = useCallback((msg: string, type: ToastType = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const load = useCallback(async () => {
    try {
      const [pRes, pendRes] = await Promise.all([
        api.get<User[]>('/patients'),
        api.get<User[]>('/patients/pending')
      ]);
      setPatients(pRes.data);
      setPending(pendRes.data);
    } catch {
      toast('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string, name: string) => {
    setActionId(id);
    try {
      await api.put(`/patients/${id}/approve`);
      toast(`${name} approved — confirmation email sent`);
      await load();
    } catch {
      toast('Failed to approve patient', 'error');
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id: string, name: string) => {
    setActionId(id);
    setConfirm(null);
    try {
      await api.put(`/patients/${id}/reject`);
      toast(`${name}'s registration was rejected`, 'info');
      await load();
    } catch {
      toast('Failed to reject registration', 'error');
    } finally {
      setActionId(null);
    }
  };

  const deactivate = async (id: string, name: string) => {
    setActionId(id);
    setConfirm(null);
    try {
      await api.put(`/patients/${id}/deactivate`);
      toast(`${name} deactivated — notification email sent`, 'info');
      await load();
    } catch {
      toast('Failed to deactivate patient', 'error');
    } finally {
      setActionId(null);
    }
  };

  const reactivate = async (id: string, name: string) => {
    setActionId(id);
    try {
      await api.put(`/patients/${id}/reactivate`);
      toast(`${name} reactivated — notification email sent`);
      await load();
    } catch {
      toast('Failed to reactivate patient', 'error');
    } finally {
      setActionId(null);
    }
  };

  const resetPassword = async () => {
    if (!resetPwd || newPassword.length < 8) return;
    setActionId(resetPwd.id);
    try {
      await api.put(`/patients/${resetPwd.id}/reset-password`, { password: newPassword });
      toast(`Password reset for ${resetPwd.name}`);
      setResetPwd(null);
      setNewPassword('');
    } catch {
      toast('Failed to reset password', 'error');
    } finally {
      setActionId(null);
    }
  };

  const filtered = patients.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone?.includes(q);
  });

  const active = filtered.filter(p => p.is_active && p.approved);
  const inactive = filtered.filter(p => !p.is_active);

  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/60"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <ToastContainer toasts={toasts} remove={removeToast} />

      {confirm && (
        <ConfirmDialog
          danger
          message={
            confirm.action === 'reject'
              ? `Reject this patient's registration? They will be notified by email.`
              : `Deactivate this patient's account? They will lose portal access and be notified.`
          }
          confirmLabel={confirm.action === 'reject' ? 'Reject' : 'Deactivate'}
          onConfirm={() => {
            const p = [...pending, ...patients].find(x => x.id === confirm.id);
            const name = p ? `${p.first_name} ${p.last_name}` : 'Patient';
            if (confirm.action === 'reject') reject(confirm.id, name);
            else deactivate(confirm.id, name);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {resetPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="glass rounded-2xl p-6 max-w-sm w-full relative overflow-hidden">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 glass-pill">
                <KeyRound className="w-5 h-5 text-sky-300" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Reset Password</p>
                <p className="text-white/55 text-xs mt-0.5">Set a new password for {resetPwd.name}</p>
              </div>
            </div>
            <input
              type="password"
              placeholder="New password (min 8 characters)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="input-field w-full mb-4 text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setResetPwd(null); setNewPassword(''); }} className="btn-secondary text-sm py-2 px-4">Cancel</button>
              <button
                onClick={resetPassword}
                disabled={newPassword.length < 8 || actionId === resetPwd.id}
                className="text-sm py-2 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionId === resetPwd.id ? 'Saving…' : 'Save Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Good day, Dr. {user?.last_name}
            </h1>
            <p className="text-white/60 mt-1">Patient portal overview</p>
          </div>
          <Link to="/doctor/staff" className="btn-secondary flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            Manage Staff
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Patients', value: patients.filter(p => p.approved).length, icon: Users, color: 'text-sky-300', bg: 'bg-sky-400/20' },
            { label: 'Active Patients', value: active.length, icon: UserCheck, color: 'text-green-300', bg: 'bg-green-400/20' },
            { label: 'Pending Approval', value: pending.length, icon: Clock, color: 'text-yellow-300', bg: 'bg-yellow-400/20', pulse: pending.length > 0 },
            { label: 'Inactive', value: inactive.length, icon: XCircle, color: 'text-white/55', bg: 'bg-white/12' },
          ].map(({ label, value, icon: Icon, color, bg, pulse }) => (
            <div key={label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/65 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{value}</p>
                </div>
                <div className={`relative w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                  {pulse && <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending approvals */}
        {pending.length > 0 && (
          <div className="card mb-6 border-yellow-400/25" style={{background:"rgba(250,204,21,0.08)"">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4 text-yellow-300" />
              </div>
              <div>
                <h2 className="font-bold text-white">Pending Approvals ({pending.length})</h2>
                <p className="text-xs text-yellow-200/70 mt-0.5">Approve to grant portal access · Reject to decline the registration</p>
              </div>
            </div>

            <div className="space-y-3">
              {pending.map(p => (
                <div key={p.id} className="glass-pill rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-200 text-sm font-bold">{p.first_name[0]}{p.last_name[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{p.first_name} {p.last_name}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                          <span className="text-xs text-white/55 flex items-center gap-1">
                            <Mail className="w-3 h-3" />{p.email}
                          </span>
                          {p.phone && <span className="text-xs text-white/45">{p.phone}</span>}
                          {p.date_of_birth && <span className="text-xs text-white/50">DOB: {p.date_of_birth}</span>}
                          <span className="text-xs text-white/45">
                            Registered {new Date(p.created_at!).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => approve(p.id, `${p.first_name} ${p.last_name}`)}
                        disabled={actionId === p.id}
                        className="flex items-center gap-1.5 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actionId === p.id ? 'Working…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setConfirm({ id: p.id, action: 'reject' })}
                        disabled={actionId === p.id}
                        className="flex items-center gap-1.5 border border-red-400/30 text-red-300 text-sm px-4 py-2 rounded-lg hover:bg-red-400/15 transition-colors disabled:opacity-50 font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active patient list */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="font-bold text-white">Active Patients</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
              <input
                type="text"
                className="input-field pl-9 py-2 text-sm w-full"
                placeholder="Search by name, email, phone…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {active.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No active patients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-3 text-xs font-semibold text-white/55 uppercase tracking-wide">Patient</th>
                    <th className="pb-3 text-xs font-semibold text-white/55 uppercase tracking-wide hidden sm:table-cell">Contact</th>
                    <th className="pb-3 text-xs font-semibold text-white/55 uppercase tracking-wide hidden lg:table-cell">DOB</th>
                    <th className="pb-3 text-xs font-semibold text-white/55 uppercase tracking-wide hidden lg:table-cell">Gender</th>
                    <th className="pb-3 text-xs font-semibold text-white/55 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {active.map(p => (
                    <tr key={p.id} className="hover:bg-white/8 transition-colors group">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 glass-pill rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{p.first_name[0]}{p.last_name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{p.first_name} {p.last_name}</p>
                            <p className="text-xs text-white/50 sm:hidden">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <p className="text-sm text-white/80">{p.email}</p>
                        {p.phone && <p className="text-xs text-white/45">{p.phone}</p>}
                      </td>
                      <td className="py-3 pr-4 hidden lg:table-cell">
                        <p className="text-sm text-white/70">{p.date_of_birth || '—'}</p>
                      </td>
                      <td className="py-3 pr-4 hidden lg:table-cell">
                        <p className="text-sm text-white/70 capitalize">{p.gender || '—'}</p>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            to={`/doctor/patients/${p.id}`}
                            className="flex items-center gap-1 text-xs text-sky-200 hover:text-white font-medium bg-sky-400/15 hover:bg-sky-400/25 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Records
                          </Link>
                          <Link
                            to={`/doctor/patients/${p.id}/add-record`}
                            className="flex items-center gap-1 text-xs text-green-200 hover:text-white font-medium bg-green-400/15 hover:bg-green-400/25 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </Link>
                          <button
                            onClick={() => { setResetPwd({ id: p.id, name: `${p.first_name} ${p.last_name}` }); setNewPassword(''); }}
                            disabled={actionId === p.id}
                            className="flex items-center gap-1 text-xs text-sky-200 hover:text-white font-medium bg-sky-400/15 hover:bg-sky-400/25 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                            title="Reset password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Reset Pwd
                          </button>
                          <button
                            onClick={() => setConfirm({ id: p.id, action: 'deactivate' })}
                            disabled={actionId === p.id}
                            className="flex items-center gap-1 text-xs text-white/55 hover:text-red-300 font-medium bg-white/10 hover:bg-red-400/15 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                            title="Deactivate patient"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Inactive section */}
          {inactive.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={() => setShowInactive(v => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white mb-3 transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showInactive ? 'rotate-180' : ''}`} />
                Inactive Patients ({inactive.length})
              </button>
              {showInactive && (
                <div className="space-y-2">
                  {inactive.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 glass-pill rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-white/15 rounded-full flex items-center justify-center">
                          <span className="text-white/70 text-xs font-bold">{p.first_name[0]}{p.last_name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{p.first_name} {p.last_name}</p>
                          <p className="text-xs text-white/45">{p.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge-gray">Inactive</span>
                        <button
                          onClick={() => reactivate(p.id, `${p.first_name} ${p.last_name}`)}
                          disabled={actionId === p.id}
                          className="flex items-center gap-1 text-xs text-sky-200 hover:text-white font-medium bg-sky-400/15 hover:bg-sky-400/25 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className="w-3 h-3" />
                          {actionId === p.id ? '…' : 'Reactivate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom status bar */}
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Activity, label: 'Active monitoring', value: `${active.length} patients`, color: 'text-sky-300', bg: 'bg-sky-400/20' },
            { icon: FileText, label: 'Data privacy', value: 'HIPAA Compliant', color: 'text-green-300', bg: 'bg-green-400/20' },
            { icon: Shield, label: 'System status', value: 'Secure & Online', color: 'text-purple-300', bg: 'bg-purple-400/20' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-white/55">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
