import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/database';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';
import { sendRegistrationConfirmation, sendNewPatientAlert, sendPasswordResetEmail } from '../services/email';

const router = Router();

// POST /api/auth/register - Patient self-registration
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const {
    email, password, first_name, last_name,
    phone, date_of_birth, gender, address,
    emergency_contact, emergency_phone,
    id_type, id_number
  } = req.body;

  if (!email || !password || !first_name || !last_name) {
    res.status(400).json({ error: 'Email, password, first name and last name are required' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }
  if (!id_type || !['eid', 'passport'].includes(id_type)) {
    res.status(400).json({ error: 'Please indicate your residency status and provide your ID number' });
    return;
  }
  if (!id_number || !id_number.trim()) {
    res.status(400).json({ error: id_type === 'eid' ? 'Emirates ID number is required' : 'Passport number is required' });
    return;
  }
  if (id_type === 'eid' && !/^784-\d{4}-\d{7}-\d$/.test(id_number.trim())) {
    res.status(400).json({ error: 'Invalid Emirates ID format. It must follow the pattern: 784-XXXX-XXXXXXX-X' });
    return;
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, date_of_birth, gender, address, emergency_contact, emergency_phone, id_type, id_number, approved)
       VALUES ($1, $2, $3, 'patient', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0)`,
      [id, email.toLowerCase().trim(), hash, first_name.trim(), last_name.trim(),
       phone || null, date_of_birth || null, gender || null, address || null,
       emergency_contact || null, emergency_phone || null,
       id_type, id_number.trim()]
    );

    const newPatient = { id, first_name: first_name.trim(), last_name: last_name.trim(), email: email.toLowerCase().trim(), phone: phone || null, date_of_birth: date_of_birth || null, gender: gender || null };

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

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, role, first_name, last_name, is_active, approved FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0] as {
      id: string; email: string; password_hash: string; role: string;
      first_name: string; last_name: string; is_active: number; approved: number;
    };

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, first_name, last_name, phone, date_of_birth, gender, address, emergency_contact, emergency_phone, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 8) {
    res.status(400).json({ error: 'Valid current and new password (min 8 chars) required' });
    return;
  }

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user!.id]);
    const user = result.rows[0] as { password_hash: string };
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const hash = await bcrypt.hash(new_password, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.user!.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  // Always respond the same way to prevent email enumeration
  const genericMessage = 'If an account exists for that email, a reset link has been sent.';

  try {
    // Ensure the table exists (failsafe if initializeSchema missed it)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      )
    `);

    const result = await pool.query(
      'SELECT id, first_name, email FROM users WHERE email = $1 AND is_active = 1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      res.json({ message: genericMessage });
      return;
    }

    const user = result.rows[0] as { id: string; first_name: string; email: string };

    // Delete any existing token for this user
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

    // Create a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [token, user.id, expiresAt]
    );

    const portalUrl = process.env.FRONTEND_URL || 'https://drsariaelhachem.com';
    const resetUrl = `${portalUrl}/reset-password?token=${token}`;

    sendPasswordResetEmail(user, resetUrl).catch(e => console.error('Email error (password reset):', e));

    res.json({ message: genericMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    res.status(400).json({ error: 'Valid token and new password (min 8 characters) are required' });
    return;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      )
    `);

    const result = await pool.query(
      'SELECT token, user_id, expires_at FROM password_reset_tokens WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' });
      return;
    }

    const record = result.rows[0] as { token: string; user_id: string; expires_at: string };

    if (new Date(record.expires_at) < new Date()) {
      await pool.query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
      res.status(400).json({ error: 'This reset link has expired. Please request a new one.' });
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hash, record.user_id]
    );

    // Delete the token so it can't be reused
    await pool.query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
