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
  consultation: 'bg-blue-50 text-blue-600',
  blood_test: 'bg-red-50 text-red-600',
  xray: 'bg-purple-50 text-purple-600',
  prescription: 'bg-green-50 text-green-600',
  vaccination: 'bg-yellow-50 text-yellow-600',
  allergy: 'bg-orange-50 text-orange-600',
  surgery: 'bg-pink-50 text-pink-600',
  note: 'bg-gray-50 text-gray-600',
  other: 'bg-gray-50 text-gray-600',
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
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome, {user?.first_name} 👋
          </h1>
          <p className="text-gray-500 mt-1">Your health records are secure and up to date</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Records', value: summary?.total_records || 0, icon: FileText, color: 'bg-blue-500', bg: 'bg-blue-50' },
            { label: 'Files & Scans', value: summary?.total_files || 0, icon: Image, color: 'bg-purple-500', bg: 'bg-purple-50' },
            { label: 'Blood Tests', value: summary?.by_type?.find(t => t.record_type === 'blood_test')?.count || 0, icon: FlaskConical, color: 'bg-red-500', bg: 'bg-red-50' },
            { label: 'Consultations', value: summary?.by_type?.find(t => t.record_type === 'consultation')?.count || 0, icon: Activity, color: 'bg-green-500', bg: 'bg-green-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Records */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Recent Records</h2>
              <Link to="/patient/records" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {recentRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No records yet. Your doctor will add records after your visit.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecords.map(record => (
                  <div key={record.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${RECORD_COLORS[record.record_type] || 'bg-gray-50 text-gray-600'}`}>
                      {RECORD_ICONS[record.record_type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{record.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
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
              <h2 className="font-bold text-gray-900 mb-4">Quick Access</h2>
              <div className="space-y-2">
                {[
                  { to: '/patient/records', icon: FileText, label: 'All Medical Records', color: 'text-blue-600' },
                  { to: '/patient/records', icon: FlaskConical, label: 'Blood Test Results', color: 'text-red-600' },
                  { to: '/patient/records', icon: Image, label: 'X-Rays & Scans', color: 'text-purple-600' },
                  { to: '/patient/records', icon: Pill, label: 'Prescriptions', color: 'text-green-600' },
                  { to: '/patient/profile', icon: User, label: 'My Profile', color: 'text-gray-600' },
                ].map(({ to, icon: Icon, label, color }) => (
                  <Link key={label} to={to} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Last Visit */}
            {summary?.last_visit && (
              <div className="card bg-primary-50 border-primary-100">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Last Visit</h3>
                </div>
                <p className="text-primary-700 font-bold">
                  {new Date(summary.last_visit.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="card bg-green-50 border-green-100">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Your Data is Private</p>
                  <p className="text-xs text-gray-600 mt-1">
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
