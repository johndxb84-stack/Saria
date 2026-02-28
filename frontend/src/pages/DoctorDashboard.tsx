import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { User } from '../types';
import {
  Users, UserCheck, Clock, Search, CheckCircle, XCircle,
  FileText, Plus, Shield, Activity, Bell
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);
  const [pending, setPending] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [pRes, pendRes] = await Promise.all([
        api.get<User[]>('/patients'),
        api.get<User[]>('/patients/pending')
      ]);
      setPatients(pRes.data);
      setPending(pendRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    setApprovingId(id);
    try {
      await api.put(`/patients/${id}/approve`);
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null);
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Good day, Dr. {user?.last_name} 👩‍⚕️
            </h1>
            <p className="text-gray-500 mt-1">Here's an overview of your patient portal</p>
          </div>
          <div className="flex gap-2">
            <Link to="/doctor/staff" className="btn-secondary flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              Manage Staff
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Patients', value: patients.filter(p => p.approved).length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Patients', value: active.length, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending Approval', value: pending.length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Inactive', value: inactive.length, icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending approvals */}
        {pending.length > 0 && (
          <div className="card mb-6 border-yellow-200 bg-yellow-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4 text-yellow-600" />
              </div>
              <h2 className="font-bold text-gray-900">Pending Patient Approvals ({pending.length})</h2>
            </div>
            <div className="space-y-3">
              {pending.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-yellow-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-700 text-sm font-bold">{p.first_name[0]}{p.last_name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-gray-500">{p.email} · Registered {new Date(p.created_at!).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => approve(p.id)}
                    disabled={approvingId === p.id}
                    className="flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {approvingId === p.id ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patient List */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">All Patients</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="input-field pl-9 py-2 text-sm"
                placeholder="Search patients..."
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
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">DOB</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Gender</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {active.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 text-xs font-bold">{p.first_name[0]}{p.last_name[0]}</span>
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
                      </td>
                      <td className="py-3 pr-4 hidden lg:table-cell">
                        <p className="text-sm text-gray-600">{p.date_of_birth || '—'}</p>
                      </td>
                      <td className="py-3 pr-4 hidden lg:table-cell">
                        <p className="text-sm text-gray-600 capitalize">{p.gender || '—'}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="badge-green">Active</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/doctor/patients/${p.id}`}
                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Records
                          </Link>
                          <Link
                            to={`/doctor/patients/${p.id}/add-record`}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {inactive.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Inactive Patients ({inactive.length})</h3>
              <div className="space-y-2">
                {inactive.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs font-bold">{p.first_name[0]}{p.last_name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-gray">Inactive</span>
                      <button
                        onClick={async () => { await api.put(`/patients/${p.id}/reactivate`); load(); }}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Reactivate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick stats activities */}
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Activity, label: 'Active monitoring', value: `${active.length} patients`, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: FileText, label: 'Data privacy', value: 'HIPAA Compliant', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: Shield, label: 'System status', value: 'Secure & Online', color: 'text-purple-600', bg: 'bg-purple-50' },
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
