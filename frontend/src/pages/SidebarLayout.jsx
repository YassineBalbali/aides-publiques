import { Link, useLocation, useNavigate } from 'react-router-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f4f6fb; }

  .sidebar { 
    width: 220px; min-height: 100vh; background: #fff; 
    border-right: 1px solid #e8ecf4; display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; z-index: 40;
  }
  .sidebar-logo { padding: 20px 18px; border-bottom: 1px solid #e8ecf4; display: flex; align-items: center; gap: 10px; }
  .sidebar-logo-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sidebar-logo-text { font-size: 14px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
  .sidebar-logo-sub { font-size: 10px; color: #94a3b8; font-weight: 500; }
  
  .sidebar-nav { flex: 1; padding: 12px 10px; }
  .nav-section-label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; padding: 0 8px; margin: 8px 0 4px; }
  
  .nav-item { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; text-decoration: none; color: #64748b; font-size: 13px; font-weight: 500; transition: all 0.15s; margin-bottom: 1px; }
  .nav-item:hover { background: #f1f5f9; color: #1e293b; }
  .nav-item.active { background: #eff6ff; color: #2563eb; font-weight: 600; }
  .nav-item svg { flex-shrink: 0; opacity: 0.7; }
  .nav-item.active svg { opacity: 1; }
  
  .sidebar-bottom { padding: 12px 10px; border-top: 1px solid #e8ecf4; }
  .user-card { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; }
  .user-avatar { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg, #2563eb, #7c3aed); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .user-name { font-size: 12px; font-weight: 600; color: #1e293b; }
  .user-role { font-size: 10px; color: #94a3b8; }
  .logout-btn { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 7px; border: none; background: none; color: #94a3b8; font-size: 12px; font-weight: 500; cursor: pointer; width: 100%; margin-top: 4px; font-family: inherit; transition: all 0.15s; }
  .logout-btn:hover { background: #fef2f2; color: #dc2626; }
  
  .main-content { margin-left: 220px; min-height: 100vh; min-width: 0; width: calc(100% - 220px); }
  .top-bar { height: 56px; background: #fff; border-bottom: 1px solid #e8ecf4; display: flex; align-items: center; padding: 0 24px; justify-content: space-between; position: sticky; top: 0; z-index: 30; }
  .top-bar-title { font-size: 13px; color: #94a3b8; font-weight: 500; }
  .top-bar-right { display: flex; align-items: center; gap: 8px; }
  .badge-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; }
  .badge-text { font-size: 12px; color: #64748b; }
  
  .page-content { padding: 24px; }
  
  .page-header { margin-bottom: 24px; }
  .page-title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; margin-bottom: 4px; }
  .page-subtitle { font-size: 13px; color: #94a3b8; }

  .kpi-grid { display: grid; gap: 12px; margin-bottom: 20px; width: 100%; }
  .kpi-card { background: #fff; border: 1px solid #e8ecf4; border-radius: 10px; padding: 16px; }
  .kpi-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .kpi-value { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; margin-bottom: 4px; }
  .kpi-sub { font-size: 11px; color: #94a3b8; }
  
  .card { background: #fff; border: 1px solid #e8ecf4; border-radius: 10px; overflow: hidden; }
  .card-header { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-size: 13px; font-weight: 700; color: #0f172a; }
  
  .filter-bar { background: #fff; border: 1px solid #e8ecf4; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px; display: flex; gap: 10px; align-items: center; }
  .search-input { flex: 1; padding: 8px 12px; border-radius: 7px; font-size: 13px; border: 1px solid #e8ecf4; outline: none; background: #f8fafc; color: #1e293b; font-family: inherit; }
  .search-input:focus { border-color: #93c5fd; background: #fff; }
  .select-input { padding: 8px 12px; border-radius: 7px; font-size: 13px; border: 1px solid #e8ecf4; background: #fff; outline: none; color: #374151; font-family: inherit; cursor: pointer; }
  .count-badge { font-size: 12px; color: #94a3b8; background: #f8fafc; border: 1px solid #e8ecf4; padding: 4px 10px; border-radius: 100px; white-space: nowrap; }
  
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th { padding: 10px 16px; text-align: left; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; background: #f8fafc; border-bottom: 1px solid #e8ecf4; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f8fafc; font-size: 13px; color: #374151; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tbody tr:hover { background: #fafbff; }
  
  .badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 100px; font-size: 11px; font-weight: 600; }
  
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 7px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; transition: all 0.15s; }
  .btn-primary { background: #2563eb; color: #fff; }
  .btn-primary:hover { background: #1d4ed8; }
  .btn-secondary { background: #fff; color: #374151; border: 1px solid #e8ecf4; }
  .btn-secondary:hover { background: #f8fafc; }
  .btn-sm { padding: 4px 10px; font-size: 11px; border-radius: 6px; }
  .btn-success-sm { background: #ecfdf5; color: #059669; }
  .btn-success-sm:hover { background: #d1fae5; }
  .btn-danger-sm { background: #fef2f2; color: #dc2626; }
  .btn-danger-sm:hover { background: #fee2e2; }
  .btn-warning-sm { background: #fffbeb; color: #d97706; }
  .btn-warning-sm:hover { background: #fef3c7; }
  .btn-blue-sm { background: #eff6ff; color: #2563eb; }
  .btn-blue-sm:hover { background: #dbeafe; }
  
  .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); z-index: 100; display: flex; align-items: flex-start; justify-content: center; padding: 40px 24px; overflow-y: auto; backdrop-filter: blur(2px); }
  .modal { background: #fff; border-radius: 14px; padding: 28px; width: 100%; max-width: 560px; margin: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .modal-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 20px; letter-spacing: -0.02em; }
  
  .form-group { margin-bottom: 0; }
  .form-label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 5px; }
  .form-input { width: 100%; padding: 9px 12px; border-radius: 7px; font-size: 13px; color: #1e293b; border: 1px solid #e8ecf4; outline: none; background: #f8fafc; box-sizing: border-box; font-family: inherit; }
  .form-input:focus { border-color: #93c5fd; background: #fff; }
  .form-textarea { resize: none; }
  
  .alert-success { padding: 11px 14px; border-radius: 8px; background: #ecfdf5; border: 1px solid #bbf7d0; font-size: 13px; color: #059669; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .alert-error { padding: 11px 14px; border-radius: 8px; background: #fef2f2; border: 1px solid #fecaca; font-size: 13px; color: #dc2626; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }

  .empty-state { padding: 48px; text-align: center; color: #94a3b8; font-size: 13px; }
  .empty-state-icon { font-size: 32px; margin-bottom: 12px; }
  
  .tab-bar { display: flex; gap: 0; border-bottom: 1px solid #e8ecf4; margin-bottom: 20px; }
  .tab-btn { padding: 10px 20px; font-size: 13px; font-weight: 500; color: #94a3b8; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: inherit; transition: all 0.15s; margin-bottom: -1px; }
  .tab-btn.active { color: #2563eb; font-weight: 700; border-bottom-color: #2563eb; }
  .tab-btn:hover:not(.active) { color: #374151; }

  .toggle { width: 44px; height: 24px; border-radius: 100px; border: none; cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0; }
  .toggle-thumb { position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }

  .action-row { display: flex; gap: 6px; align-items: center; }

  .avatar { border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; flex-shrink: 0; }
`

export function IconFolder({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
}
export function IconList({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
}
export function IconUsers({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
export function IconLink({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
}
export function IconChart({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
}
export function IconSettings({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
}
export function IconUser({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}

export function SidebarLayout({ children, navItems, role, prenom, nom }) {
  const location = useLocation()
  const navigate = useNavigate()
  const logoSauvegarde = localStorage.getItem('plateforme_logo')
  const nomSauvegarde = localStorage.getItem('plateforme_nom') || 'Aides Publiques'

  const initiales = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase() || 'A'

  const currentPage = navItems.find(n => {
    if (n.to === '/admin/dossiers') return location.pathname === '/admin/dossiers'
    return location.pathname.startsWith(n.to)
  })

  return (
    <>
      <style>{styles}</style>
      <div style={{ display: 'flex' }}>
        <aside className="sidebar">
          <div className="sidebar-logo">
            {logoSauvegarde
              ? <img src={logoSauvegarde} alt="Logo" style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 8 }} />
              : <div className="sidebar-logo-icon"><span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>AP</span></div>
            }
            <div>
              <div className="sidebar-logo-text">{nomSauvegarde}</div>
              <div className="sidebar-logo-sub">Administration</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label">Navigation</div>
            {navItems.map(({ to, label, Icon }) => {
              const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
              return (
                <Link key={to} to={to} className={`nav-item${isActive ? ' active' : ''}`}>
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="sidebar-bottom">
            <div className="user-card">
              <div className="user-avatar">{initiales}</div>
              <div>
                <div className="user-name">{prenom} {nom}</div>
                <div className="user-role">{role === 'admin' ? 'Administrateur' : role}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); navigate('/login') }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="top-bar">
            <span className="top-bar-title">
              {navItems.find(n => location.pathname === n.to || location.pathname.startsWith(n.to + '/'))?.label || 'Admin'}
            </span>
            <div className="top-bar-right">
              <div className="badge-dot" />
              <span className="badge-text">Système opérationnel</span>
            </div>
          </div>
          <div className="page-content">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}