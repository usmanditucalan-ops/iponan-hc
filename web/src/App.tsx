import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';
import { NotificationManager } from './components/notifications/NotificationManager';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import MedicalRecords from './pages/MedicalRecords';
import Users from './pages/Users';
import Settings from './pages/Settings';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <LanguageProvider>
              <Router>
                <NotificationManager />
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes — all authenticated users */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Staff-only: Patients list */}
                  <Route element={<RoleRoute allowedRoles={['ADMIN', 'DOCTOR', 'STAFF']} />}>
                    <Route path="/patients" element={<Patients />} />
                  </Route>

                  {/* Clinical: Medical Records */}
                  <Route element={<RoleRoute allowedRoles={['ADMIN', 'DOCTOR', 'STAFF', 'PATIENT']} />}>
                    <Route path="/medical-records" element={<MedicalRecords />} />
                  </Route>

                  {/* Admin-only */}
                  <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/users" element={<Users viewMode="all" />} />
                    <Route path="/users/staff" element={<Users viewMode="staff" />} />
                    <Route path="/users/patients" element={<Users viewMode="patients" />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<LandingPage />} />
              </Routes>
            </Router>
            </LanguageProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
