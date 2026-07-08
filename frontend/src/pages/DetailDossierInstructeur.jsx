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
  const [documents, setDocuments] = useState([])
  const [nouveauMessage, setNouveauMessage] = useState('')
  const [chargement, setChargement] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [actionEnCours, setActionEnCours] = useState(null)
  const [toast, setToast] = useState(null)
  // Commentaire interne
  const [commentaireInterne, setCommentaireInterne] = useState('')
  const [enregistrementCommentaire, setEnregistrementCommentaire] = useState(false)
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
      const [dossierRes, messagesRes, docsRes] = await Promise.all([
        api.get(`/dossiers/${id}`),
        api.get(`/messages/${id}`),
        api.get(`/documents/dossier/${id}`),
      ])
      setDossier(dossierRes.data)
      setMessages(messagesRes.data)
      setDocuments(docsRes.data)
      // Charger le commentaire interne existant
      setCommentaireInterne(dossierRes.data.commentaire_interne || '')
      await api.patch(`/messages/${id}/lire`, { user_id: userId })
    } catch {
      navigate('/instructeur')
    } finally {
      setChargement(false)
    }
  }

  const fmtTaille = (o) => !o ? '' : o < 1024 ? `${o} o` : o < 1048576 ? `${(o / 1024).toFixed(1)} Ko` : `${(o / 1048576).toFixed(1)} Mo`

  const changerStatut = async (statut) => {
    setActionEnCours(statut)
    try {
      await api.patch(`/dossiers/${id}/statut?statut=${statut}`)
      setDossier(prev => ({ ...prev, statut }))
      setToast({ type: 'success', message: `Dossier marqué comme "${STATUT[statut]?.label || statut}"` })
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: "Erreur lors de la mise à jour du statut" })
    } finally {
      setActionEnCours(null)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const enregistrerCommentaireInterne = async () => {
    if (enregistrementCommentaire) return
    setEnregistrementCommentaire(true)
    try {
      await api.patch(`/dossiers/${id}/commentaire-interne`, { commentaire_interne: commentaireInterne })
      setToast({ type: 'success', message: 'Commentaire interne enregistré' })
    } catch {
      setToast({ type: 'error', message: "Erreur lors de l'enregistrement du commentaire" })
    } finally {
      setEnregistrementCommentaire(false)
      setTimeout(() => setToast(null), 3000)
    }
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
      {toast && (
        <div className={`toast-${toast.type}`} style={{
          position: 'fixed', bottom: 24, right: 24, padding: '14px 20px',
          borderRadius: 8, fontSize: 14, fontWeight: 600, zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toast.message}
        </div>
      )}

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

          {/* Documents justificatifs */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <span className="card-title">📎 Documents justificatifs</span>
              <span className="count-badge">{documents.length} fichier(s)</span>
            </div>
            <div style={{ padding: '16px' }}>
              {documents.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', padding: '16px 0' }}>Aucun document joint par le demandeur</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {documents.map((doc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #e8ecf4', borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{doc.type_fichier === 'pdf' ? '📄' : '🖼️'}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, maxWidth: 280, overflow:'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.open('http://127.0.0.1:8000/documents/telecharger/' + doc.id, '_blank')}>{doc.nom_fichier}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{fmtTaille(doc.taille)} · {new Date(doc.cree_le).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 🤖 Card Analyse IA */}
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 4px 24px rgba(124,58,237,0.1)' }}>
            <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 60%, #6d28d9 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Analyse intelligente du dossier</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, marginBottom: 0 }}>Synthèse générée par IA</p>
                </div>
              </div>
              <button onClick={analyserDossierIA} disabled={analyseEnCours} style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: analyseEnCours ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.22)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', cursor: analyseEnCours ? 'not-allowed' : 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(8px)' }}>
                {analyseEnCours ? '⏳ Analyse en cours...' : analyseIA ? '🔄 Réanalyser' : '✨ Lancer l\'analyse'}
              </button>
            </div>

            <div style={{ background: 'linear-gradient(160deg, #faf5ff 0%, #f8f7ff 100%)', padding: analyseIA ? 18 : 0 }}>
              {!analyseIA && !analyseEnCours && (
                <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#a78bfa', fontWeight: 500 }}>Cliquez sur <strong>Lancer l'analyse</strong> pour obtenir une synthèse IA de ce dossier.</p>
                </div>
              )}
              {analyseEnCours && (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid #ddd6fe', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: 13, color: '#7c3aed', marginTop: 14, fontWeight: 600 }}>L'IA analyse votre dossier...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
              {analyseIA && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>📋 Résumé</p>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>{analyseIA.resume}</p>
                  </div>
                  {(() => {
                    const score = analyseIA.score_complétude ?? analyseIA.score_completude ?? 0
                    const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
                    const scoreBg = score >= 80 ? 'rgba(16,185,129,0.08)' : score >= 50 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)'
                    const scoreBorder = score >= 80 ? 'rgba(16,185,129,0.2)' : score >= 50 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'
                    return (
                      <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(99,102,241,0.12)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <p style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>📊 Score de complétude</p>
                          <span style={{ fontSize: 20, fontWeight: 900, color: scoreColor, background: scoreBg, border: `1px solid ${scoreBorder}`, borderRadius: 8, padding: '2px 10px' }}>{score}%</span>
                        </div>
                        <div style={{ background: '#f1f5f9', borderRadius: 100, height: 10, overflow: 'hidden' }}>
                          <div style={{ width: `${score}%`, height: '100%', borderRadius: 100, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}cc)`, transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                    )
                  })()}
                  {analyseIA.points_attention?.length > 0 && (
                    <div style={{ background: '#fffbeb', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(245,158,11,0.25)' }}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>⚠️ Points d'attention</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {analyseIA.points_attention.map((p, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', flexShrink: 0, marginTop: 5 }} />
                            <span style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.6 }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {analyseIA.documents_manquants?.length > 0 && (
                    <div style={{ background: '#fef2f2', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>📎 Documents manquants</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {analyseIA.documents_manquants.map((d, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: 5 }} />
                            <span style={{ fontSize: 12.5, color: '#991b1b', lineHeight: 1.6 }}>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {analyseIA.recommandation && (
                    <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(124,58,237,0.06))', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>💡 Recommandation</p>
                      <p style={{ fontSize: 13, color: '#3730a3', lineHeight: 1.65, fontWeight: 600, margin: 0 }}>{analyseIA.recommandation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Messagerie */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <span className="card-title">💬 Messagerie avec le demandeur</span>
              <span className="count-badge">{messages.length} message(s)</span>
            </div>
            <div style={{ height: 280, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 40 }}>Aucun message — démarrez la conversation !</div>
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
                      <div style={{ padding: '10px 14px', borderRadius: estMoi ? '12px 4px 12px 12px' : '4px 12px 12px 12px', background: estMoi ? '#2563eb' : '#fff', color: estMoi ? '#fff' : '#374151', fontSize: 13, lineHeight: 1.5, border: estMoi ? 'none' : '1px solid #e8ecf4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        {msg.contenu}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #e8ecf4', background: '#fff', display: 'flex', gap: 8 }}>
              <input type="text" value={nouveauMessage} onChange={e => setNouveauMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && envoyerMessage()} placeholder="Écrire un message au demandeur..." className="search-input" style={{ flex: 1 }} />
              <button onClick={suggererReponsesIA} disabled={reponsesEnCours} title="Suggérer une réponse avec IA" style={{ padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', cursor: reponsesEnCours ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: reponsesEnCours ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                {reponsesEnCours ? '⏳' : '💡 IA'}
              </button>
              <button onClick={envoyerMessage} disabled={!nouveauMessage.trim() || envoi} className="btn btn-primary" style={{ opacity: (!nouveauMessage.trim() || envoi) ? 0.5 : 1 }}>
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
                <button key={action.statut} onClick={() => changerStatut(action.statut)} disabled={dossier.statut === action.statut || actionEnCours !== null}
                  style={{ padding: '11px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: dossier.statut === action.statut ? '#f1f5f9' : action.bg, color: dossier.statut === action.statut ? '#94a3b8' : action.color, border: `1px solid ${dossier.statut === action.statut ? '#e8ecf4' : 'transparent'}`, cursor: dossier.statut === action.statut ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textAlign: 'left', opacity: actionEnCours && actionEnCours !== action.statut ? 0.5 : 1 }}
                  onMouseEnter={e => { if (dossier.statut !== action.statut) e.currentTarget.style.background = action.hoverBg }}
                  onMouseLeave={e => { if (dossier.statut !== action.statut) e.currentTarget.style.background = action.bg }}>
                  {actionEnCours === action.statut ? '...' : action.label}
                  {dossier.statut === action.statut && <span style={{ fontSize: 10, marginLeft: 6, color: '#94a3b8' }}>(actuel)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* ---- COMMENTAIRE INTERNE ---- */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>🔒 Commentaire interne</p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>Visible uniquement par l'équipe d'instruction</p>
            <textarea
              value={commentaireInterne}
              onChange={e => setCommentaireInterne(e.target.value)}
              placeholder="Ajouter une note interne sur ce dossier..."
              rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e8ecf4', fontSize: 13, color: '#374151', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e8ecf4'}
            />
            <button
              onClick={enregistrerCommentaireInterne}
              disabled={enregistrementCommentaire}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 10, opacity: enregistrementCommentaire ? 0.6 : 1 }}>
              {enregistrementCommentaire ? 'Enregistrement...' : '💾 Enregistrer'}
            </button>
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

      {/* Modale Suggestions IA */}
      {showModalReponses && (
        <div onClick={() => setShowModalReponses(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 680, width: '100%', maxHeight: '88vh', overflow: 'auto', boxShadow: '0 32px 80px rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 60%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1, borderRadius: '20px 20px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18 }}>💡</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Suggestions de réponses IA</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, marginBottom: 0 }}>Choisissez un message à envoyer ou modifier</p>
                </div>
              </div>
              <button onClick={() => setShowModalReponses(false)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: 22, background: '#f8f7ff' }}>
              {reponsesEnCours ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ display: 'inline-block', width: 40, height: 40, border: '3px solid #ddd6fe', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: 14, color: '#7c3aed', marginTop: 16, fontWeight: 600 }}>L'IA analyse le contexte...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : reponsesIA && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { key: 'acceptation', label: '✅ Acceptation', color: '#059669', bg: '#fff', border: 'rgba(16,185,129,0.25)', accent: 'rgba(16,185,129,0.08)', btnColor: '#10b981' },
                    { key: 'complement', label: '📎 Demande de complément', color: '#ea580c', bg: '#fff', border: 'rgba(234,88,12,0.25)', accent: 'rgba(234,88,12,0.07)', btnColor: '#ea580c' },
                    { key: 'refus', label: '❌ Refus motivé', color: '#dc2626', bg: '#fff', border: 'rgba(220,38,38,0.25)', accent: 'rgba(220,38,38,0.07)', btnColor: '#ef4444' },
                  ].map(({ key, label, color, bg, border, accent, btnColor }) => (
                    <div key={key} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', background: accent, borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
                        <button onClick={() => utiliserReponseIA(reponsesIA[key])} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: btnColor, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Utiliser →</button>
                      </div>
                      <pre style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, padding: '14px 16px' }}>
                        {String(reponsesIA[key] ?? '').replace(/\\n/g, '\n')}
                      </pre>
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



