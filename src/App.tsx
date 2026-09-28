import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { Role } from './api/types'
import { useAuth } from './auth/AuthContext'
import { Layout } from './components/Layout'
import { Appointments } from './pages/Appointments'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { MyAgenda } from './pages/MyAgenda'
import { PatientDetail } from './pages/PatientDetail'
import { Patients } from './pages/Patients'
import { Professionals } from './pages/Professionals'
import { Register } from './pages/Register'

const HOME: Record<Role, string> = {
  ADMIN: '/painel',
  RECEPTION: '/agenda',
  PROFESSIONAL: '/minha-agenda',
  PATIENT: '/',
}

function Only({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  if (!roles.includes(session.role)) return <Navigate to={HOME[session.role]} replace />
  return children
}

export default function App() {
  const { session, signOut } = useAuth()

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (session.role === 'PATIENT') {
    return (
      <div className="grid min-h-screen place-items-center p-4 text-center">
        <div>
          <p className="mb-3 text-slate-600">O portal do paciente ainda não está disponível.</p>
          <button onClick={signOut} className="font-medium text-brand-700">Sair</button>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/painel" element={<Only roles={['ADMIN']}><Dashboard /></Only>} />
        <Route path="/agenda" element={<Only roles={['ADMIN', 'RECEPTION']}><Appointments /></Only>} />
        <Route path="/minha-agenda" element={<Only roles={['PROFESSIONAL']}><MyAgenda /></Only>} />
        <Route path="/pacientes" element={<Only roles={['ADMIN', 'RECEPTION']}><Patients /></Only>} />
        <Route path="/pacientes/:id" element={<Only roles={['ADMIN', 'RECEPTION']}><PatientDetail /></Only>} />
        <Route path="/profissionais" element={<Only roles={['ADMIN']}><Professionals /></Only>} />
      </Route>
      <Route path="*" element={<Navigate to={HOME[session.role]} replace />} />
    </Routes>
  )
}
