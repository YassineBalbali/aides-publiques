import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

const STATUT = {
  brouillon:          { label: 'Brouillon',        bg: '#f1f5f9', color: '#64748b' },
  depose:             { label: 'Déposé',            bg: '#eff6ff', color: '#2563eb' },
  en_instruction:     { label: 'En instruction',    bg: '#fffbeb', color: '#d97706' },
  accepte:            { label: 'Accepté',           bg: '#ecfdf5', color: '#059669' },
  refuse:             { label: 'Refusé',            bg: '#fef2f2', color: '#dc2626' },
  complement_demande: { label: 'Complément',        bg: '#fff7ed', color: '#ea580c' },
}

function DetailDossierAdmin() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dossier, setDossier]           = useState(null)
  const [documents, setDocuments]       = useState([])
  const [instructeurs, setInstructeurs] = useState([])
  const [instructeurId, setInstructeurId] = useState('')
  const [affectation, setAffectation]   = useState(false)
  const [succesMsg, setSuccesMsg]       = useState('')
  const [erreurMsg, setErreurMsg]       = useState('')
  const [chargement, setChargement]     = useState(true)

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    charger()
  }, [id])

  const charger = async () => {
    try {
      const [dossierRes, docsRes, usersRes] = await Promise.all([
        api.get(`/dossiers/${id}`),
        api.get(`/documents/dossier/${id}`),
        api.get('/auth/utilisateurs'),
      ])
      setDossier(dossierRes.data)
      setDocuments(docsRes.data)
      setInstructeurs(usersRes.data.filter(u => u.role === 'instructeur'))
      if (dossierRes.data.instructeur_id) setInstructeurId(dossierRes.data.instructeur_id)
    } catch (e) {
      setErreurMsg('Impossible de charger le dossier.')
    } finally {
      setChargement(false)
    }
  }

  const affecter = async () => {
    if (!instructeurId) return
    setAffectation(true)
    setSuccesMsg('')
    setErreurMsg('')
    try {
      await api.patch(`/dossiers/${id}/affecter?instructeur_id=${instructeurId}`)
      setSuccesMsg('Instructeur affecté avec succès.')
      charger()
    } catch {
      setErreurMsg("Erreur lors de l'affectation.")
    } finally {
      setAffectation(false)
    }
  }

  const changerStatut = async (statut) => {
    try {
      await api.patch(`/dossiers/${id}/statut?statut=${statut}`)
      setDossier(prev => ({ ...prev, statut }))
      setSuccesMsg('Statut mis à jour.')
    } catch {
      setErreurMsg('Erreur lors du changement de statut.')
    }
  }

  if (chargement) return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="empty-state">Chargement...</div>
    </SidebarLayout>
  )

  if (!dossier) return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="empty-state">Dossier introuvable.</div>
    </SidebarLayout>
  )

  const s = STATUT[dossier.statut] || STATUT.brouillon
  const instructeurActuel = instructeurs.find(i => i.id === dossier.instructeur_id)

  return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => navigate('/admin/dossiers')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
          ← Retour aux dossiers
        </button>
      </div>

      {succesMsg && <div className="alert-success" style={{ marginBottom: 16 }}>✓ {succesMsg}</div>}
      {erreurMsg && <div className="alert-error" style={{ marginBottom: 16 }}>✕ {erreurMsg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* Colonne principale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* En-tête dossier */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Détail du dossier</span>
              <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
            </div>
            <div style={{ padding: '20px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Numéro</div>
                <div style={{ fontWeight: 800, color: '#2563eb', fontSize: 16 }}>{dossier.numero}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Date de dépôt</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{new Date(dossier.cree_le).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Demandeur</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{dossier.demandeur?.prenom} {dossier.demandeur?.nom}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{dossier.demandeur?.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Instructeur actuel</div>
                {instructeurActuel
                  ? <div style={{ fontWeight: 600, fontSize: 13, color: '#059669' }}>{instructeurActuel.prenom} {instructeurActuel.nom}</div>
                  : <div style={{ fontSize: 13, color: '#94a3b8' }}>Non affecté</div>
                }
              </div>
              {dossier.commentaire && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Commentaire du demandeur</div>
                  <div style={{ fontSize: 13, color: '#374151', background: '#f8fafc', borderRadius: 8, padding: '10px 12px', border: '1px solid #e8ecf4' }}>{dossier.commentaire}</div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Documents ({documents.length})</span>
            </div>
            <div style={{ padding: '12px 18px' }}>
              {documents.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px 0' }}>Aucun document joint</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {documents.map(doc => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e8ecf4' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{doc.type_fichier === 'pdf' ? '📄' : '🖼️'}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{doc.nom_fichier}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{(doc.taille / 1024).toFixed(1)} Ko</div>
                        </div>
                      </div>
                      <a href={`http://127.0.0.1:8000/documents/telecharger/${doc.id}`} target="_blank" rel="noreferrer"
                        style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', textDecoration: 'none', padding: '4px 10px', background: '#eef2ff', borderRadius: 6 }}>
                        Télécharger
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions statut */}
          <div className="card">
            <div className="card-header"><span className="card-title">Changer le statut</span></div>
            <div style={{ padding: '14px 18px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { statut: 'accepte',         label: '✅ Accepter',          bg: '#ecfdf5', color: '#059669' },
                { statut: 'refuse',          label: '❌ Refuser',           bg: '#fef2f2', color: '#dc2626' },
                { statut: 'en_instruction',  label: '🔍 En instruction',    bg: '#fffbeb', color: '#d97706' },
                { statut: 'complement_demande', label: '📎 Complément',     bg: '#fff7ed', color: '#ea580c' },
              ].map(a => (
                <button key={a.statut} onClick={() => changerStatut(a.statut)}
                  disabled={dossier.statut === a.statut}
                  style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${a.color}30`, background: a.bg, color: a.color, fontWeight: 600, fontSize: 13, cursor: dossier.statut === a.statut ? 'default' : 'pointer', opacity: dossier.statut === a.statut ? 0.5 : 1, fontFamily: 'inherit' }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne affectation */}
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <div className="card-header"><span className="card-title">Affecter un instructeur</span></div>
          <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {instructeurActuel && (
              <div style={{ padding: '10px 12px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13 }}>
                <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, marginBottom: 2 }}>Instructeur actuel</div>
                <div style={{ fontWeight: 600, color: '#065f46' }}>{instructeurActuel.prenom} {instructeurActuel.nom}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{instructeurActuel.email}</div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Sélectionner un instructeur
              </label>
              <select value={instructeurId} onChange={e => setInstructeurId(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e8ecf4', fontSize: 13, background: '#f8fafc', fontFamily: 'inherit', outline: 'none', color: '#1e293b' }}>
                <option value="">— Choisir un instructeur —</option>
                {instructeurs.map(i => (
                  <option key={i.id} value={i.id}>{i.prenom} {i.nom}</option>
                ))}
              </select>
            </div>

            <button onClick={affecter} disabled={!instructeurId || affectation}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: instructeurId ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#e2e8f0', color: instructeurId ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 14, cursor: instructeurId ? 'pointer' : 'default', fontFamily: 'inherit', boxShadow: instructeurId ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
              {affectation ? 'Affectation...' : 'Affecter'}
            </button>

            {instructeurs.length === 0 && (
              <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                Aucun instructeur disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default DetailDossierAdmin
