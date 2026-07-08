import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import NavbarShared from '../components/NavbarShared'

const STATUT = {
  brouillon: { label: 'Brouillon', cls: 'bg-gray-100 text-gray-500 border border-gray-200', dot: 'bg-gray-400' },
  depose: { label: 'Déposé', cls: 'bg-blue-50 text-blue-700 border border-blue-100', dot: 'bg-blue-500' },
  en_instruction: { label: 'En instruction', cls: 'bg-amber-50 text-amber-700 border border-amber-100', dot: 'bg-amber-500' },
  accepte: { label: 'Accepté', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100', dot: 'bg-emerald-500' },
  refuse: { label: 'Refusé', cls: 'bg-red-50 text-red-600 border border-red-100', dot: 'bg-red-500' },
  complement_demande: { label: 'Complément requis', cls: 'bg-orange-50 text-orange-600 border border-orange-100', dot: 'bg-orange-500' },
}

export default function DetailDossier() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dossier, setDossier] = useState(null)
  const [messages, setMessages] = useState([])
  const [documents, setDocuments] = useState([])
  const [historique, setHistorique] = useState([])
  const [nouveauMessage, setNouveauMessage] = useState('')
  const [chargement, setChargement] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const userId = payload?.sub
  const prenom = payload?.prenom || ''

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    charger()
  }, [id])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const charger = async () => {
    try {
      const [d, m, doc, hist] = await Promise.all([api.get(`/dossiers/${id}`), api.get(`/messages/${id}`), api.get(`/documents/dossier/${id}`), api.get(`/dossiers/${id}/historique`)])
      setDossier(d.data); setMessages(m.data); setDocuments(doc.data); setHistorique(hist.data)
      await api.patch(`/messages/${id}/lire`, { user_id: userId })
    } catch { navigate('/mon-espace') }
    finally { setChargement(false) }
  }

  const uploadDoc = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploadEnCours(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await api.post(`/documents/dossier/${id}?uploade_par=${userId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setDocuments(prev => [...prev, res.data])
    } catch (err) { console.error(err) }
    finally { setUploadEnCours(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const supprimer = async (docId) => { try { await api.delete(`/documents/${docId}`); setDocuments(prev => prev.filter(d => d.id !== docId)) } catch (err) { console.error(err) } }
  const fmtTaille = (o) => !o ? '' : o < 1024 ? `${o} o` : o < 1048576 ? `${(o / 1024).toFixed(1)} Ko` : `${(o / 1048576).toFixed(1)} Mo`

  const envoyerMsg = async () => {
    if (!nouveauMessage.trim() || envoi) return
    setEnvoi(true)
    try {
      const res = await api.post(`/messages/${id}`, { contenu: nouveauMessage.trim(), expediteur_id: userId })
      setMessages(prev => [...prev, res.data]); setNouveauMessage('')
    } catch { } finally { setEnvoi(false) }
  }

  if (chargement) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7ff' }}>
      <NavbarShared />
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!dossier) return null

  const s = STATUT[dossier.statut] || STATUT.brouillon
  const etapeActive = ['depose', 'en_instruction', 'accepte'].indexOf(dossier.statut)

  return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>
      <NavbarShared />
      <div className="max-w-6xl mx-auto px-6 py-6">
        <button onClick={() => navigate('/mon-espace')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 font-medium transition-colors">
          ← Retour à mes dossiers
        </button>

        <div className="grid grid-cols-3 gap-5 items-start">
          {/* Colonne principale */}
          <div className="col-span-2 flex flex-col gap-5">
            {/* Info dossier */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">{dossier.numero}</h1>
                  <p className="text-xs text-gray-400 mt-1">Déposé le {new Date(dossier.cree_le).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${s.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                </span>
              </div>
              {dossier.commentaire && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{dossier.commentaire}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
              <h2 className="text-sm font-bold text-gray-800 mb-5">📅 Avancement du dossier</h2>
              <div className="flex items-center">
                {['depose', 'en_instruction', dossier.statut === 'refuse' ? 'refuse' : 'accepte'].map((st, i) => {
                  const stepIdx = ['depose', 'en_instruction', 'accepte'].indexOf(st) === -1 ? 2 : ['depose', 'en_instruction', 'accepte'].indexOf(st)
                  const done = stepIdx <= etapeActive || (dossier.statut === 'accepte' && st === 'accepte') || (dossier.statut === 'refuse' && st === 'refuse')
                  const icons = { depose: '📋', en_instruction: '🔍', accepte: '✅', refuse: '❌' }
                  const labels = { depose: 'Déposé', en_instruction: 'En instruction', accepte: 'Accepté', refuse: 'Refusé' }
                  return (
                    <div key={i} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 text-lg`} style={{ background: done ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9' }}>
                          {done ? <span className="text-white text-xs font-bold">✓</span> : <span>{icons[st]}</span>}
                        </div>
                        <p className={`text-xs font-semibold text-center ${done ? 'text-indigo-600' : 'text-gray-400'}`}>{labels[st]}</p>
                      </div>
                      {i < 2 && <div className={`flex-1 h-0.5 mx-1 rounded-full ${done && i < etapeActive ? 'bg-indigo-500' : 'bg-gray-200'}`} style={{ marginBottom: 22 }} />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800">📎 Documents justificatifs</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{documents.length} fichier(s)</span>
              </div>
              <div className="p-5">
                <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 mb-4 cursor-pointer transition-all ${uploadEnCours ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}>
                  <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={uploadDoc} disabled={uploadEnCours} />
                  <span className="text-2xl">{uploadEnCours ? '⏳' : '📁'}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{uploadEnCours ? 'Upload en cours...' : 'Ajouter un document'}</p>
                    <p className="text-xs text-gray-400">PDF, JPG, PNG — 10 Mo max</p>
                  </div>
                </label>
                {documents.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-3">Aucun document joint</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{doc.type_fichier === 'pdf' ? '📄' : '🖼️'}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 truncate max-w-xs cursor-pointer hover:text-blue-600 underline" onClick={() => window.open(`http://127.0.0.1:8000/documents/telecharger/${doc.id}`, `_blank`)}>{doc.nom_fichier}</p>
                            <p className="text-xs text-gray-400">{fmtTaille(doc.taille)} · {new Date(doc.cree_le).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => supprimer(doc.id)} className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messagerie */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800">💬 Messagerie avec l'instructeur</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{messages.length} message(s)</span>
              </div>
              <div className="h-64 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 mt-10">Posez votre question à l'instructeur !</p>
                ) : messages.map((msg, i) => {
                  const estMoi = msg.expediteur_id === userId
                  return (
                    <div key={i} className={`flex gap-2 ${estMoi ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0`} style={{ background: estMoi ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#9ca3af' }}>
                        {estMoi ? (prenom?.[0] || 'M') : (msg.expediteur_nom?.[0] || 'I')}
                      </div>
                      <div className={`max-w-xs flex flex-col ${estMoi ? 'items-end' : 'items-start'}`}>
                        <p className="text-[10px] text-gray-400 mb-1">{estMoi ? 'Vous' : msg.expediteur_nom} · {new Date(msg.cree_le).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed`} style={estMoi ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderTopRightRadius: 4 } : { background: '#fff', color: '#374151', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTopLeftRadius: 4 }}>
                          {msg.contenu}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="px-5 py-3 border-t border-gray-100 bg-white flex gap-2">
                <input type="text" value={nouveauMessage} onChange={e => setNouveauMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && envoyerMsg()}
                  placeholder="Écrire un message à l'instructeur..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 bg-gray-50 transition-colors" />
                <button onClick={envoyerMsg} disabled={!nouveauMessage.trim() || envoi}
                  className="btn-gradient px-4 py-2.5 font-bold text-sm rounded-xl disabled:opacity-40"
                  style={{ color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 12, fontFamily: 'inherit' }}>
                  {envoi ? '...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
              <h2 className="text-sm font-bold text-gray-800 mb-4">📊 Informations</h2>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Numéro', value: dossier.numero, color: '#6366f1' },
                  { label: 'Statut', value: s.label, color: s.cls.includes('emerald') ? '#059669' : s.cls.includes('red') ? '#dc2626' : s.cls.includes('amber') ? '#d97706' : '#2563eb' },
                  { label: 'Date de dépôt', value: new Date(dossier.cree_le).toLocaleDateString('fr-FR'), color: '#374151' },
                  ...(dossier.instructeur_id ? [{ label: 'Instructeur', value: '✓ Affecté', color: '#059669' }] : []),
                ].map((info, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-400">{info.label}</span>
                    <span className="text-xs font-bold" style={{ color: info.color }}>{info.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Historique des actions */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
              <h2 className="text-sm font-bold text-gray-800 mb-4">🕐 Historique</h2>
              {historique.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-3">Aucune action enregistrée</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {historique.map((h, i) => (
                    <div key={h.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        {i < historique.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                      </div>
                      <div className="pb-3">
                        <p className="text-xs font-bold text-gray-700">{h.action}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{h.details}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(h.cree_le).toLocaleString('fr-FR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
              <h2 className="text-sm font-bold text-gray-800 mb-3">⚡ Actions</h2>
              <div className="flex flex-col gap-2">
                <Link to="/deposer" className="btn-gradient py-2.5 text-sm font-bold rounded-xl text-center no-underline" style={{ color: '#fff', fontFamily: 'inherit' }}>+ Nouveau dossier</Link>
                <button onClick={() => navigate('/mon-espace')} className="py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">← Mes dossiers</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="border-t border-gray-100 py-5 text-center mt-8">
        <p className="text-xs text-gray-400">© 2026 Plateforme Aides Publiques</p>
      </footer>
    </div>
  )
}

