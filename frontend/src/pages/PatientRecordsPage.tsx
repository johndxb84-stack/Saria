import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { MedicalRecord, FileRecord, RecordType, User } from '../types';
import {
  FileText, FlaskConical, Image, Pill, Shield, Heart,
  Download, Plus, ArrowLeft, Search, Filter, ChevronDown, ChevronUp,
  Calendar, User as UserIcon, Paperclip, Droplet, AlertCircle
} from 'lucide-react';

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  consultation: { label: 'Consultation', color: 'badge-blue', iconClass: 'bg-sky-400/20 text-sky-200', icon: <FileText className="w-4 h-4" /> },
  blood_test: { label: 'Blood Test', color: 'badge-red', iconClass: 'bg-red-400/20 text-red-200', icon: <FlaskConical className="w-4 h-4" /> },
  xray: { label: 'X-Ray', color: 'badge-purple', iconClass: 'bg-purple-400/20 text-purple-200', icon: <Image className="w-4 h-4" /> },
  prescription: { label: 'Prescription', color: 'badge-green', iconClass: 'bg-green-400/20 text-green-200', icon: <Pill className="w-4 h-4" /> },
  vaccination: { label: 'Vaccination', color: 'badge-yellow', iconClass: 'bg-yellow-400/20 text-yellow-200', icon: <Shield className="w-4 h-4" /> },
  allergy: { label: 'Allergy', color: 'badge-yellow', iconClass: 'bg-orange-400/20 text-orange-200', icon: <AlertCircle className="w-4 h-4" /> },
  surgery: { label: 'Surgery', color: 'badge-red', iconClass: 'bg-pink-400/20 text-pink-200', icon: <Heart className="w-4 h-4" /> },
  note: { label: 'Note', color: 'badge-gray', iconClass: 'bg-white/12 text-white/65', icon: <FileText className="w-4 h-4" /> },
  other: { label: 'Other', color: 'badge-gray', iconClass: 'bg-white/12 text-white/65', icon: <FileText className="w-4 h-4" /> },
};

const STATUS_COLORS = {
  normal: 'text-green-200 bg-green-400/20',
  low: 'text-yellow-200 bg-yellow-400/20',
  high: 'text-orange-200 bg-orange-400/20',
  critical: 'text-red-200 bg-red-400/20 font-semibold',
};

export default function PatientRecordsPage() {
  const { user } = useAuth();
  const { patientId } = useParams();
  const navigate = useNavigate();
  const effectivePatientId = patientId || user?.id;

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [patient, setPatient] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<RecordType | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'files'>('records');
  const [downloadError, setDownloadError] = useState('');

  const isStaff = user?.role === 'doctor' || user?.role === 'nurse';
  const addRecordPath = user?.role === 'doctor'
    ? `/doctor/patients/${effectivePatientId}/add-record`
    : `/nurse/patients/${effectivePatientId}/add-record`;

  const load = useCallback(async () => {
    if (!effectivePatientId) return;
    try {
      const [recRes, fileRes] = await Promise.all([
        api.get<MedicalRecord[]>(`/records/${effectivePatientId}`),
        api.get<FileRecord[]>(`/files/${effectivePatientId}`)
      ]);
      setRecords(recRes.data);
      setFiles(fileRes.data);
      if (isStaff && patientId) {
        const patRes = await api.get<User>(`/patients/${patientId}`);
        setPatient(patRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [effectivePatientId, isStaff, patientId]);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || r.record_type === filterType;
    return matchSearch && matchType;
  });

  const handleDownload = async (fileId: string, fileName: string) => {
    setDownloadError('');
    try {
      const response = await api.get(`/files/download/${fileId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setDownloadError('Failed to download file. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

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

  const patientName = isStaff && patient
    ? `${patient.first_name} ${patient.last_name}`
    : `${user?.first_name} ${user?.last_name}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/12 rounded-lg transition-colors text-white">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {isStaff ? `${patientName}'s Records` : 'My Medical Records'}
              </h1>
              {isStaff && patient && (
                <p className="text-sm text-white/55">{patient.email} · {patient.date_of_birth}</p>
              )}
            </div>
          </div>
          {isStaff && (
            <Link to={addRecordPath} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Add Record
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass-pill p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'records' ? 'glass text-white' : 'text-white/65 hover:text-white'}`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Records ({records.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'files' ? 'glass text-white' : 'text-white/65 hover:text-white'}`}
          >
            <span className="flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Files ({files.length})
            </span>
          </button>
        </div>

        {activeTab === 'records' && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                <input
                  type="text"
                  className="input-field pl-9 py-2"
                  placeholder="Search records..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                <select className="input-field pl-9 py-2 pr-8" value={filterType} onChange={e => setFilterType(e.target.value as RecordType | '')}>
                  <option value="">All types</option>
                  {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Records list */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="card text-center py-16 text-white/40">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">{search || filterType ? 'No records match your search' : 'No medical records yet'}</p>
                </div>
              ) : (
                filtered.map(record => {
                  const cfg = TYPE_CONFIG[record.record_type] || TYPE_CONFIG.other;
                  const isExpanded = expandedId === record.id;
                  return (
                    <div key={record.id} className="card p-0 overflow-hidden hover:shadow-md transition-shadow">
                      <button
                        className="w-full text-left p-5 flex items-start gap-4"
                        onClick={() => setExpandedId(isExpanded ? null : record.id)}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconClass}`}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white text-sm">{record.title}</h3>
                            <span className={`${cfg.color} badge text-xs`}>{cfg.label}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-white/55">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserIcon className="w-3 h-3" />
                              {record.created_by_name}
                            </span>
                            {record.blood_results.length > 0 && (
                              <span className="flex items-center gap-1 text-red-300">
                                <Droplet className="w-3 h-3" />
                                {record.blood_results.length} results
                              </span>
                            )}
                            {record.files.length > 0 && (
                              <span className="flex items-center gap-1 text-purple-300">
                                <Paperclip className="w-3 h-3" />
                                {record.files.length} files
                              </span>
                            )}
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
                      </button>

                      {isExpanded && (
                        <div className="border-t border-white/10 px-5 pb-5 pt-4 space-y-4">
                          {record.description && (
                            <div>
                              <p className="text-xs font-semibold text-white/55 uppercase tracking-wide mb-1">Notes</p>
                              <p className="text-sm text-white/80 whitespace-pre-wrap">{record.description}</p>
                            </div>
                          )}

                          {/* Blood Results */}
                          {record.blood_results.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-white/55 uppercase tracking-wide mb-2">Blood Results</p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                  <thead>
                                    <tr className="bg-white/10 text-left">
                                      <th className="px-3 py-2 text-xs font-semibold text-white/60 rounded-tl-lg">Test</th>
                                      <th className="px-3 py-2 text-xs font-semibold text-white/60">Value</th>
                                      <th className="px-3 py-2 text-xs font-semibold text-gray-600">Unit</th>
                                      <th className="px-3 py-2 text-xs font-semibold text-gray-600">Reference</th>
                                      <th className="px-3 py-2 text-xs font-semibold text-white/60 rounded-tr-lg">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {record.blood_results.map(br => (
                                      <tr key={br.id} className="border-t border-white/10">
                                        <td className="px-3 py-2 font-medium text-white">{br.test_name}</td>
                                        <td className="px-3 py-2 text-white/80">{br.value}</td>
                                        <td className="px-3 py-2 text-white/55">{br.unit || '—'}</td>
                                        <td className="px-3 py-2 text-white/55">{br.reference_range || '—'}</td>
                                        <td className="px-3 py-2">
                                          {br.status && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[br.status] || ''}`}>
                                              {br.status}
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Prescriptions */}
                          {record.prescriptions.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-white/55 uppercase tracking-wide mb-2">Prescriptions</p>
                              <div className="space-y-2">
                                {record.prescriptions.map(rx => (
                                  <div key={rx.id} className="bg-green-400/12 border border-green-400/20 rounded-lg p-3 text-sm">
                                    <div className="font-semibold text-white">{rx.medication_name}</div>
                                    <div className="text-white/75 mt-1">
                                      {rx.dosage} · {rx.frequency}
                                      {rx.duration && ` · ${rx.duration}`}
                                    </div>
                                    {rx.instructions && <div className="text-white/55 text-xs mt-1">{rx.instructions}</div>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Attached files */}
                          {record.files.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-white/55 uppercase tracking-wide mb-2">Attached Files</p>
                              <div className="space-y-2">
                                {record.files.map(f => (
                                  <div key={f.id} className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Paperclip className="w-3.5 h-3.5 text-white/45 flex-shrink-0" />
                                      <span className="text-sm text-white/80 truncate">{f.original_name}</span>
                                      <span className="text-xs text-white/50">{formatFileSize(f.file_size)}</span>
                                    </div>
                                    <button
                                      onClick={() => handleDownload(f.id, f.original_name)}
                                      className="text-sky-200 hover:text-white flex items-center gap-1 text-xs font-medium ml-2"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      Download
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === 'files' && (
          <div className="space-y-3">
            {downloadError && (
              <div className="bg-red-400/15 border border-red-400/30 rounded-xl p-3 text-sm text-red-200">{downloadError}</div>
            )}
            {files.length === 0 ? (
              <div className="card text-center py-16 text-white/40">
                <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No files uploaded yet</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {files.map(f => (
                  <div key={f.id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.file_category === 'xray' || f.file_category === 'scan' ? 'bg-purple-400/20 text-purple-200' : 'bg-sky-400/20 text-sky-200'}`}>
                        {f.file_category === 'xray' || f.file_category === 'scan' ? <Image className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{f.original_name}</p>
                        <p className="text-xs text-white/55 mt-0.5 capitalize">{f.file_category.replace('_', ' ')} · {formatFileSize(f.file_size)}</p>
                        {f.description && <p className="text-xs text-white/50 mt-1">{f.description}</p>}
                        {f.record_title && <p className="text-xs text-sky-300 mt-1">📋 {f.record_title}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(f.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {f.uploaded_by_name && ` · ${f.uploaded_by_name}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(f.id, f.original_name)}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm text-sky-200 hover:text-white border border-white/20 hover:border-white/35 rounded-lg transition-colors hover:bg-white/8"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
