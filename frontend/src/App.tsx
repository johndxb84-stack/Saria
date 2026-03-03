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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
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
