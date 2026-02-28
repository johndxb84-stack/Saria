import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema(): void {
  const database = db;

  // Users table (patients, nurses, doctor)
  database.exec(`
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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Medical records table
  database.exec(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      record_type TEXT NOT NULL CHECK(record_type IN ('consultation', 'blood_test', 'xray', 'prescription', 'vaccination', 'allergy', 'surgery', 'note', 'other')),
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      is_confidential INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // Blood results table
  database.exec(`
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
    );
  `);

  // Files table (X-rays, documents, reports)
  database.exec(`
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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES users(id),
      FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE SET NULL,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );
  `);

  // Prescriptions table
  database.exec(`
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
    );
  `);

  // Audit log for security/privacy compliance
  database.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      ip_address TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed the doctor account if not exists
  seedDoctor(database);
}

function seedDoctor(database: Database.Database): void {
  const existing = database.prepare('SELECT id FROM users WHERE email = ?').get('dr.saria@clinic.ae');
  if (!existing) {
    const bcryptjs = require('bcryptjs');
    const hash = bcryptjs.hashSync('DrSaria2024!', 12);
    const { v4: uuidv4 } = require('uuid');
    database.prepare(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active, approved)
      VALUES (?, ?, ?, 'doctor', 'Saria', 'El Hachem', '+971-XX-XXX-XXXX', 1, 1)
    `).run(uuidv4(), 'dr.saria@clinic.ae', hash);
    console.log('✅ Doctor account seeded: dr.saria@clinic.ae / DrSaria2024!');
  }
}

export default getDb;
