import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/prescriptions', label: 'Prescription', icon: '℞' },
  { to: '/appointments', label: 'Appointments', icon: '◷' },
  { to: '/appointment-config', label: 'Appt Config', icon: '⚙' },
  { to: '/profile', label: 'Profile', icon: '☺' },
]

export default function DoctorLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen p-3 md:p-4">
      <div className="mx-auto flex max-w-[1400px] gap-3 md:gap-4">
        <aside className="no-print sticky top-3 flex h-[calc(100vh-1.5rem)] w-[4.25rem] shrink-0 flex-col items-center rounded-[24px] bg-[var(--navy)] py-4 text-white shadow-[0_18px_40px_rgba(15,27,45,0.28)]">
          <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 text-xs font-extrabold shadow-lg">
            AR
          </div>
          <nav className="flex flex-1 flex-col gap-1.5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                title={link.label}
                className={({ isActive }) =>
                  `nav-dot flex h-10 w-10 items-center justify-center rounded-xl text-base ${
                    isActive
                      ? 'bg-[var(--blue)] text-white shadow-[0_8px_18px_rgba(47,111,237,0.45)]'
                      : 'text-white/65 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span aria-hidden>{link.icon}</span>
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="nav-dot mt-auto flex h-10 w-10 items-center justify-center rounded-xl text-white/65 hover:bg-white/10 hover:text-white"
            title="Logout"
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            ⎋
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="no-print mb-3 flex items-center justify-between gap-3 rounded-[18px] border border-white/70 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur">
            <div>
              <div className="brand text-lg font-extrabold tracking-tight text-[var(--navy)]">AR Dental Care</div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">Clinic management</div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold leading-tight">{user?.name}</div>
                <div className="text-[11px] text-[var(--muted)]">{user?.specialty || 'Doctor'}</div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--navy)] text-sm font-bold text-white ring-2 ring-blue-100">
                {user?.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : (user?.name?.[0] || 'D')}
              </div>
            </div>
          </header>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
