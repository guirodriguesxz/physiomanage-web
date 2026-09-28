import { NavLink, Outlet } from 'react-router-dom'
import type { Role } from '../api/types'
import { useAuth } from '../auth/AuthContext'

const NAV: { to: string; label: string; roles: Role[] }[] = [
  { to: '/painel', label: 'Painel', roles: ['ADMIN'] },
  { to: '/agenda', label: 'Agenda', roles: ['ADMIN', 'RECEPTION'] },
  { to: '/minha-agenda', label: 'Minha agenda', roles: ['PROFESSIONAL'] },
  { to: '/pacientes', label: 'Pacientes', roles: ['ADMIN', 'RECEPTION'] },
  { to: '/profissionais', label: 'Profissionais', roles: ['ADMIN'] },
]

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador',
  RECEPTION: 'Recepção',
  PROFESSIONAL: 'Fisioterapeuta',
  PATIENT: 'Paciente',
}

export function Layout() {
  const { session, signOut } = useAuth()
  const items = NAV.filter((i) => session && i.roles.includes(session.role))

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white md:min-h-screen md:w-60 md:border-r md:border-b-0">
        <div className="flex items-center gap-2 px-5 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">P</span>
          <span className="font-semibold text-slate-900">PhysioManage</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {items.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {i.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-5 py-4 text-sm md:block">
          <p className="text-slate-500">{session && ROLE_LABEL[session.role]}</p>
          <button onClick={signOut} className="mt-1 font-medium text-slate-700 hover:text-red-600">Sair</button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4 flex justify-end md:hidden">
          <button onClick={signOut} className="text-sm font-medium text-slate-600">Sair</button>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
