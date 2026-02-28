# Dr. Saria El Hachem — Patient Portal

A secure, full-stack web application for managing patient medical records for Dr. Saria El Hachem's Family Medicine practice in Dubai.

## Features

### Public Website
- Doctor biography, qualifications, and experience
- Medical services offered
- Clinic hours and contact information

### Patient Portal
- Secure patient registration (requires doctor approval)
- Unique login credentials per patient
- View all personal medical records
- Blood test results with reference ranges and status
- X-rays and medical file downloads
- Prescriptions and medication history
- Vaccination records and consultation notes

### Staff Portal
- **Doctor (Dr. El Hachem):** Full access — approve patients, view all records, manage nurses
- **Nurses:** Add/update medical records and upload files for all patients
- **Patients:** View only their own data

### Security
- JWT authentication (8-hour sessions)
- bcrypt password hashing (12 rounds)
- Role-based access control (RBAC)
- Patients can only access their own data
- Audit logging for all sensitive data access
- Secure file uploads with MIME-type validation
- Security headers (XSS, clickjacking protection)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT + bcryptjs |
| File uploads | Multer |

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm 9+

### Install dependencies
```bash
npm run install:all
```

### Configure environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set a strong JWT_SECRET
```

### Run in development
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Run in production
```bash
npm run build
NODE_ENV=production npm start
```

## Default Doctor Account

On first run, the doctor account is automatically created:
- **Email:** `dr.saria@clinic.ae`
- **Password:** `DrSaria2024!`

> ⚠️ **Change the doctor password immediately after first login in production.**

## User Roles

| Role | Access |
|------|--------|
| `doctor` | All patients, approve registrations, manage nurses, full CRUD |
| `nurse` | View all approved patients, add/update records, upload files |
| `patient` | Own records only, download files, update contact info |

## API Endpoints

### Auth
- `POST /api/auth/register` — Patient self-registration
- `POST /api/auth/login` — Login (all roles)
- `GET /api/auth/me` — Get current user
- `PUT /api/auth/change-password` — Change password

### Patients (doctor/nurse)
- `GET /api/patients` — List all patients
- `GET /api/patients/pending` — Pending approvals
- `PUT /api/patients/:id/approve` — Approve patient
- `POST /api/patients/create-nurse` — Create nurse account

### Records
- `GET /api/records/:patientId` — Get all records
- `POST /api/records` — Create a record (with blood results, prescriptions)
- `PUT /api/records/:id` — Update a record
- `DELETE /api/records/:id` — Delete a record (doctor only)

### Files
- `POST /api/files/upload` — Upload a file
- `GET /api/files/:patientId` — List patient's files
- `GET /api/files/download/:fileId` — Download a file
- `DELETE /api/files/:fileId` — Delete a file (doctor only)

## Privacy & Compliance

- All patient data is stored locally (no third-party data sharing)
- Files are stored server-side in a secure directory
- Access control enforced at both API and database level
- Audit log captures all sensitive record access with timestamps
- Passwords are never stored in plain text
