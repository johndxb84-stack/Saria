import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { User } from '../types';
import { Plus, Trash2, ArrowLeft, Upload, CheckCircle } from 'lucide-react';

type RecordType = 'consultation' | 'blood_test' | 'xray' | 'prescription' | 'vaccination' | 'allergy' | 'surgery' | 'note' | 'other';

interface BloodRow { test_name: string; value: string; unit: string; reference_range: string; status: string; notes: string; }
interface RxRow { medication_name: string; dosage: string; frequency: string; duration: string; instructions: string; refills: number; }

export default function AddRecordPage() {
  const { user } = useAuth();
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ record_type: 'consultation' as RecordType, title: '', description: '', date: new Date().toISOString().slice(0, 10) });
  const [bloodRows, setBloodRows] = useState<BloodRow[]>([{ test_name: '', value: '', unit: '', reference_range: '', status: '', notes: '' }]);
  const [rxRows, setRxRows] = useState<RxRow[]>([{ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '', refills: 0 }]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState('other');
  const [fileDescription, setFileDescription] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (patientId) {
      api.get<User>(`/patients/${patientId}`).then(res => setPatient(res.data)).catch(console.error);
    }
  }, [patientId]);

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const updateBlood = (i: number, field: keyof BloodRow, value: string) => {
    setBloodRows(rows => rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };
  const updateRx = (i: number, field: keyof RxRow, value: string | number) => {
    setRxRows(rows => rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = {
        patient_id: patientId,
        record_type: form.record_type,
        title: form.title,
        description: form.description || undefined,
        date: form.date
      };
      if (form.record_type === 'blood_test') {
        payload.blood_results = bloodRows.filter(r => r.test_name && r.value);
      }
      if (form.record_type === 'prescription') {
        payload.prescriptions = rxRows.filter(r => r.medication_name && r.dosage && r.frequency);
      }
      const res = await api.post('/records', payload);
      

      // Upload file if selected
      if (uploadFile) {
        setUploadLoading(true);
        const fd = new FormData();
        fd.append('file', uploadFile);
        fd.append('patient_id', patientId!);
        fd.append('record_id', res.data.id);
        fd.append('file_category', fileCategory);
        if (fileDescription) fd.append('description', fileDescription);
        // Delete Content-Type so axios doesn't override the browser's
        // automatic multipart/form-data boundary for FormData uploads
        await api.post('/files/upload', fd, {
          transformRequest: [(data: unknown, headers: Record<string, unknown>) => {
            delete headers['Content-Type'];
            return data;
          }],
        });
        setUploadLoading(false);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    const base = user?.role === 'doctor' ? '/doctor' : '/nurse';
    navigate(`${base}/patients/${patientId}`);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Record Added!</h2>
          <p className="text-gray-600 mb-6">The medical record has been saved successfully for {patient?.first_name} {patient?.last_name}.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={goBack} className="btn-primary">View Patient Records</button>
            <button onClick={() => { setSuccess(false); setForm({ record_type: 'consultation', title: '', description: '', date: new Date().toISOString().slice(0, 10) }); }} className="btn-secondary">
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Add Medical Record</h1>
            {patient && <p className="text-sm text-gray-500">For: {patient.first_name} {patient.last_name}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Base Info */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Record Details</h2>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Record Type *</label>
                <select className="input-field" value={form.record_type} onChange={setField('record_type')} required>
                  {[
                    ['consultation', 'Consultation'],
                    ['blood_test', 'Blood Test'],
                    ['xray', 'X-Ray / Scan'],
                    ['prescription', 'Prescription'],
                    ['vaccination', 'Vaccination'],
                    ['allergy', 'Allergy'],
                    ['surgery', 'Surgery'],
                    ['note', 'Note'],
                    ['other', 'Other'],
                  ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Date *</label>
                <input type="date" className="input-field" value={form.date} onChange={setField('date')} required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Title / Summary *</label>
                <input type="text" className="input-field" placeholder="e.g. Annual blood panel, Chest X-ray, Hypertension follow-up..." value={form.title} onChange={setField('title')} required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Clinical Notes / Description</label>
                <textarea className="input-field resize-none" rows={4} placeholder="Findings, recommendations, observations..." value={form.description} onChange={setField('description')} />
              </div>
            </div>
          </div>

          {/* Blood Test Results */}
          {form.record_type === 'blood_test' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Blood Test Results</h2>
                <button type="button" onClick={() => setBloodRows(r => [...r, { test_name: '', value: '', unit: '', reference_range: '', status: '', notes: '' }])}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Row
                </button>
              </div>
              <div className="space-y-3">
                {bloodRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-6 gap-2 items-end">
                    <div className="col-span-2">
                      {i === 0 && <label className="label text-xs">Test Name</label>}
                      <input type="text" className="input-field text-sm py-2" placeholder="e.g. Hemoglobin" value={row.test_name} onChange={e => updateBlood(i, 'test_name', e.target.value)} />
                    </div>
                    <div>
                      {i === 0 && <label className="label text-xs">Value</label>}
                      <input type="text" className="input-field text-sm py-2" placeholder="13.5" value={row.value} onChange={e => updateBlood(i, 'value', e.target.value)} />
                    </div>
                    <div>
                      {i === 0 && <label className="label text-xs">Unit</label>}
                      <input type="text" className="input-field text-sm py-2" placeholder="g/dL" value={row.unit} onChange={e => updateBlood(i, 'unit', e.target.value)} />
                    </div>
                    <div>
                      {i === 0 && <label className="label text-xs">Status</label>}
                      <select className="input-field text-sm py-2" value={row.status} onChange={e => updateBlood(i, 'status', e.target.value)}>
                        <option value="">Normal</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      {i === 0 && <label className="label text-xs">&nbsp;</label>}
                      {bloodRows.length > 1 && (
                        <button type="button" onClick={() => setBloodRows(r => r.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescription */}
          {form.record_type === 'prescription' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Medications</h2>
                <button type="button" onClick={() => setRxRows(r => [...r, { medication_name: '', dosage: '', frequency: '', duration: '', instructions: '', refills: 0 }])}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Medication
                </button>
              </div>
              {rxRows.map((row, i) => (
                <div key={i} className={`${i > 0 ? 'pt-4 mt-4 border-t border-gray-100' : ''}`}>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="label text-xs">Medication Name</label>
                      <input type="text" className="input-field" placeholder="e.g. Metformin" value={row.medication_name} onChange={e => updateRx(i, 'medication_name', e.target.value)} />
                    </div>
                    <div>
                      <label className="label text-xs">Dosage</label>
                      <input type="text" className="input-field" placeholder="500mg" value={row.dosage} onChange={e => updateRx(i, 'dosage', e.target.value)} />
                    </div>
                    <div>
                      <label className="label text-xs">Frequency</label>
                      <input type="text" className="input-field" placeholder="Twice daily" value={row.frequency} onChange={e => updateRx(i, 'frequency', e.target.value)} />
                    </div>
                    <div>
                      <label className="label text-xs">Duration</label>
                      <input type="text" className="input-field" placeholder="30 days" value={row.duration} onChange={e => updateRx(i, 'duration', e.target.value)} />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="label text-xs">Refills</label>
                        <input type="number" className="input-field" min="0" value={row.refills} onChange={e => updateRx(i, 'refills', parseInt(e.target.value) || 0)} />
                      </div>
                      {rxRows.length > 1 && (
                        <button type="button" onClick={() => setRxRows(r => r.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-600 mb-0.5">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="sm:col-span-3">
                      <label className="label text-xs">Instructions / Notes</label>
                      <input type="text" className="input-field" placeholder="Take with food" value={row.instructions} onChange={e => updateRx(i, 'instructions', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* File Upload */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Attach File (Optional)</h2>
            <p className="text-sm text-gray-500 mb-4">Upload X-rays, scans, lab reports, or other documents (max 50MB, PDF/JPG/PNG)</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">File Category</label>
                <select className="input-field" value={fileCategory} onChange={e => setFileCategory(e.target.value)}>
                  <option value="xray">X-Ray</option>
                  <option value="scan">Scan (MRI/CT)</option>
                  <option value="lab_result">Lab Result</option>
                  <option value="report">Report</option>
                  <option value="prescription">Prescription</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">File Description</label>
                <input type="text" className="input-field" placeholder="e.g. Chest PA view" value={fileDescription} onChange={e => setFileDescription(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">{uploadFile ? uploadFile.name : 'Click to upload or drag & drop'}</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DICOM up to 50MB</p>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading || uploadLoading} className="btn-primary flex-1 py-3">
              {(loading || uploadLoading) ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : 'Save Record'}
            </button>
            <button type="button" onClick={goBack} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
