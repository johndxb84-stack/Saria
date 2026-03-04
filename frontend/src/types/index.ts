export type UserRole = 'doctor' | 'nurse' | 'patient';

export interface FamilyMember {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  is_active?: number;
  approved?: number;
  created_at?: string;
}

export type RecordType = 'consultation' | 'blood_test' | 'xray' | 'prescription' | 'vaccination' | 'allergy' | 'surgery' | 'note' | 'other';

export interface BloodResult {
  id: string;
  test_name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  status?: 'normal' | 'low' | 'high' | 'critical';
  notes?: string;
}

export interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  refills?: number;
}

export interface FileRecord {
  id: string;
  original_name: string;
  file_category: string;
  description?: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  record_id?: string;
  record_title?: string;
  uploaded_by_name?: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  created_by: string;
  created_by_name: string;
  record_type: RecordType;
  title: string;
  description?: string;
  date: string;
  created_at: string;
  blood_results: BloodResult[];
  prescriptions: Prescription[];
  files: FileRecord[];
}

export interface RecordSummary {
  total_records: number;
  by_type: { record_type: string; count: number }[];
  total_files: number;
  last_visit?: { date: string };
}
