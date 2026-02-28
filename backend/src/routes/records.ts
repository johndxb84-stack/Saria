import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import { authenticate, requireRole, AuthRequest, auditLog } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/records/:patientId - Get all records for a patient
router.get('/:patientId', auditLog('view_records'), (req: AuthRequest, res: Response): void => {
  const { patientId } = req.params;
  if (req.user!.role === 'patient' && req.user!.id !== patientId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const db = getDb();
  const records = db.prepare(`
    SELECT r.*, u.first_name || ' ' || u.last_name AS created_by_name
    FROM medical_records r
    JOIN users u ON r.created_by = u.id
    WHERE r.patient_id = ?
    ORDER BY r.date DESC, r.created_at DESC
  `).all(patientId);

  // For each record, fetch associated blood results, prescriptions, and files
  const enriched = records.map((record: any) => {
    const bloodResults = db.prepare('SELECT * FROM blood_results WHERE record_id = ?').all(record.id);
    const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE record_id = ?').all(record.id);
    const files = db.prepare(`
      SELECT id, original_name, file_category, description, created_at, file_size
      FROM files WHERE record_id = ?
    `).all(record.id);
    return { ...record, blood_results: bloodResults, prescriptions, files };
  });

  res.json(enriched);
});

// GET /api/records/:patientId/summary - Stats summary
router.get('/:patientId/summary', (req: AuthRequest, res: Response): void => {
  const { patientId } = req.params;
  if (req.user!.role === 'patient' && req.user!.id !== patientId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as count FROM medical_records WHERE patient_id = ?').get(patientId) as any).count;
  const byType = db.prepare(`
    SELECT record_type, COUNT(*) as count FROM medical_records WHERE patient_id = ? GROUP BY record_type
  `).all(patientId);
  const files = (db.prepare('SELECT COUNT(*) as count FROM files WHERE patient_id = ?').get(patientId) as any).count;
  const last = db.prepare('SELECT date FROM medical_records WHERE patient_id = ? ORDER BY date DESC LIMIT 1').get(patientId);
  res.json({ total_records: total, by_type: byType, total_files: files, last_visit: last });
});

// POST /api/records - Create a new medical record (doctor/nurse)
router.post('/', requireRole('doctor', 'nurse'), (req: AuthRequest, res: Response): void => {
  const {
    patient_id, record_type, title, description, date,
    blood_results, prescriptions
  } = req.body;

  if (!patient_id || !record_type || !title || !date) {
    res.status(400).json({ error: 'patient_id, record_type, title, and date are required' });
    return;
  }

  const db = getDb();
  // Verify patient exists
  const patient = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'patient'").get(patient_id);
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }

  const recordId = uuidv4();
  db.prepare(`
    INSERT INTO medical_records (id, patient_id, created_by, record_type, title, description, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(recordId, patient_id, req.user!.id, record_type, title.trim(), description || null, date);

  // Insert blood results if provided
  if (Array.isArray(blood_results) && blood_results.length > 0) {
    const insertBlood = db.prepare(`
      INSERT INTO blood_results (id, record_id, patient_id, test_name, value, unit, reference_range, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const br of blood_results) {
      insertBlood.run(uuidv4(), recordId, patient_id, br.test_name, br.value, br.unit || null, br.reference_range || null, br.status || null, br.notes || null);
    }
  }

  // Insert prescriptions if provided
  if (Array.isArray(prescriptions) && prescriptions.length > 0) {
    const insertRx = db.prepare(`
      INSERT INTO prescriptions (id, record_id, patient_id, medication_name, dosage, frequency, duration, instructions, refills)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const rx of prescriptions) {
      insertRx.run(uuidv4(), recordId, patient_id, rx.medication_name, rx.dosage, rx.frequency, rx.duration || null, rx.instructions || null, rx.refills || 0);
    }
  }

  res.status(201).json({ message: 'Record created', id: recordId });
});

// PUT /api/records/:id - Update a record (doctor/nurse)
router.put('/:id', requireRole('doctor', 'nurse'), (req: AuthRequest, res: Response): void => {
  const { title, description, date, record_type } = req.body;
  const db = getDb();
  const record = db.prepare('SELECT id FROM medical_records WHERE id = ?').get(req.params.id);
  if (!record) {
    res.status(404).json({ error: 'Record not found' });
    return;
  }
  db.prepare(`
    UPDATE medical_records SET title = COALESCE(?, title), description = COALESCE(?, description),
    date = COALESCE(?, date), record_type = COALESCE(?, record_type), updated_at = datetime('now')
    WHERE id = ?
  `).run(title || null, description || null, date || null, record_type || null, req.params.id);
  res.json({ message: 'Record updated' });
});

// DELETE /api/records/:id - Doctor only
router.delete('/:id', requireRole('doctor'), (req: AuthRequest, res: Response): void => {
  const db = getDb();
  const result = db.prepare('DELETE FROM medical_records WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Record not found' });
    return;
  }
  res.json({ message: 'Record deleted' });
});

// GET /api/records/blood/:patientId - All blood results for a patient
router.get('/blood/:patientId', auditLog('view_blood_results'), (req: AuthRequest, res: Response): void => {
  const { patientId } = req.params;
  if (req.user!.role === 'patient' && req.user!.id !== patientId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  const db = getDb();
  const results = db.prepare(`
    SELECT br.*, r.date, r.title as record_title
    FROM blood_results br
    JOIN medical_records r ON br.record_id = r.id
    WHERE br.patient_id = ?
    ORDER BY r.date DESC
  `).all(patientId);
  res.json(results);
});

export default router;
