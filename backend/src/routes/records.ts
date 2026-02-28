import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/database';
import { authenticate, requireRole, AuthRequest, auditLog } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/records/:patientId - Get all records for a patient
router.get('/:patientId', auditLog('view_records'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { patientId } = req.params;
  if (req.user!.role === 'patient' && req.user!.id !== patientId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  try {
    const recordsResult = await pool.query(`
      SELECT r.*, u.first_name || ' ' || u.last_name AS created_by_name
      FROM medical_records r
      JOIN users u ON r.created_by = u.id
      WHERE r.patient_id = $1
      ORDER BY r.date DESC, r.created_at DESC
    `, [patientId]);

    const enriched = await Promise.all(recordsResult.rows.map(async (record: any) => {
      const [bloodResults, prescriptions, files] = await Promise.all([
        pool.query('SELECT * FROM blood_results WHERE record_id = $1', [record.id]),
        pool.query('SELECT * FROM prescriptions WHERE record_id = $1', [record.id]),
        pool.query('SELECT id, original_name, file_category, description, created_at, file_size FROM files WHERE record_id = $1', [record.id]),
      ]);
      return { ...record, blood_results: bloodResults.rows, prescriptions: prescriptions.rows, files: files.rows };
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// GET /api/records/:patientId/summary - Stats summary
router.get('/:patientId/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  const { patientId } = req.params;
  if (req.user!.role === 'patient' && req.user!.id !== patientId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  try {
    const [totalResult, byTypeResult, filesResult, lastResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM medical_records WHERE patient_id = $1', [patientId]),
      pool.query('SELECT record_type, COUNT(*) as count FROM medical_records WHERE patient_id = $1 GROUP BY record_type', [patientId]),
      pool.query('SELECT COUNT(*) as count FROM files WHERE patient_id = $1', [patientId]),
      pool.query('SELECT date FROM medical_records WHERE patient_id = $1 ORDER BY date DESC LIMIT 1', [patientId]),
    ]);
    res.json({
      total_records: parseInt(totalResult.rows[0].count),
      by_type: byTypeResult.rows,
      total_files: parseInt(filesResult.rows[0].count),
      last_visit: lastResult.rows[0] || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// POST /api/records - Create a new medical record (doctor/nurse)
router.post('/', requireRole('doctor', 'nurse'), async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    patient_id, record_type, title, description, date,
    blood_results, prescriptions
  } = req.body;

  if (!patient_id || !record_type || !title || !date) {
    res.status(400).json({ error: 'patient_id, record_type, title, and date are required' });
    return;
  }

  try {
    const patientCheck = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'patient'", [patient_id]);
    if (patientCheck.rows.length === 0) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const recordId = uuidv4();
    await pool.query(
      `INSERT INTO medical_records (id, patient_id, created_by, record_type, title, description, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [recordId, patient_id, req.user!.id, record_type, title.trim(), description || null, date]
    );

    if (Array.isArray(blood_results) && blood_results.length > 0) {
      for (const br of blood_results) {
        await pool.query(
          `INSERT INTO blood_results (id, record_id, patient_id, test_name, value, unit, reference_range, status, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [uuidv4(), recordId, patient_id, br.test_name, br.value, br.unit || null, br.reference_range || null, br.status || null, br.notes || null]
        );
      }
    }

    if (Array.isArray(prescriptions) && prescriptions.length > 0) {
      for (const rx of prescriptions) {
        await pool.query(
          `INSERT INTO prescriptions (id, record_id, patient_id, medication_name, dosage, frequency, duration, instructions, refills)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [uuidv4(), recordId, patient_id, rx.medication_name, rx.dosage, rx.frequency, rx.duration || null, rx.instructions || null, rx.refills || 0]
        );
      }
    }

    res.status(201).json({ message: 'Record created', id: recordId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// PUT /api/records/:id - Update a record (doctor/nurse)
router.put('/:id', requireRole('doctor', 'nurse'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, date, record_type } = req.body;
  try {
    const check = await pool.query('SELECT id FROM medical_records WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    await pool.query(
      `UPDATE medical_records
       SET title = COALESCE($1, title), description = COALESCE($2, description),
           date = COALESCE($3, date), record_type = COALESCE($4, record_type), updated_at = NOW()
       WHERE id = $5`,
      [title || null, description || null, date || null, record_type || null, req.params.id]
    );
    res.json({ message: 'Record updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE /api/records/:id - Doctor only
router.delete('/:id', requireRole('doctor'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('DELETE FROM medical_records WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    res.json({ message: 'Record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// GET /api/records/blood/:patientId - All blood results for a patient
router.get('/blood/:patientId', auditLog('view_blood_results'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { patientId } = req.params;
  if (req.user!.role === 'patient' && req.user!.id !== patientId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  try {
    const result = await pool.query(`
      SELECT br.*, r.date, r.title as record_title
      FROM blood_results br
      JOIN medical_records r ON br.record_id = r.id
      WHERE br.patient_id = $1
      ORDER BY r.date DESC
    `, [patientId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blood results' });
  }
});

export default router;
