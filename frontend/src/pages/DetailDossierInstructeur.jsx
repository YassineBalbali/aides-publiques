import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SidebarLayout, IconFolder, IconChart } from './SidebarLayout'
import api from '../api'

const INSTRUCTEUR_NAV = [
  { to: '/instructeur', label: 'Mes dossiers', Icon: IconFolder },
  { to: '/instructeur/dashboard', label: 'Dashboard', Icon: IconChart },
]

const STATUT = {
  brouillon: { label: 'Brouillon', bg: '#f1f5f9', color: '#64748b' },
  depose: { label: 'Déposé', bg: '#eff6ff', color: '#2563eb' },
  en_instruction: { label: 'En instruction', bg: '#fffbeb', color: '#d97706' },
  accepte: { label: 'Accepté', bg: '#ecfdf5', color: '#059669' },
  refuse: { label: 'Refusé', bg: '#fef2f2', color: '#dc2626' },
  complement_demande: { label: 'Complément', bg: '#fff7ed', color: '#ea580c' },
}

const ACTIONS = [
  { statut: 'en_instruction', label: '🔍 Mettre en instruction', bg: '#fffbeb', color: '#d97706', hoverBg: '#fef3c7' },
  { statut: 'accepte', label: '✅ Accepter le dossier', bg: '#ecfdf5', color: '#059669', hoverBg: '#d1fae5' },
  { statut: 'refuse', label: '❌ Refuser le dossier', bg: '#fef2f2', color: '#dc2626', hoverBg: '#fee2e2' },
  { statut: 'complement_demande', label: '📎 Demander complément', bg: '#fff7ed', color: '#ea580c', hoverBg: '#ffedd5' },
]

function DetailDossierInstructeur() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dossier, setDossier] = useState(null)
  const [messages, setMessages] = useState([])
  const [nouveauMessage, setNouveauMessage] = useState('')
  const [chargement, setChargement] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [actionEnCours, setActionEnCours] = useState(null)
  // États IA
  const [analyseIA, setAnalyseIA] = useState(null)
  const [analyseEnCours, setAnalyseEnCours] = useState(false)
  const [reponsesIA, setReponsesIA] = useState(null)
  const [reponsesEnCours, setReponsesEnCours] = useState(false)
  const [showModalReponses, setShowModalReponses] = useState(false)
  const messagesEndRef = useRef(null)

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const userId = payload?.sub

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    chargerDossier()
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const chargerDossier = async () => {
    try {
      const [dossierRes, messagesRes] = await Promise.all([
        api.get(`/dossiers/${id}`),
        api.get(`/messages/${id}`),
      ])
      setDossier(dossierRes.data)
      setMessages(messagesRes.data)
      await api.patch(`/messages/${id}/lire`, { user_id: userId })
    } catch {
      navigate('/instructeur')
    } finally {
      setChargement(false)
    }
  }

  const changerStatut = async (statut) => {
    setActionEnCours(statut)
    try {
      await api.patch(`/dossiers/${id}/statut?statut=${statut}`)
      setDossier(prev => ({ ...prev, statut }))
    } catch (err) { console.error(err) }
    finally { setActionEnCours(null) }
  }

  const envoyerMessage = async () => {
    if (!nouveauMessage.trim() || envoi) return
    setEnvoi(true)
    try {
      const res = await api.post(`/messages/${id}`, { contenu: nouveauMessage.trim(), expediteur_id: userId })
      setMessages(prev => [...prev, res.data])
      setNouveauMessage('')
    } catch { } finally { setEnvoi(false) }
  }

  // 🤖 Fonctions IA
  const analyserDossierIA = async () => {
    if (!dossier || analyseEnCours) return
    setAnalyseEnCours(true)
    try {
      const res = await api.post('/ia/analyser-dossier', {
        dossier_numero: dossier.numero,
        demandeur_nom: `${dossier.demandeur?.prenom || ''} ${dossier.demandeur?.nom || ''}`,
        aide_titre: dossier.aide?.titre || 'Non spécifiée',
        aide_criteres: dossier.aide?.criteres_eligibilite || '',
        aide_documents_requis: dossier.aide?.documents_requis || '',
        description_dossier: dossier.commentaire || '',
        documents_fournis: dossier.documents?.map(d => d.nom_fichier) || [],
      })
      setAnalyseIA(res.data)
    } catch (err) {
      alert("Erreur lors de l'analyse IA : " + (err.response?.data?.detail || 'Erreur inconnue'))
    } finally {
      setAnalyseEnCours(false)
    }
  }

  const suggererReponsesIA = async () => {
    if (!dossier || reponsesEnCours) return
    setReponsesEnCours(true)
    setShowModalReponses(true)
    try {
      const res = await api.post('/ia/suggerer-reponse', {
        dossier_numero: dossier.numero,
        demandeur_nom: `${dossier.demandeur?.prenom || ''} ${dossier.demandeur?.nom || ''}`,
        aide_titre: dossier.aide?.titre || 'Non spécifiée',
        statut_actuel: dossier.statut,
        description_dossier: dossier.commentaire || '',
        derniers_messages: messages.slice(-5).map(m => ({
          expediteur_nom: m.expediteur_nom,
          contenu: m.contenu,
        })),
      })
      setReponsesIA(res.data)
    } catch (err) {
      alert("Erreur IA : " + (err.response?.data?.detail || 'Erreur inconnue'))
      setShowModalReponses(false)
    } finally {
      setReponsesEnCours(false)
    }
  }

  const utiliserReponseIA = (texte) => {
    setNouveauMessage(texte)
    setShowModalReponses(false)
  }

  if (chargement) return (
    <SidebarLayout navItems={INSTRUCTEUR_NAV} role="instructeur" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#94a3b8', fontSize: 14 }}>Chargement...</div>
    </SidebarLayout>
  )

  if (!dossier) return null

  const s = STATUT[dossier.statut] || STATUT.brouillon
  const jours = Math.floor((new Date() - new Date(dossier.cree_le)) / (1000 * 60 * 60 * 24))

  return (
    <SidebarLayout navItems={INSTRUCTEUR_NAV} role="instructeur" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      {/* Retour */}
      <button onClick={() => navigate('/instructeur')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: '#fff', border: '1px solid #e8ecf4', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', marginBottom: 20, fontFamily: 'inherit', fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
        ← Retour aux dossiers
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, width: '100%', alignItems: 'start' }}>

        {/* Colonne principale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Info dossier */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>{dossier.numero}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div className="avatar" style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize: 10 }}>
                    {(dossier.demandeur?.prenom?.[0] || '?').toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{dossier.demandeur?.prenom} {dossier.demandeur?.nom}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>·</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{dossier.demandeur?.email}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Déposé le {new Date(dossier.cree_le).toLocaleDateString('fr-FR')} · {jours}j</span>
              </div>
            </div>
            {dossier.commentaire && (
              <div style={{ background: '#f8fafc', border: '1px solid #e8ecf4', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Description</p>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{dossier.commentaire}</p>
              </div>
            )}
          </div>

          {/* 🤖 Card Analyse IA */}
          <div className="card" style={{ padding: 20, border: '1px solid #ddd6fe', background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: analyseIA ? 16 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>🤖</span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Analyse intelligente du dossier</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Synthèse générée par IA</p>
                </div>
              </div>
              <button
                onClick={analyserDossierIA}
                disabled={analyseEnCours}
                style={{
                  padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: '#7c3aed', color: '#fff', border: 'none',
                  cursor: analyseEnCours ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  opacity: analyseEnCours ? 0.6 : 1
                }}>
                {analyseEnCours ? '⏳ Analyse...' : analyseIA ? '🔄 Réanalyser' : '✨ Analyser'}
              </button>
            </div>

            {analyseIA && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Résumé */}
                <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 8, padding: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>📋 Résumé</p>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{analyseIA.resume}</p>
                </div>

                {/* Score complétude */}
                <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 8, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📊 Score de complétude</p>
                    <span style={{ fontSize: 16, fontWeight: 800, color: analyseIA.score_complétude >= 80 ? '#059669' : analyseIA.score_complétude >= 50 ? '#d97706' : '#dc2626' }}>
                      {analyseIA.score_complétude}%
                    </span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      width: `${analyseIA.score_complétude}%`, height: '100%', borderRadius: 100,
                      background: analyseIA.score_complétude >= 80 ? '#10b981' : analyseIA.score_complétude >= 50 ? '#f59e0b' : '#ef4444',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>

                {/* Points d'attention */}
                {analyseIA.points_attention?.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 8, padding: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>⚠ Points d'attention</p>
                    <ul style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {analyseIA.points_attention.map((p, i) => (
                        <li key={i} style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Documents manquants */}
                {analyseIA.documents_manquants?.length > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>📎 Documents manquants</p>
                    <ul style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {analyseIA.documents_manquants.map((d, i) => (
                        <li key={i} style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.6 }}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommandation */}
                {analyseIA.recommandation && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>💡 Recommandation</p>
                    <p style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6, fontWeight: 500 }}>{analyseIA.recommandation}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Messagerie */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <span className="card-title">💬 Messagerie avec le demandeur</span>
              <span className="count-badge">{messages.length} message(s)</span>
            </div>

            {/* Messages */}
            <div style={{ height: 280, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 40 }}>
                  Aucun message — démarrez la conversation !
                </div>
              ) : messages.map((msg, i) => {
                const estMoi = msg.expediteur_id === userId
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, flexDirection: estMoi ? 'row-reverse' : 'row' }}>
                    <div className="avatar" style={{ width: 28, height: 28, background: estMoi ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : '#94a3b8', fontSize: 10, flexShrink: 0, borderRadius: 8 }}>
                      {estMoi ? 'I' : (msg.expediteur_nom?.[0] || 'D')}
                    </div>
                    <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: estMoi ? 'flex-end' : 'flex-start' }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
                        {estMoi ? 'Vous (Instructeur)' : msg.expediteur_nom} · {new Date(msg.cree_le).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div style={{
                        padding: '10px 14px', borderRadius: estMoi ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                        background: estMoi ? '#2563eb' : '#fff',
                        color: estMoi ? '#fff' : '#374151',
                        fontSize: 13, lineHeight: 1.5,
                        border: estMoi ? 'none' : '1px solid #e8ecf4',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}>
                        {msg.contenu}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #e8ecf4', background: '#fff', display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={nouveauMessage}
                onChange={e => setNouveauMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && envoyerMessage()}
                placeholder="Écrire un message au demandeur..."
                className="search-input"
                style={{ flex: 1 }}
              />
              <button
                onClick={suggererReponsesIA}
                disabled={reponsesEnCours}
                title="Suggérer une réponse avec IA"
                style={{
                  padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe',
                  cursor: reponsesEnCours ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  opacity: reponsesEnCours ? 0.6 : 1, whiteSpace: 'nowrap'
                }}>
                {reponsesEnCours ? '⏳' : '💡 IA'}
              </button>
              <button
                onClick={envoyerMessage}
                disabled={!nouveauMessage.trim() || envoi}
                className="btn btn-primary"
                style={{ opacity: (!nouveauMessage.trim() || envoi) ? 0.5 : 1 }}>
                {envoi ? '...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Actions */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>⚡ Actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ACTIONS.map(action => (
                <button
                  key={action.statut}
                  onClick={() => changerStatut(action.statut)}
                  disabled={dossier.statut === action.statut || actionEnCours !== null}
                  style={{
                    padding: '11px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: dossier.statut === action.statut ? '#f1f5f9' : action.bg,
                    color: dossier.statut === action.statut ? '#94a3b8' : action.color,
                    border: `1px solid ${dossier.statut === action.statut ? '#e8ecf4' : 'transparent'}`,
                    cursor: dossier.statut === action.statut ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', textAlign: 'left',
                    opacity: actionEnCours && actionEnCours !== action.statut ? 0.5 : 1,
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { if (dossier.statut !== action.statut) e.currentTarget.style.background = action.hoverBg }}
                  onMouseLeave={e => { if (dossier.statut !== action.statut) e.currentTarget.style.background = action.bg }}>
                  {actionEnCours === action.statut ? '...' : action.label}
                  {dossier.statut === action.statut && <span style={{ fontSize: 10, marginLeft: 6, color: '#94a3b8' }}>(actuel)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Statut actuel */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>📊 Statut actuel</p>
            <div style={{ background: s.bg, borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.label}</span>
            </div>
          </div>

          {/* Infos demandeur */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>👤 Demandeur</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Nom', value: `${dossier.demandeur?.prenom} ${dossier.demandeur?.nom}` },
                { label: 'Email', value: dossier.demandeur?.email },
                { label: 'Dépôt', value: new Date(dossier.cree_le).toLocaleDateString('fr-FR') },
                { label: 'Ancienneté', value: `${jours} jour(s)` },
              ].map((info, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 8, borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#94a3b8' }}>{info.label}</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{info.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🤖 Modale Suggestions IA */}
      {showModalReponses && (
        <div
          onClick={() => setShowModalReponses(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, maxWidth: 700, width: '100%', maxHeight: '85vh',
              overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
            }}>
            {/* Header modale */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8ecf4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18 }}>💡</span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Suggestions de réponses IA</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Choisissez un message à envoyer ou modifier</p>
                </div>
              </div>
              <button onClick={() => setShowModalReponses(false)}
                style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 16, color: '#64748b' }}>
                ✕
              </button>
            </div>

            {/* Contenu */}
            <div style={{ padding: 24 }}>
              {reponsesEnCours ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ display: 'inline-block', width: 40, height: 40, border: '3px solid #ddd6fe', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: 14, color: '#64748b', marginTop: 16, fontWeight: 500 }}>L'IA analyse le contexte...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : reponsesIA && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { key: 'acceptation', label: '✅ Acceptation', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
                    { key: 'complement', label: '📎 Demande de complément', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
                    { key: 'refus', label: '❌ Refus motivé', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                  ].map(({ key, label, color, bg, border }) => (
                    <div key={key} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
                        <button onClick={() => utiliserReponseIA(reponsesIA[key])}
                          style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                            background: color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit'
                          }}>
                          Utiliser →
                        </button>
                      </div>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {reponsesIA[key]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default DetailDossierInstructeur