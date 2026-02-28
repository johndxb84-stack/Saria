import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import { authenticate, requireRole, AuthRequest, auditLog } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/patients - Doctor/Nurse: list all patients
router.get('/', requireRole('doctor', 'nurse'), auditLog('list_patients'), (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const patients = db.prepare(`
    SELECT id, email, first_name, last_name, phone, date_of_birth, gender, address,
           emergency_contact, emergency_phone, is_active, approved, created_at
    FROM users WHERE role = 'patient'
    ORDER BY last_name, first_name
  `).all();
  res.json(patients);
});

// GET /api/patients/pending - Doctor only: pending approvals
router.get('/pending', requireRole('doctor'), (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const patients = db.prepare(`
    SELECT id, email, first_name, last_name, phone, date_of_birth, gender, created_at
    FROM users WHERE role = 'patient' AND approved = 0 AND is_active = 1
    ORDER BY created_at DESC
  `).all();
  res.json(patients);
});

// GET /api/patients/me - Patient: own profile
router.get('/me', (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const patient = db.prepare(`
    SELECT id, email, first_name, last_name, phone, date_of_birth, gender, address,
           emergency_contact, emergency_phone, created_at
    FROM users WHERE id = ?
  `).get(req.user!.id);
  res.json(patient);
});

// GET /api/patients/:id - Doctor/Nurse or self
router.get('/:id', auditLog('view_patient'), (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  if (req.user!.role === 'patient' && req.user!.id !== id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const db = getDb();
  const patient = db.prepare(`
    SELECT id, email, first_name, last_name, phone, date_of_birth, gender, address,
           emergency_contact, emergency_phone, is_active, approved, created_at
    FROM users WHERE id = ? AND role = 'patient'
  `).get(id);
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }
  res.json(patient);
});

// PUT /api/patients/:id/approve - Doctor only
router.put('/:id/approve', requireRole('doctor'), (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const result = db.prepare(
    "UPDATE users SET approved = 1, updated_at = datetime('now') WHERE id = ? AND role = 'patient'"
  ).run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }
  res.json({ message: 'Patient approved successfully' });
});

// PUT /api/patients/:id/deactivate - Doctor only
router.put('/:id/deactivate', requireRole('doctor'), (req: AuthRequest, res: Response): void => {
  const db = getDb();
  db.prepare("UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ? AND role = 'patient'").run(req.params.id);
  res.json({ message: 'Patient deactivated' });
});

// PUT /api/patients/:id/reactivate - Doctor only
router.put('/:id/reactivate', requireRole('doctor'), (req: AuthRequest, res: Response): void => {
  const db = getDb();
  db.prepare("UPDATE users SET is_active = 1, updated_at = datetime('now') WHERE id = ? AND role = 'patient'").run(req.params.id);
  res.json({ message: 'Patient reactivated' });
});

// PUT /api/patients/me/profile - Patient updates own profile
router.put('/me/profile', (req: AuthRequest, res: Response): void => {
  const { phone, address, emergency_contact, emergency_phone } = req.body;
  const db = getDb();
  db.prepare(`
    UPDATE users SET phone = ?, address = ?, emergency_contact = ?, emergency_phone = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(phone || null, address || null, emergency_contact || null, emergency_phone || null, req.user!.id);
  res.json({ message: 'Profile updated' });
});

// POST /api/patients/nurse - Doctor creates a nurse account
router.post('/create-nurse', requireRole('doctor'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, first_name, last_name, phone } = req.body;
  if (!email || !password || !first_name || !last_name) {
    res.status(400).json({ error: 'All fields required' });
    return;
  }
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  const id = uuidv4();
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active, approved)
    VALUES (?, ?, ?, 'nurse', ?, ?, ?, 1, 1)
  `).run(id, email.toLowerCase().trim(), hash, first_name.trim(), last_name.trim(), phone || null);
  res.status(201).json({ message: 'Nurse account created', id });
});

// GET /api/patients/staff/list - Doctor: list nurses
router.get('/staff/list', requireRole('doctor'), (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const staff = db.prepare(`
    SELECT id, email, first_name, last_name, phone, role, is_active, created_at
    FROM users WHERE role = 'nurse'
    ORDER BY last_name
  `).all();
  res.json(staff);
});

export default router;
