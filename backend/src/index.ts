import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initializeSchema } from './db/database';

dotenv.config();

import authRouter from './routes/auth';
import patientsRouter from './routes/patients';
import recordsRouter from './routes/records';
import filesRouter from './routes/files';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://drsariaelhachem.com',
  'https://www.drsariaelhachem.com',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:3000'] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/records', recordsRouter);
app.use('/api/files', filesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Saria Patient Portal API', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Global JSON error handler — must be defined after all routes.
// Ensures errors (including JSON body-parse failures and multer errors)
// always return a JSON response so the frontend can display them correctly.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    return;
  }
  if (err.message === 'File type not allowed') {
    res.status(400).json({ error: 'File type not allowed. Please upload a PDF, JPG, PNG, or DICOM file.' });
    return;
  }
  // express.json() parse failures arrive here with err.type === 'entity.parse.failed'
  if (err.type === 'entity.parse.failed' || err.status === 400) {
    res.status(400).json({ error: 'Invalid request body.' });
    return;
  }
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'An unexpected error occurred.' });
});

initializeSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🏥 Dr. Saria El Hachem Patient Portal API`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });

export default app;
