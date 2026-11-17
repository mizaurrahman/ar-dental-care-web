import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home', icon: '▦' },
  { to: '/prescriptions', label: 'Rx', icon: '℞' },
  { to: '/appointments', label: 'Appts', icon: '◷' },
  { to: '/appointment-config', label: 'Hours', icon: '⚙' },
  { to: '/profile', label: 'Profile', icon: '☺' },
]

export default function DoctorLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function onLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="doctor-shell min-h-screen pb-[4.75rem] md:pb-0 md:p-4">
      <div className="mx-auto flex max-w-[1400px] md:gap-4">
        {/* Desktop sidebar */}
        <aside className="no-print sticky top-4 hidden h-[calc(100vh-2rem)] w-[4.5rem] shrink-0 flex-col items-center rounded-[24px] bg-[var(--navy)] py-4 text-white shadow-[0_18px_40px_rgba(15,27,45,0.28)] md:flex">
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
            onClick={onLogout}
          >
            ⎋
          </button>
        </aside>

        <div className="min-w-0 flex-1 px-3 pt-3 md:px-0 md:pt-0">
          <header className="no-print mb-3 flex items-center justify-between gap-3 rounded-[18px] border border-white/70 bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur sm:px-4">
            <div className="min-w-0">
              <div className="brand truncate text-base font-extrabold tracking-tight text-[var(--navy)] sm:text-lg">AR Dental Care</div>
              <div className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted)] sm:text-[11px]">
                {user?.clinic_name || 'Clinic management'}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden text-right sm:block">
                <div className="max-w-[10rem] truncate text-sm font-semibold leading-tight md:max-w-none">{user?.name}</div>
                <div className="truncate text-[11px] text-[var(--muted)]">{user?.specialty || 'Doctor'}</div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--navy)] text-sm font-bold text-white ring-2 ring-blue-100">
                {user?.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : (user?.name?.[0] || 'D')}
              </div>
              <button type="button" className="btn-ghost md:hidden" onClick={onLogout}>Out</button>
            </div>
          </header>
          <Outlet />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="no-print mobile-tabbar fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pt-1.5 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold ${
                  isActive ? 'text-[var(--blue)]' : 'text-slate-500'
                }`
              }
            >
              <span className="text-base leading-none" aria-hidden>{link.icon}</span>
              <span className="truncate">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
