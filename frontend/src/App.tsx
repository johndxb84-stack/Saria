import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import PatientRecordsPage from './pages/PatientRecordsPage';
import AddRecordPage from './pages/AddRecordPage';
import ProfilePage from './pages/ProfilePage';
import StaffManagementPage from './pages/StaffManagementPage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/60"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
  if (user.role === 'nurse') return <Navigate to="/nurse" replace />;
  return <Navigate to="/patient" replace />;
}

function App() {
  return (
    <AuthProvider>
      {/* ── Global liquid-glass background (lighter blue) ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600" />
        <div className="orb   absolute -top-32  -left-32  w-[620px] h-[620px] rounded-full bg-sky-200/45   blur-[130px]" />
        <div className="orb-2 absolute top-1/3  -right-24  w-[500px] h-[500px] rounded-full bg-blue-200/38  blur-[110px]" />
        <div className="orb-3 absolute bottom-0 left-1/4   w-[520px] h-[520px] rounded-full bg-cyan-200/35  blur-[120px]" />
        <div className="orb-4 absolute -bottom-20 right-1/3 w-[380px] h-[380px] rounded-full bg-white/22   blur-[90px]" />
      </div>

      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Dashboard redirect */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

          {/* Patient routes */}
          <Route path="/patient" element={
            <ProtectedRoute roles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/records" element={
            <ProtectedRoute roles={['patient']}>
              <PatientRecordsPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/profile" element={
            <ProtectedRoute roles={['patient']}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Doctor routes */}
          <Route path="/doctor" element={
            <ProtectedRoute roles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients/:patientId" element={
            <ProtectedRoute roles={['doctor', 'nurse']}>
              <PatientRecordsPage />
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients/:patientId/add-record" element={
            <ProtectedRoute roles={['doctor', 'nurse']}>
              <AddRecordPage />
            </ProtectedRoute>
          } />
          <Route path="/doctor/staff" element={
            <ProtectedRoute roles={['doctor']}>
              <StaffManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/doctor/profile" element={
            <ProtectedRoute roles={['doctor']}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Nurse routes */}
          <Route path="/nurse" element={
            <ProtectedRoute roles={['nurse']}>
              <NurseDashboard />
            </ProtectedRoute>
          } />
          <Route path="/nurse/patients/:patientId" element={
            <ProtectedRoute roles={['doctor', 'nurse']}>
              <PatientRecordsPage />
            </ProtectedRoute>
          } />
          <Route path="/nurse/patients/:patientId/add-record" element={
            <ProtectedRoute roles={['doctor', 'nurse']}>
              <AddRecordPage />
            </ProtectedRoute>
          } />
          <Route path="/nurse/profile" element={
            <ProtectedRoute roles={['nurse']}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
