import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { User } from '../types';
import { Users, Search, FileText, Plus } from 'lucide-react';

export default function NurseDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get<User[]>('/patients');
      setPatients(res.data.filter(p => p.is_active && p.approved));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = patients.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome, {user?.first_name} 👋
          </h1>
          <p className="text-white/60 mt-1">Select a patient to view or add medical records</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white/75" />
              <h2 className="font-bold text-white">Patients ({filtered.length})</h2>
            </div>
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

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">{search ? 'No patients found' : 'No active patients'}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => (
                <div key={p.id} className="glass-pill rounded-xl p-4 hover:bg-white/20 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{p.first_name[0]}{p.last_name[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-white/50 truncate">{p.email}</p>
                    </div>
                  </div>
                  {p.date_of_birth && (
                    <p className="text-xs text-white/55 mb-3">DOB: {p.date_of_birth} · {p.gender}</p>
                  )}
                  <div className="flex gap-2">
                    <Link
                      to={`/nurse/patients/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-sky-200 hover:text-white font-medium bg-sky-400/15 hover:bg-sky-400/25 px-3 py-2 rounded-lg transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Records
                    </Link>
                    <Link
                      to={`/nurse/patients/${p.id}/add-record`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-green-200 hover:text-white font-medium bg-green-400/15 hover:bg-green-400/25 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Record
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
