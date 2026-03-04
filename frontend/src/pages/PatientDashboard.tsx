import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { RecordSummary, MedicalRecord, FamilyMember } from '../types';
import {
  FileText, FlaskConical, Image, Pill, Calendar,
  ChevronRight, Activity, Heart, Shield, User, Users
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
  consultation: 'bg-sky-50 text-sky-600',
  blood_test: 'bg-red-50 text-red-600',
  xray: 'bg-purple-50 text-purple-600',
  prescription: 'bg-emerald-50 text-emerald-600',
  vaccination: 'bg-amber-50 text-amber-600',
  allergy: 'bg-orange-50 text-orange-600',
  surgery: 'bg-pink-50 text-pink-600',
  note: 'bg-gray-100 text-gray-500',
  other: 'bg-gray-100 text-gray-500',
};

function getInitials(member: FamilyMember) {
  return `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
}

const AVATAR_COLORS = [
  'bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500',
];

export default function PatientDashboard() {
  const { user, familyMembers, viewedPatientId, viewedMember, switchProfile } = useAuth();
  const [summary, setSummary] = useState<RecordSummary | null>(null);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const targetId = viewedPatientId || user?.id;
  const isViewingFamily = viewedPatientId !== user?.id;
  const displayName = viewedMember?.first_name ?? user?.first_name ?? '';

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    Promise.all([
      api.get<RecordSummary>(`/records/${targetId}/summary`),
      api.get<MedicalRecord[]>(`/records/${targetId}`)
    ]).then(([sumRes, recRes]) => {
      setSummary(sumRes.data);
      setRecentRecords(recRes.data.slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, [targetId]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Family Profile Switcher — only shown when there are multiple members */}
        {familyMembers.length > 1 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-500">Family Profiles</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {familyMembers.map((member, idx) => {
                const isActive = member.id === viewedPatientId;
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <button
                    key={member.id}
                    onClick={() => switchProfile(member)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all font-medium text-sm ${
                      isActive
                        ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {getInitials(member)}
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold leading-tight ${isActive ? 'text-sky-700' : 'text-gray-800'}`}>
                        {member.first_name} {member.last_name}
                      </p>
                      {member.date_of_birth && (
                        <p className="text-xs text-gray-400 leading-tight">
                          {new Date(member.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <span className="ml-1 w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {isViewingFamily
              ? `${displayName}'s Health Records`
              : `Welcome, ${displayName} 👋`}
          </h1>
          <p className="text-gray-500 mt-1">
            {isViewingFamily
              ? `Viewing records for ${viewedMember?.first_name} ${viewedMember?.last_name}`
              : 'Your health records are secure and up to date'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Records', value: summary?.total_records || 0, icon: FileText, color: 'bg-sky-400', bg: 'bg-sky-400/20' },
            { label: 'Files & Scans', value: summary?.total_files || 0, icon: Image, color: 'bg-purple-400', bg: 'bg-purple-400/20' },
            { label: 'Blood Tests', value: summary?.by_type?.find(t => t.record_type === 'blood_test')?.count || 0, icon: FlaskConical, color: 'bg-red-400', bg: 'bg-red-50' },
            { label: 'Consultations', value: summary?.by_type?.find(t => t.record_type === 'consultation')?.count || 0, icon: Activity, color: 'bg-green-400', bg: 'bg-green-400/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
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
              <h2 className="font-bold text-gray-900">Recent Records</h2>
              <Link
                to={isViewingFamily ? `/patient/records/${targetId}` : '/patient/records'}
                className="text-sm text-sky-600 hover:text-sky-800 flex items-center gap-1 font-medium"
              >
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
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${RECORD_COLORS[record.record_type] || 'bg-gray-100 text-gray-500'}`}>
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
                  { to: isViewingFamily ? `/patient/records/${targetId}` : '/patient/records', icon: FileText, label: 'All Medical Records', color: 'text-sky-600' },
                  { to: isViewingFamily ? `/patient/records/${targetId}` : '/patient/records', icon: FlaskConical, label: 'Blood Test Results', color: 'text-red-500' },
                  { to: isViewingFamily ? `/patient/records/${targetId}` : '/patient/records', icon: Image, label: 'X-Rays & Scans', color: 'text-purple-600' },
                  { to: isViewingFamily ? `/patient/records/${targetId}` : '/patient/records', icon: Pill, label: 'Prescriptions', color: 'text-emerald-600' },
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
              <div className="card border-sky-200" style={{background:"#f0f9ff"}}>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Last Visit</h3>
                </div>
                <p className="text-gray-900 font-bold">
                  {new Date(summary.last_visit.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="card border-emerald-200" style={{background:"#ecfdf5"}}>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Your Data is Private</p>
                  <p className="text-xs text-gray-500 mt-1">
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
