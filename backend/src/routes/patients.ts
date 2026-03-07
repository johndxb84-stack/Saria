import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/database';
import { authenticate, requireRole, AuthRequest, auditLog, isFamilyMember } from '../middleware/auth';
import { sendDeactivationNotification, sendReactivationNotification } from '../services/email';

const router = Router();
router.use(authenticate);

// GET /api/patients - Doctor/Nurse: list all patients
router.get('/', requireRole('doctor', 'nurse'), auditLog('list_patients'), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, phone, date_of_birth, gender, address,
             emergency_contact, emergency_phone, id_type, id_number, is_active, approved, created_at
      FROM users WHERE role = 'patient'
      ORDER BY last_name, first_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /api/patients/me - Patient: own profile
router.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, phone, date_of_birth, gender, address,
             emergency_contact, emergency_phone, id_type, id_number, created_at
      FROM users WHERE id = $1
    `, [req.user!.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/patients/staff/list - Doctor: list nurses
router.get('/staff/list', requireRole('doctor'), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, phone, role, is_active, created_at
      FROM users WHERE role = 'nurse'
      ORDER BY last_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// GET /api/patients/:id - Doctor/Nurse or self or family member
router.get('/:id', auditLog('view_patient'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (req.user!.role === 'patient' && req.user!.id !== id) {
    if (!await isFamilyMember(req.user!.email, id)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
  }
  try {
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, phone, date_of_birth, gender, address,
             emergency_contact, emergency_phone, id_type, id_number, is_active, approved, created_at
      FROM users WHERE id = $1 AND role = 'patient'
    `, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// PUT /api/patients/:id/deactivate - Doctor/Nurse
router.put('/:id/deactivate', requireRole('doctor', 'nurse'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientResult = await pool.query(
      "SELECT email, first_name, last_name FROM users WHERE id = $1 AND role = 'patient'",
      [req.params.id]
    );
    await pool.query("UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = $1 AND role = 'patient'", [req.params.id]);
    if (patientResult.rows.length > 0) {
      sendDeactivationNotification(patientResult.rows[0]).catch(e => console.error('Email error (deactivation):', e));
    }
    res.json({ message: 'Patient deactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to deactivate patient' });
  }
});

// PUT /api/patients/:id/reactivate - Doctor/Nurse
router.put('/:id/reactivate', requireRole('doctor', 'nurse'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientResult = await pool.query(
      "SELECT email, first_name, last_name FROM users WHERE id = $1 AND role = 'patient'",
      [req.params.id]
    );
    await pool.query("UPDATE users SET is_active = 1, updated_at = NOW() WHERE id = $1 AND role = 'patient'", [req.params.id]);
    if (patientResult.rows.length > 0) {
      sendReactivationNotification(patientResult.rows[0]).catch(e => console.error('Email error (reactivation):', e));
    }
    res.json({ message: 'Patient reactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reactivate patient' });
  }
});

// PUT /api/patients/me/profile - Patient updates own profile
router.put('/me/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  const { phone, address, emergency_contact, emergency_phone } = req.body;
  try {
    await pool.query(
      'UPDATE users SET phone = $1, address = $2, emergency_contact = $3, emergency_phone = $4, updated_at = NOW() WHERE id = $5',
      [phone || null, address || null, emergency_contact || null, emergency_phone || null, req.user!.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/patients/:id/reset-password - Doctor only
router.put('/:id/reset-password', requireRole('doctor'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { password } = req.body;
  if (!password || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }
  try {
    const result = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'patient'", [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.params.id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// POST /api/patients/create-nurse - Doctor creates a nurse account
router.post('/create-nurse', requireRole('doctor'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, first_name, last_name, phone } = req.body;
  if (!email || !password || !first_name || !last_name) {
    res.status(400).json({ error: 'All fields required' });
    return;
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active, approved)
       VALUES ($1, $2, $3, 'nurse', $4, $5, $6, 1, 1)`,
      [id, email.toLowerCase().trim(), hash, first_name.trim(), last_name.trim(), phone || null]
    );
    res.status(201).json({ message: 'Nurse account created', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create nurse account' });
  }
});

export default router;
