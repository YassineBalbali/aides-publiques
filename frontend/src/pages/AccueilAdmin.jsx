import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SidebarLayout, IconFolder, IconList, IconUsers, IconLink, IconChart, IconSettings, IconUser } from './SidebarLayout'
import api from '../api'

const ADMIN_NAV = [
  { to: '/admin/dossiers', label: 'Dossiers', Icon: IconFolder },
  { to: '/admin/aides', label: 'Gestion Aides', Icon: IconList },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', Icon: IconUsers },
  { to: '/admin/affectations', label: 'Affectations', Icon: IconLink },
  { to: '/admin/dashboard', label: 'Dashboard', Icon: IconChart },
  { to: '/admin/parametres', label: 'Paramètres', Icon: IconSettings },
  { to: '/profil', label: 'Profil', Icon: IconUser },
]

function AccueilAdmin() {
  const [stats, setStats] = useState({ dossiers: 0, aides: 0, utilisateurs: 0, enAttente: 0, acceptes: 0, instructeurs: 0 })
  const [chargement, setChargement] = useState(true)

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => {
    Promise.all([api.get('/dossiers/'), api.get('/aides/'), api.get('/auth/utilisateurs')])
      .then(([d, a, u]) => {
        setStats({
          dossiers: d.data.length,
          aides: a.data.filter(a => a.statut === 'active').length,
          utilisateurs: u.data.length,
          enAttente: d.data.filter(d => d.statut === 'depose').length,
          acceptes: d.data.filter(d => d.statut === 'accepte').length,
          instructeurs: u.data.filter(u => u.role === 'instructeur').length,
        })
        setChargement(false)
      }).catch(() => setChargement(false))
  }, [])

  const heure = new Date().getHours()
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)', border: '1px solid #dbeafe', borderRadius: 12, padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 4 }}>
            {salutation}, {payload?.prenom} 👋
          </h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>Vue d'ensemble de la plateforme Aides Publiques</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e8ecf4', borderRadius: 8, padding: '8px 14px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Plateforme opérationnelle</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total dossiers', value: stats.dossiers, sub: `${stats.enAttente} en attente`, color: '#2563eb', link: '/admin/dossiers' },
          { label: 'Aides actives', value: stats.aides, sub: 'Disponibles', color: '#059669', link: '/admin/aides' },
          { label: 'Utilisateurs', value: stats.utilisateurs, sub: `${stats.instructeurs} instructeurs`, color: '#7c3aed', link: '/admin/utilisateurs' },
          { label: 'En attente', value: stats.enAttente, sub: 'À instruire', color: '#d97706', link: '/admin/affectations' },
        ].map((s, i) => (
          <Link key={i} to={s.link} style={{ textDecoration: 'none' }}>
            <div className="kpi-card" style={{ cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8ecf4'; e.currentTarget.style.boxShadow = 'none' }}>
              <div className="kpi-label">{s.label}</div>
              <div className="kpi-value" style={{ color: s.color }}>{chargement ? '—' : s.value}</div>
              <div className="kpi-sub">{s.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alert si dossiers en attente */}
      {stats.enAttente > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>{stats.enAttente} dossier(s) en attente d'instruction</p>
            <p style={{ fontSize: 12, color: '#a16207', marginTop: 2 }}>Ces dossiers nécessitent une affectation à un instructeur.</p>
          </div>
          <Link to="/admin/affectations" className="btn btn-sm" style={{ background: '#d97706', color: '#fff', textDecoration: 'none' }}>
            Affecter →
          </Link>
        </div>
      )}

      {/* Actions rapides */}
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Actions rapides</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { title: 'Gérer les dossiers', desc: 'Voir et instruire les dossiers déposés', link: '/admin/dossiers', icon: '📋', color: '#eff6ff' },
            { title: 'Créer une aide', desc: 'Ajouter une nouvelle aide au catalogue', link: '/admin/aides', icon: '➕', color: '#f5f3ff' },
            { title: 'Affecter des dossiers', desc: 'Assigner des dossiers aux instructeurs', link: '/admin/affectations', icon: '🔗', color: '#ecfdf5' },
            { title: 'Dashboard analytique', desc: 'Statistiques et graphiques en temps réel', link: '/admin/dashboard', icon: '📊', color: '#fff7ed' },
            { title: 'Gérer utilisateurs', desc: 'Voir, modifier et créer des comptes', link: '/admin/utilisateurs', icon: '👥', color: '#fef2f2' },
            { title: 'Paramètres', desc: 'Configurer la plateforme', link: '/admin/parametres', icon: '⚙️', color: '#f8fafc' },
          ].map((action, i) => (
            <Link key={i} to={action.link} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 10, padding: '16px', display: 'flex', alignItems: 'flex-start', gap: 12, transition: 'all 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.background = action.color; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8ecf4'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = 'none' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{action.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{action.title}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{action.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SidebarLayout>
  )
}

export default AccueilAdmin