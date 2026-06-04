import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'
import Planner from './pages/Planner'
import TripResults from './pages/TripResults'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { Toaster } from 'sonner'
import Header from './components/Header'
import CustomCursor from './components/CustomCursor'
import Footer from './components/Footer'
import LoginSuccessPopup from './components/LoginSuccessPopup'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm font-extrabold">Loading…</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <CustomCursor />
      <Header />
      <Toaster richColors position="top-right" />
      <LoginSuccessPopup />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          }
        />

        <Route path="/planner" element={<Planner />} />
        <Route path="/planner/:tripId/edit" element={<Planner />} />
        <Route path="/trip-results" element={<TripResults />} />
        <Route path="/trip-results/:tripId" element={<TripResults />} />
        <Route path="/workspace/itinerary/:tripId" element={<TripResults />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </AuthProvider>
  )
}

export default App
