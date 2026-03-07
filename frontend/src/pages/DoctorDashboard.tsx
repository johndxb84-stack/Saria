import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { User } from '../types';
import {
  Users, UserCheck, Search, CheckCircle, XCircle,
  FileText, Plus, Shield, Activity, Bell, UserX, RefreshCw,
  ChevronDown, AlertTriangle, KeyRound
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
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-yellow-600'}`} />
          </div>
          <p className="text-gray-700 text-sm leading-relaxed pt-1">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary text-sm py-2 px-4">Cancel</button>
          <button
            onClick={onConfirm}
            className={`text-sm py-2 px-4 rounded-lg font-semibold text-gray-900 transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
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
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirm, setConfirm] = useState<{ id: string; action: 'deactivate' } | null>(null);
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
      const pRes = await api.get<User[]>('/patients');
      setPatients(pRes.data);
    } catch {
      toast('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

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

  const active = filtered.filter(p => p.is_active);
  const inactive = filtered.filter(p => !p.is_active);

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
      <ToastContainer toasts={toasts} remove={removeToast} />

      {confirm && (
        <ConfirmDialog
          danger
          message={`Deactivate this patient's account? They will lose portal access and be notified.`}
          confirmLabel="Deactivate"
          onConfirm={() => {
            const p = patients.find(x => x.id === confirm.id);
            const name = p ? `${p.first_name} ${p.last_name}` : 'Patient';
            deactivate(confirm.id, name);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {resetPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 glass-pill">
                <KeyRound className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-gray-900 font-semibold text-sm">Reset Password</p>
                <p className="text-gray-500 text-xs mt-0.5">Set a new password for {resetPwd.name}</p>
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
                className="text-sm py-2 px-4 rounded-lg font-semibold text-gray-900 bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Good day, Dr. {user?.last_name}
            </h1>
            <p className="text-gray-500 mt-1">Patient portal overview</p>
          </div>
          <Link to="/doctor/staff" className="btn-secondary flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            Manage Staff
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Total Patients', value: patients.length, icon: Users, color: 'text-sky-600', bg: 'bg-sky-400/20' },
            { label: 'Active Patients', value: active.length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-green-400/20' },
            { label: 'Inactive', value: inactive.length, icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`relative w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active patient list */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="font-bold text-gray-900">Active Patients</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No active patients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Contact</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">ID</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">DOB</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Gender</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {active.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 glass-pill rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-900 text-xs font-bold">{p.first_name[0]}{p.last_name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{p.first_name} {p.last_name}</p>
                            <p className="text-xs text-gray-400 sm:hidden">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <p className="text-sm text-gray-700">{p.email}</p>
                        {p.phone && <p className="text-xs text-gray-400">{p.phone}</p>}
                        {(p.emergency_contact || p.emergency_phone) && (
                          <p className="text-xs text-orange-500 mt-0.5">
                            Emergency: {p.emergency_contact}{p.emergency_contact && p.emergency_phone ? ' · ' : ''}{p.emergency_phone}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4 hidden lg:table-cell">
                        {p.id_number ? (
                          <>
                            <p className="text-xs text-gray-400 uppercase">{p.id_type || 'ID'}</p>
                            <p className="text-sm text-gray-700 font-mono">{p.id_number}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">—</p>
                        )}
                      </td>
                      <td className="py-3 pr-4 hidden lg:table-cell">
                        <p className="text-sm text-gray-600">{p.date_of_birth || '—'}</p>
                      </td>
                      <td className="py-3 pr-4 hidden xl:table-cell">
                        <p className="text-sm text-gray-600 capitalize">{p.gender || '—'}</p>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            to={`/doctor/patients/${p.id}`}
                            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-medium bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Records
                          </Link>
                          <Link
                            to={`/doctor/patients/${p.id}/add-record`}
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-gray-900 font-medium bg-green-400/15 hover:bg-green-400/25 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </Link>
                          <button
                            onClick={() => { setResetPwd({ id: p.id, name: `${p.first_name} ${p.last_name}` }); setNewPassword(''); }}
                            disabled={actionId === p.id}
                            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-medium bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                            title="Reset password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Reset Pwd
                          </button>
                          <button
                            onClick={() => setConfirm({ id: p.id, action: 'deactivate' })}
                            disabled={actionId === p.id}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 font-medium bg-gray-50 hover:bg-red-400/15 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
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
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => setShowInactive(v => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-3 transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showInactive ? 'rotate-180' : ''}`} />
                Inactive Patients ({inactive.length})
              </button>
              {showInactive && (
                <div className="space-y-2">
                  {inactive.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 glass-pill rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-xs font-bold">{p.first_name[0]}{p.last_name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.first_name} {p.last_name}</p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge-gray">Inactive</span>
                        <button
                          onClick={() => reactivate(p.id, `${p.first_name} ${p.last_name}`)}
                          disabled={actionId === p.id}
                          className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-medium bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
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
            { icon: Activity, label: 'Active monitoring', value: `${active.length} patients`, color: 'text-sky-600', bg: 'bg-sky-400/20' },
            { icon: FileText, label: 'Data privacy', value: 'HIPAA Compliant', color: 'text-emerald-600', bg: 'bg-green-400/20' },
            { icon: Shield, label: 'System status', value: 'Secure & Online', color: 'text-purple-600', bg: 'bg-purple-400/20' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
