import { Router, Response, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import { authenticate, requireRole, AuthRequest, auditLog } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, _file, cb) => cb(null, `${uuidv4()}${path.extname(_file.originalname)}`)
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'image/dicom', 'application/dicom',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// POST /api/files/upload - Upload a file (doctor/nurse)
router.post('/upload', requireRole('doctor', 'nurse'), upload.single('file'), (req: AuthRequest, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const { patient_id, record_id, file_category, description } = req.body;
  if (!patient_id || !file_category) {
    fs.unlinkSync(req.file.path);
    res.status(400).json({ error: 'patient_id and file_category required' });
    return;
  }

  const db = getDb();
  const patient = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'patient'").get(patient_id);
  if (!patient) {
    fs.unlinkSync(req.file.path);
    res.status(404).json({ error: 'Patient not found' });
    return;
  }

  const fileId = uuidv4();
  db.prepare(`
    INSERT INTO files (id, patient_id, record_id, uploaded_by, file_name, original_name, mime_type, file_size, file_category, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    fileId, patient_id, record_id || null, req.user!.id,
    req.file.filename, req.file.originalname,
    req.file.mimetype, req.file.size,
    file_category, description || null
  );

  res.status(201).json({
    message: 'File uploaded successfully',
    id: fileId,
    original_name: req.file.originalname,
    file_category
  });
});

// GET /api/files/:patientId - List all files for a patient
router.get('/:patientId', auditLog('view_files'), (req: AuthRequest, res: Response): void => {
  const { patientId } = req.params;
  if (req.user!.role === 'patient' && req.user!.id !== patientId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const db = getDb();
  const files = db.prepare(`
    SELECT f.id, f.original_name, f.file_category, f.description, f.file_size, f.mime_type,
           f.created_at, f.record_id, r.title as record_title,
           u.first_name || ' ' || u.last_name as uploaded_by_name
    FROM files f
    LEFT JOIN medical_records r ON f.record_id = r.id
    JOIN users u ON f.uploaded_by = u.id
    WHERE f.patient_id = ?
    ORDER BY f.created_at DESC
  `).all(patientId);
  res.json(files);
});

// GET /api/files/download/:fileId - Download a file
router.get('/download/:fileId', auditLog('download_file'), (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.fileId) as {
    file_name: string; original_name: string; mime_type: string; patient_id: string;
  } | undefined;

  if (!file) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  if (req.user!.role === 'patient' && req.user!.id !== file.patient_id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const filePath = path.join(UPLOADS_DIR, file.file_name);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found on server' });
    return;
  }

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.original_name)}"`);
  res.setHeader('Content-Type', file.mime_type);
  res.sendFile(filePath);
});

// DELETE /api/files/:fileId - Doctor only
router.delete('/:fileId', requireRole('doctor'), (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.fileId) as {
    file_name: string; id: string;
  } | undefined;
  if (!file) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const filePath = path.join(UPLOADS_DIR, file.file_name);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  db.prepare('DELETE FROM files WHERE id = ?').run(file.id);
  res.json({ message: 'File deleted' });
});

export default router;
