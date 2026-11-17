import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DoctorLayout from './components/DoctorLayout'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Verify = lazy(() => import('./pages/Verify'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Appointments = lazy(() => import('./pages/Appointments'))
const AppointmentConfig = lazy(() => import('./pages/AppointmentConfig'))
const Profile = lazy(() => import('./pages/Profile'))
const Prescriptions = lazy(() => import('./pages/Prescriptions'))
const PrescriptionEditor = lazy(() => import('./pages/PrescriptionEditor'))
const PublicAppointment = lazy(() => import('./pages/PublicAppointment'))
const PublicPrescription = lazy(() => import('./pages/PublicPrescription'))

function PageFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="skeleton h-8 w-40" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/appointment/:slug" element={<PublicAppointment />} />
            <Route path="/book/:slug" element={<PublicAppointment />} />
            <Route path="/rx/:token" element={<PublicPrescription />} />

            <Route
              element={(
                <ProtectedRoute>
                  <DoctorLayout />
                </ProtectedRoute>
              )}
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/appointment-config" element={<AppointmentConfig />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/prescriptions/new" element={<PrescriptionEditor />} />
              <Route path="/prescriptions/:id" element={<PrescriptionEditor />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
