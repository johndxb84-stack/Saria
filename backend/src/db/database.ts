import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initializeSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('doctor', 'nurse', 'patient')),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      date_of_birth TEXT,
      gender TEXT,
      address TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      approved INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      record_type TEXT NOT NULL CHECK(record_type IN ('consultation', 'blood_test', 'xray', 'prescription', 'vaccination', 'allergy', 'surgery', 'note', 'other')),
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      is_confidential INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (patient_id) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blood_results (
      id TEXT PRIMARY KEY,
      record_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      test_name TEXT NOT NULL,
      value TEXT NOT NULL,
      unit TEXT,
      reference_range TEXT,
      status TEXT CHECK(status IN ('normal', 'low', 'high', 'critical')),
      notes TEXT,
      FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      record_id TEXT,
      uploaded_by TEXT NOT NULL,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_category TEXT NOT NULL CHECK(file_category IN ('xray', 'scan', 'report', 'prescription', 'lab_result', 'other')),
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (patient_id) REFERENCES users(id),
      FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE SET NULL,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      record_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      duration TEXT,
      instructions TEXT,
      refills INTEGER DEFAULT 0,
      FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      ip_address TEXT,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await seedDoctor();
}

async function seedDoctor(): Promise<void> {
  const result = await pool.query('SELECT id FROM users WHERE email = $1', ['dr.saria@clinic.ae']);
  if (result.rows.length === 0) {
    const hash = await bcrypt.hash('DrSaria2024!', 12);
    const id = uuidv4();
    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active, approved)
       VALUES ($1, $2, $3, 'doctor', 'Saria', 'El Hachem', '+971-XX-XXX-XXXX', 1, 1)`,
      [id, 'dr.saria@clinic.ae', hash]
    );
    console.log('✅ Doctor account seeded: dr.saria@clinic.ae / DrSaria2024!');
  }
}

export default pool;
