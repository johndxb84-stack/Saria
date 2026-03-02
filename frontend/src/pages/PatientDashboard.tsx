import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { RecordSummary, MedicalRecord } from '../types';
import {
  FileText, FlaskConical, Image, Pill, Calendar,
  ChevronRight, Activity, Heart, Shield, User
} from 'lucide-react';

const RECORD_ICONS: Record<string, React.ReactNode> = {
  consultation: <FileText className="w-4 h-4" />,
  blood_test: <FlaskConical className="w-4 h-4" />,
  xray: <Image className="w-4 h-4" />,
  prescription: <Pill className="w-4 h-4" />,
  vaccination: <Shield className="w-4 h-4" />,
  allergy: <Activity className="w-4 h-4" />,
  surgery: <Heart className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  other: <FileText className="w-4 h-4" />,
};

const RECORD_COLORS: Record<string, string> = {
  consultation: 'bg-sky-400/20 text-sky-200',
  blood_test: 'bg-red-400/20 text-red-200',
  xray: 'bg-purple-400/20 text-purple-200',
  prescription: 'bg-green-400/20 text-green-200',
  vaccination: 'bg-yellow-400/20 text-yellow-200',
  allergy: 'bg-orange-400/20 text-orange-200',
  surgery: 'bg-pink-400/20 text-pink-200',
  note: 'bg-white/12 text-white/65',
  other: 'bg-white/12 text-white/65',
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<RecordSummary | null>(null);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<RecordSummary>(`/records/${user.id}/summary`),
      api.get<MedicalRecord[]>(`/records/${user.id}`)
    ]).then(([sumRes, recRes]) => {
      setSummary(sumRes.data);
      setRecentRecords(recRes.data.slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome, {user?.first_name} 👋
          </h1>
          <p className="text-white/60 mt-1">Your health records are secure and up to date</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Records', value: summary?.total_records || 0, icon: FileText, color: 'bg-sky-400', bg: 'bg-sky-400/20' },
            { label: 'Files & Scans', value: summary?.total_files || 0, icon: Image, color: 'bg-purple-400', bg: 'bg-purple-400/20' },
            { label: 'Blood Tests', value: summary?.by_type?.find(t => t.record_type === 'blood_test')?.count || 0, icon: FlaskConical, color: 'bg-red-400', bg: 'bg-red-400/20' },
            { label: 'Consultations', value: summary?.by_type?.find(t => t.record_type === 'consultation')?.count || 0, icon: Activity, color: 'bg-green-400', bg: 'bg-green-400/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/65 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{value}</p>
                </div>
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-').replace('/20', '')}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Records */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">Recent Records</h2>
              <Link to="/patient/records" className="text-sm text-sky-200 hover:text-white flex items-center gap-1 font-medium">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {recentRecords.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No records yet. Your doctor will add records after your visit.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecords.map(record => (
                  <div key={record.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${RECORD_COLORS[record.record_type] || 'bg-white/12 text-white/65'}`}>
                      {RECORD_ICONS[record.record_type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{record.title}</p>
                      <p className="text-xs text-white/55 mt-0.5">
                        {new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {record.created_by_name && ` · ${record.created_by_name}`}
                      </p>
                    </div>
                    <span className={`badge ${RECORD_COLORS[record.record_type]?.replace('bg-', 'bg-').replace('text-', 'text-')} capitalize text-xs`}>
                      {record.record_type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-5">
            <div className="card">
              <h2 className="font-bold text-white mb-4">Quick Access</h2>
              <div className="space-y-2">
                {[
                  { to: '/patient/records', icon: FileText, label: 'All Medical Records', color: 'text-sky-300' },
                  { to: '/patient/records', icon: FlaskConical, label: 'Blood Test Results', color: 'text-red-300' },
                  { to: '/patient/records', icon: Image, label: 'X-Rays & Scans', color: 'text-purple-300' },
                  { to: '/patient/records', icon: Pill, label: 'Prescriptions', color: 'text-green-300' },
                  { to: '/patient/profile', icon: User, label: 'My Profile', color: 'text-white/70' },
                ].map(({ to, icon: Icon, label, color }) => (
                  <Link key={label} to={to} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/10 transition-colors group">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm text-white/80 group-hover:text-white">{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/40 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Last Visit */}
            {summary?.last_visit && (
              <div className="card border-sky-300/20" style={{background:"rgba(56,189,248,0.12)"}}>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-sky-300" />
                  <h3 className="font-semibold text-white text-sm">Last Visit</h3>
                </div>
                <p className="text-white font-bold">
                  {new Date(summary.last_visit.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="card border-green-400/20" style={{background:"rgba(74,222,128,0.10)"}}>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">Your Data is Private</p>
                  <p className="text-xs text-white/65 mt-1">
                    Only you and Dr. El Hachem's authorized team can access your records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
