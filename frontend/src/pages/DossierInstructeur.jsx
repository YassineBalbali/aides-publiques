import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SidebarLayout, IconFolder, IconChart } from './SidebarLayout'
import api from '../api'

const INSTRUCTEUR_NAV = [
  { to: '/instructeur', label: 'Mes dossiers', Icon: IconFolder },
  { to: '/instructeur/dashboard', label: 'Dashboard', Icon: IconChart },
]

const badgeStatut = (statut) => {
  const map = { brouillon: 'bg-gray-100 text-gray-500', depose: 'bg-blue-50 text-blue-600', en_instruction: 'bg-amber-50 text-amber-600', accepte: 'bg-emerald-50 text-emerald-600', refuse: 'bg-red-50 text-red-500' }
  const labels = { brouillon: 'Brouillon', depose: 'Déposé', en_instruction: 'En instruction', accepte: 'Accepté', refuse: 'Refusé' }
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${map[statut] || 'bg-gray-100 text-gray-500'}`}>{labels[statut] || statut}</span>
}

function DetailDossierInstructeur() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dossier, setDossier] = useState(null)
  const [messages, setMessages] = useState([])
  const [nouveauMessage, setNouveauMessage] = useState('')
  const [chargement, setChargement] = useState(true)
  const [envoi, setEnvoi] = useState(false)
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
    try {
      await api.patch(`/dossiers/${id}/statut?statut=${statut}`)
      setDossier(prev => ({ ...prev, statut }))
    } catch (err) { console.error(err) }
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

  if (chargement) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #e0f2fe 100%)' }}>
      <div className="w-8 h-8 border-2 border-[#0284c7] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!dossier) return null

  return (
    <SidebarLayout navItems={INSTRUCTEUR_NAV} role="instructeur" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="p-2">

        <button onClick={() => navigate('/instructeur')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0284c7] transition-colors mb-4 bg-white/60 px-4 py-2 rounded-xl border border-white/60">
          ← Retour aux dossiers
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Colonne gauche */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Info dossier */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-xl font-extrabold text-gray-800">{dossier.numero}</h1>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {dossier.demandeur?.prenom} {dossier.demandeur?.nom} · {dossier.demandeur?.email}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">Déposé le {new Date(dossier.cree_le).toLocaleDateString('fr-FR')}</p>
                </div>
                {badgeStatut(dossier.statut)}
              </div>
              {dossier.commentaire && (
                <div className="bg-gray-50 rounded-xl p-3 mt-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-gray-600 text-sm">{dossier.commentaire}</p>
                </div>
              )}
            </div>

            {/* Messagerie */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-700">💬 Messagerie avec le demandeur</h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{messages.length} message(s)</span>
              </div>

              <div className="h-64 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ background: 'linear-gradient(135deg, #f8faff, #f0f4ff)' }}>
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center mt-8">Aucun message — démarrez la conversation !</p>
                ) : messages.map((msg, i) => {
                  const estMoi = msg.expediteur_id === userId
                  return (
                    <div key={i} className={`flex gap-2 ${estMoi ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                        style={{ background: estMoi ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#94a3b8' }}>
                        {estMoi ? 'I' : (msg.expediteur_nom?.[0] || 'D')}
                      </div>
                      <div className={`max-w-[70%] flex flex-col ${estMoi ? 'items-end' : 'items-start'}`}>
                        <p className="text-[10px] text-gray-400 mb-1 px-1">
                          {estMoi ? 'Vous (Instructeur)' : msg.expediteur_nom} · {new Date(msg.cree_le).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${estMoi ? 'text-white rounded-tr-sm' : 'bg-white text-gray-700 rounded-tl-sm shadow-sm border border-gray-100'}`}
                          style={estMoi ? { background: 'linear-gradient(135deg, #0284c7, #0369a1)' } : {}}>
                          {msg.contenu}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2">
                <input type="text" value={nouveauMessage} onChange={e => setNouveauMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && envoyerMessage()}
                  placeholder="Écrire un message au demandeur..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0284c7] transition-colors bg-gray-50" />
                <button onClick={envoyerMessage} disabled={!nouveauMessage.trim() || envoi}
                  className="text-white font-bold px-4 py-2.5 rounded-xl disabled:opacity-40 text-sm hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}>
                  {envoi ? '...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>

          {/* Colonne droite — Actions */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">⚡ Actions</h2>
              <div className="flex flex-col gap-2">
                <button onClick={() => changerStatut('en_instruction')}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold py-2.5 rounded-xl text-sm transition-colors border border-amber-100">
                  🔍 Mettre en instruction
                </button>
                <button onClick={() => changerStatut('accepte')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold py-2.5 rounded-xl text-sm transition-colors border border-emerald-100">
                  ✅ Accepter le dossier
                </button>
                <button onClick={() => changerStatut('refuse')}
                  className="bg-red-50 hover:bg-red-100 text-red-500 font-bold py-2.5 rounded-xl text-sm transition-colors border border-red-100">
                  ❌ Refuser le dossier
                </button>
                <button onClick={() => changerStatut('complement_demande')}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold py-2.5 rounded-xl text-sm transition-colors border border-orange-100">
                  📎 Demander complément
                </button>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">📊 Statut actuel</h2>
              <div className="bg-gray-50 rounded-xl p-3">
                {badgeStatut(dossier.statut)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default DetailDossierInstructeur