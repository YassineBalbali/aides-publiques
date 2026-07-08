import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import api from '../api'

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f4f6fb; }

  .sidebar {
    width: 220px; min-height: 100vh;
    background: linear-gradient(170deg, #1c1345 0%, #0e0a2a 58%, #0c1a35 100%);
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; z-index: 40;
  }
  .sidebar-logo { padding: 20px 18px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 10px; }
  .sidebar-logo-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 14px rgba(99,102,241,0.4); }
  .sidebar-logo-text { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
  .sidebar-logo-sub { font-size: 10px; color: rgba(255,255,255,0.35); font-weight: 500; }

  .sidebar-nav { flex: 1; padding: 12px 10px; }
  .nav-section-label { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.1em; padding: 0 8px; margin: 8px 0 4px; }

  .nav-item { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; text-decoration: none; color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 500; transition: all 0.18s; margin-bottom: 2px; border: 1px solid transparent; }
  .nav-item:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }
  .nav-item.active { background: rgba(99,102,241,0.22); color: #a5b4fc; font-weight: 600; border-color: rgba(99,102,241,0.3); }
  .nav-item svg { flex-shrink: 0; opacity: 0.7; }
  .nav-item.active svg { opacity: 1; }

  .sidebar-bottom { padding: 12px 10px; border-top: 1px solid rgba(255,255,255,0.07); }
  .user-card { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; }
  .user-avatar { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .user-name { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.85); }
  .user-role { font-size: 10px; color: rgba(255,255,255,0.35); }
  .logout-btn { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 7px; border: none; background: none; color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 500; cursor: pointer; width: 100%; margin-top: 4px; font-family: inherit; transition: all 0.18s; }
  .logout-btn:hover { background: rgba(220,38,38,0.18); color: #f87171; }

  .main-content { margin-left: 220px; min-height: 100vh; min-width: 0; width: calc(100% - 220px); }
  .top-bar { height: 56px; background: #fff; border-bottom: 1px solid #e8ecf4; display: flex; align-items: center; padding: 0 24px; justify-content: space-between; position: sticky; top: 0; z-index: 30; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .top-bar-title { font-size: 13px; color: #94a3b8; font-weight: 500; }
  .top-bar-right { display: flex; align-items: center; gap: 8px; }
  .badge-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 6px rgba(34,197,94,0.5); }
  .badge-text { font-size: 12px; color: #64748b; }

  .notif-btn { position: relative; width: 34px; height: 34px; border-radius: 9px; border: 1px solid #e8ecf4; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.18s; }
  .notif-btn:hover { background: #f5f3ff; border-color: #c7d2fe; }
  .notif-count { position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff; font-size: 9px; font-weight: 800; min-width: 16px; height: 16px; border-radius: 100px; display: flex; align-items: center; justify-content: center; padding: 0 4px; border: 2px solid #fff; }
  .notif-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 340px; background: #fff; border: 1px solid #e8ecf4; border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,0.12); z-index: 200; overflow: hidden; }
  .notif-header { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
  .notif-title { font-size: 13px; font-weight: 700; color: #0f172a; }
  .notif-empty { padding: 28px 16px; text-align: center; color: #94a3b8; font-size: 13px; }
  .notif-item { padding: 12px 16px; border-bottom: 1px solid #f8f7ff; cursor: pointer; transition: background 0.15s; }
  .notif-item:hover { background: #f5f3ff; }
  .notif-item:last-child { border-bottom: none; }
  .notif-item-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
  .notif-dossier { font-size: 11px; font-weight: 700; color: #6366f1; }
  .notif-time { font-size: 10px; color: #94a3b8; }
  .notif-sender { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 2px; }
  .notif-preview { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  
  .page-content { padding: 24px; }
  
  .page-header { margin-bottom: 24px; }
  .page-title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; margin-bottom: 4px; }
  .page-subtitle { font-size: 13px; color: #94a3b8; }

  .kpi-grid { display: grid; gap: 14px; margin-bottom: 22px; width: 100%; }
  .kpi-card { background: #fff; border: 1px solid #ece8ff; border-radius: 14px; padding: 18px 20px; box-shadow: 0 2px 12px rgba(99,102,241,0.06); transition: transform 0.2s, box-shadow 0.2s; border-left: 3px solid #6366f1; }
  .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,102,241,0.12); }
  .kpi-label { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .kpi-value { font-size: 30px; font-weight: 900; letter-spacing: -0.04em; line-height: 1; margin-bottom: 4px; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .kpi-sub { font-size: 11px; color: #94a3b8; }

  .card { background: #fff; border: 1px solid #eef2ff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.04); transition: box-shadow 0.2s; }
  .card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); }
  .card-header { padding: 14px 18px; border-bottom: 1px solid #f5f3ff; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #fafbff 0%, #f5f3ff 100%); }
  .card-title { font-size: 13px; font-weight: 700; color: #0f172a; }

  .filter-bar { background: #fff; border: 1px solid #eef2ff; border-radius: 12px; padding: 12px 16px; margin-bottom: 14px; display: flex; gap: 10px; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
  .search-input { flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 13px; border: 1px solid #e8ecf4; outline: none; background: #f8fafc; color: #1e293b; font-family: inherit; transition: all 0.2s; }
  .search-input:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
  .select-input { padding: 8px 12px; border-radius: 8px; font-size: 13px; border: 1px solid #e8ecf4; background: #fff; outline: none; color: #374151; font-family: inherit; cursor: pointer; transition: border-color 0.2s; }
  .select-input:focus { border-color: #a5b4fc; }
  .count-badge { font-size: 12px; color: #6366f1; background: #eef2ff; border: 1px solid #e0e7ff; padding: 4px 10px; border-radius: 100px; white-space: nowrap; font-weight: 600; }

  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th { padding: 10px 16px; text-align: left; font-size: 10px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.08em; background: #fafbff; border-bottom: 1px solid #eef2ff; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f8f7ff; font-size: 13px; color: #374151; transition: background 0.15s; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tbody tr:hover td { background: #fafaff; }

  .badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 100px; font-size: 11px; font-weight: 600; }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; transition: all 0.2s; }
  .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
  .btn-primary:hover { box-shadow: 0 6px 20px rgba(99,102,241,0.45); transform: translateY(-1px); }
  .btn-secondary { background: #fff; color: #374151; border: 1px solid #e8ecf4; }
  .btn-secondary:hover { background: #f8fafc; border-color: #c7d2fe; }
  .btn-sm { padding: 4px 10px; font-size: 11px; border-radius: 6px; }
  .btn-success-sm { background: #ecfdf5; color: #059669; }
  .btn-success-sm:hover { background: #d1fae5; }
  .btn-danger-sm { background: #fef2f2; color: #dc2626; }
  .btn-danger-sm:hover { background: #fee2e2; }
  .btn-warning-sm { background: #fffbeb; color: #d97706; }
  .btn-warning-sm:hover { background: #fef3c7; }
  .btn-blue-sm { background: #eef2ff; color: #6366f1; }
  .btn-blue-sm:hover { background: #e0e7ff; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); z-index: 100; display: flex; align-items: flex-start; justify-content: center; padding: 40px 24px; overflow-y: auto; backdrop-filter: blur(4px); }
  .modal { background: #fff; border-radius: 18px; padding: 28px; width: 100%; max-width: 560px; margin: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.18); border: 1px solid #eef2ff; }
  .modal-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 20px; letter-spacing: -0.02em; }

  .form-group { margin-bottom: 0; }
  .form-label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 5px; }
  .form-input { width: 100%; padding: 9px 12px; border-radius: 8px; font-size: 13px; color: #1e293b; border: 1px solid #e8ecf4; outline: none; background: #f8fafc; box-sizing: border-box; font-family: inherit; transition: all 0.2s; }
  .form-input:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
  .form-textarea { resize: none; }

  .alert-success { padding: 11px 14px; border-radius: 10px; background: #ecfdf5; border: 1px solid #bbf7d0; font-size: 13px; color: #059669; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .alert-error { padding: 11px 14px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca; font-size: 13px; color: #dc2626; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }

  .empty-state { padding: 56px; text-align: center; color: #94a3b8; font-size: 13px; }
  .empty-state-icon { font-size: 36px; margin-bottom: 14px; }

  .tab-bar { display: flex; gap: 0; border-bottom: 1px solid #eef2ff; margin-bottom: 20px; }
  .tab-btn { padding: 10px 20px; font-size: 13px; font-weight: 500; color: #94a3b8; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: inherit; transition: all 0.18s; margin-bottom: -1px; }
  .tab-btn.active { color: #6366f1; font-weight: 700; border-bottom-color: #6366f1; }
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

function NotificationBell({ userId, role, navigate }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const fetchAll = () => {
    if (!userId) return
    Promise.all([
      api.get(`/messages/non-lus/${userId}`).catch(() => ({ data: [] })),
      api.get(`/notifications/non-lues/${userId}`).catch(() => ({ data: [] })),
    ]).then(([msgs, notifs]) => {
      const messages = msgs.data.map(m => ({
        id: m.id,
        type: 'message',
        titre: m.numero_dossier,
        contenu: m.contenu,
        sous_titre: `${m.expediteur_nom} (${m.expediteur_role})`,
        dossier_id: m.dossier_id,
        cree_le: m.cree_le,
      }))
      const affectations = notifs.data.map(n => ({
        id: n.id,
        type: 'affectation',
        titre: n.titre,
        contenu: n.contenu,
        sous_titre: 'Affectation',
        dossier_id: n.dossier_id,
        notif_id: n.id,
        cree_le: n.cree_le,
      }))
      const merged = [...messages, ...affectations]
        .sort((a, b) => new Date(b.cree_le) - new Date(a.cree_le))
      setItems(merged)
    })
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [userId])

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const handleClickItem = (item) => {
    if (item.type === 'affectation' && item.notif_id) {
      api.patch(`/notifications/${item.notif_id}/lire`).catch(() => {})
    }
    setOpen(false)
    if (!item.dossier_id) return
    if (role === 'instructeur') {
      navigate(`/instructeur/dossier/${item.dossier_id}`)
    } else if (role === 'admin') {
      navigate(`/admin/dossiers`)
    } else {
      navigate(`/mon-espace/dossier/${item.dossier_id}`)
    }
  }

  const typeColor = { message: '#6366f1', affectation: '#f59e0b' }
  const typeLabel = { message: '✉', affectation: '📋' }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="notif-btn" onClick={() => setOpen(o => !o)} title="Notifications">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {items.length > 0 && (
          <span className="notif-count">{items.length > 9 ? '9+' : items.length}</span>
        )}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="notif-title">Notifications</span>
            {items.length > 0 && (
              <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>
                {items.length} non lu{items.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {items.length === 0 ? (
            <div className="notif-empty">Aucune notification</div>
          ) : (
            items.slice(0, 8).map(n => (
              <div key={`${n.type}-${n.id}`} className="notif-item" onClick={() => handleClickItem(n)}>
                <div className="notif-item-header">
                  <span className="notif-dossier">
                    <span style={{ marginRight: 4 }}>{typeLabel[n.type]}</span>
                    {n.titre}
                  </span>
                  <span className="notif-time">{formatTime(n.cree_le)}</span>
                </div>
                <div className="notif-sender" style={{ color: typeColor[n.type] }}>{n.sous_titre}</div>
                <div className="notif-preview">{n.contenu}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function SidebarLayout({ children, navItems, role, prenom, nom }) {
  const location = useLocation()
  const navigate = useNavigate()
  const logoSauvegarde = localStorage.getItem('plateforme_logo')
  const nomSauvegarde = localStorage.getItem('plateforme_nom') || 'Aides Publiques'

  const initiales = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase() || 'A'
  const token = localStorage.getItem('token')
  const userId = token ? JSON.parse(atob(token.split('.')[1])).sub : null

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
              {role !== 'admin' && <NotificationBell userId={userId} role={role} navigate={navigate} />}
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