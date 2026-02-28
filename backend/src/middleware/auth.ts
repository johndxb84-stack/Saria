import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export interface AuthUser {
  id: string;
  email: string;
  role: 'doctor' | 'nurse' | 'patient';
  first_name: string;
  last_name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'doctor' | 'nurse' | 'patient' };
    const result = await pool.query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1 AND is_active = 1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }
    req.user = result.rows[0] as AuthUser;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export function canAccessPatientData(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const patientId = req.params.patientId || req.body.patient_id;
  if (req.user.role === 'patient' && patientId && patientId !== req.user.id) {
    res.status(403).json({ error: 'Access denied to this patient data' });
    return;
  }
  next();
}

export function auditLog(action: string) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (req.user) {
      try {
        await pool.query(
          `INSERT INTO audit_log (id, user_id, action, target_type, target_id, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            uuidv4(),
            req.user.id,
            action,
            req.params.patientId ? 'patient' : null,
            req.params.patientId || null,
            req.ip
          ]
        );
      } catch { /* non-blocking */ }
    }
    next();
  };
}
