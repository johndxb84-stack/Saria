import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';
import { sendRegistrationConfirmation, sendNewPatientAlert } from '../services/email';

const router = Router();

// POST /api/auth/register - Patient self-registration
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const {
    email, password, first_name, last_name,
    phone, date_of_birth, gender, address,
    emergency_contact, emergency_phone
  } = req.body;

  if (!email || !password || !first_name || !last_name) {
    res.status(400).json({ error: 'Email, password, first name and last name are required' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, date_of_birth, gender, address, emergency_contact, emergency_phone, approved)
      VALUES (?, ?, ?, 'patient', ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(id, email.toLowerCase().trim(), hash, first_name.trim(), last_name.trim(), phone || null, date_of_birth || null, gender || null, address || null, emergency_contact || null, emergency_phone || null);

    const newPatient = { id, first_name: first_name.trim(), last_name: last_name.trim(), email: email.toLowerCase().trim(), phone: phone || null, date_of_birth: date_of_birth || null, gender: gender || null };

    // Fire-and-forget emails — don't block the response
    sendRegistrationConfirmation(newPatient).catch(e => console.error('Email error (registration confirmation):', e));
    sendNewPatientAlert(newPatient).catch(e => console.error('Email error (new patient alert):', e));

    res.status(201).json({
      message: 'Registration successful. Your account is pending approval by Dr. El Hachem. You will be notified by email once activated.',
      id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const db = getDb();
  const user = db.prepare(
    'SELECT id, email, password_hash, role, first_name, last_name, is_active, approved FROM users WHERE email = ?'
  ).get(email.toLowerCase().trim()) as {
    id: string; email: string; password_hash: string; role: string;
    first_name: string; last_name: string; is_active: number; approved: number;
  } | undefined;

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  if (!user.is_active) {
    res.status(403).json({ error: 'Your account has been deactivated. Please contact the clinic.' });
    return;
  }
  if (user.role === 'patient' && !user.approved) {
    res.status(403).json({ error: 'Your account is pending approval by Dr. El Hachem. Please check back soon.' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role as 'doctor' | 'nurse' | 'patient',
    first_name: user.first_name,
    last_name: user.last_name
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    }
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const user = db.prepare(
    'SELECT id, email, role, first_name, last_name, phone, date_of_birth, gender, address, emergency_contact, emergency_phone, created_at FROM users WHERE id = ?'
  ).get(req.user!.id);
  res.json(user);
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 8) {
    res.status(400).json({ error: 'Valid current and new password (min 8 chars) required' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as { password_hash: string };
  const valid = await bcrypt.compare(current_password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  const hash = await bcrypt.hash(new_password, 12);
  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(hash, req.user!.id);
  res.json({ message: 'Password updated successfully' });
});

export default router;
