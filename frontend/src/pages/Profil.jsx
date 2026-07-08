import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProfilAdmin from './ProfilAdmin'
import api from '../api'
import NavbarShared from '../components/NavbarShared'

const ROLE_LABEL = { admin: 'Administrateur', instructeur: 'Instructeur', demandeur: 'Demandeur' }
const ROLE_CLS = { admin: 'bg-red-50 text-red-600 border border-red-100', instructeur: 'bg-blue-50 text-blue-700 border border-blue-100', demandeur: 'bg-emerald-50 text-emerald-700 border border-emerald-100' }

export default function Profil() {
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const role = payload?.role
  if (role === 'admin') return <ProfilAdmin />

  const userId = payload?.sub
  const navigate = useNavigate()
  const [profil, setProfil] = useState(null)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', type_beneficiaire: '', secteur_activite: '', localisation: '' })
  const [mdpForm, setMdpForm] = useState({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmer: '' })
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)
  const [locSuggestions, setLocSuggestions] = useState([])

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    api.get(`/auth/profil/${userId}`)
      .then(r => {
        setProfil({ ...r.data, photo: localStorage.getItem('user_photo') || r.data.photo || null })
        setForm({ nom: r.data.nom || '', prenom: r.data.prenom || '', email: r.data.email || '', type_beneficiaire: r.data.type_beneficiaire || '', secteur_activite: r.data.secteur_activite || '', localisation: r.data.localisation || '' })
        setChargement(false)
      }).catch(() => setChargement(false))
  }, [])

  const showMsg = (msg, isErr = false) => {
    if (isErr) { setErreur(msg); setMessage('') } else { setMessage(msg); setErreur('') }
    setTimeout(() => { setMessage(''); setErreur('') }, 3000)
  }

  const sauvegarder = async () => {
    try { await api.put(`/auth/profil/${userId}`, form); showMsg('Profil mis à jour !') }
    catch (err) { showMsg(err.response?.data?.detail || 'Erreur', true) }
  }

  const changerMdp = async () => {
    if (mdpForm.nouveau_mot_de_passe !== mdpForm.confirmer) { showMsg('Les mots de passe ne correspondent pas', true); return }
    if (mdpForm.nouveau_mot_de_passe.length < 6) { showMsg('Minimum 6 caractères', true); return }
    try {
      await api.put(`/auth/profil/${userId}`, { ancien_mot_de_passe: mdpForm.ancien_mot_de_passe, nouveau_mot_de_passe: mdpForm.nouveau_mot_de_passe })
      showMsg('Mot de passe changé !'); setMdpForm({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmer: '' })
    } catch (err) { showMsg(err.response?.data?.detail || 'Erreur', true) }
  }

  const uploadPhoto = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await api.post(`/auth/profil/${userId}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      localStorage.setItem('user_photo', res.data.photo); setProfil(prev => ({ ...prev, photo: res.data.photo })); showMsg('Photo mise à jour !')
    } catch { showMsg('Erreur photo', true) }
  }

  const supprimerPhoto = async () => {
    try {
      await api.delete(`/auth/profil/${userId}/photo`)
      localStorage.removeItem('user_photo'); setProfil(prev => ({ ...prev, photo: null })); showMsg('Photo supprimée')
    } catch { showMsg('Erreur lors de la suppression', true) }
  }

  const handleLoc = async (e) => {
    const val = e.target.value; setForm({ ...form, localisation: val })
    if (val.length >= 2) {
      try { const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&limit=5`); const d = await r.json(); setLocSuggestions(d.features || []) }
      catch { setLocSuggestions([]) }
    } else setLocSuggestions([])
  }

  const inp = `w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-indigo-400 bg-gray-50 text-gray-800 font-medium transition-colors`

  if (chargement) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7ff' }}>
      <NavbarShared />
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>
      <NavbarShared />
      <div className="px-6 py-7" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #f5f3ff 100%)', borderBottom: '1px solid #ede9fe' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Mon profil</h1>
          <p className="text-sm text-gray-400 mt-1">Gérez vos informations personnelles</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {message && <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-semibold text-emerald-700">✓ {message}</div>}
        {erreur && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold text-red-600">✕ {erreur}</div>}

        {/* Avatar */}
        <div className="bg-white rounded-2xl p-5 mb-5 flex items-center gap-5" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden">
              {profil?.photo ? <img src={profil.photo} alt="" className="w-full h-full object-cover" /> : <span className="text-white font-extrabold text-2xl">{(profil?.prenom?.[0] || '?').toUpperCase()}</span>}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center cursor-pointer" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <span className="text-white text-xs">✎</span>
              <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            </label>
          </div>
          <div>
            <p className="text-lg font-extrabold text-gray-900 tracking-tight">{profil?.prenom} {profil?.nom}</p>
            <p className="text-sm text-gray-500 mt-0.5">{profil?.email}</p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block mt-2 ${ROLE_CLS[role] || 'bg-gray-100 text-gray-500 border border-gray-200'}`}>{ROLE_LABEL[role]}</span>
            {profil?.photo && (
              <button onClick={supprimerPhoto} className="block mt-2 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                Supprimer la photo
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Informations */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <p className="text-sm font-bold text-gray-900 mb-5">Informations personnelles</p>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Prénom</label><input className={inp} value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom</label><input className={inp} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label><input className={inp} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type de bénéficiaire</label>
                <select className={inp} value={form.type_beneficiaire} onChange={e => setForm({ ...form, type_beneficiaire: e.target.value })}>
                  <option value="">Sélectionner...</option><option value="particulier">Particulier</option><option value="entreprise">Entreprise</option><option value="association">Association</option><option value="collectivite">Collectivité</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Secteur d'activité</label>
                <select className={inp} value={form.secteur_activite} onChange={e => setForm({ ...form, secteur_activite: e.target.value })}>
                  <option value="">Sélectionner...</option><option value="agriculture">Agriculture</option><option value="industrie">Industrie</option><option value="commerce">Commerce</option><option value="sante">Santé</option><option value="education">Éducation</option><option value="numerique">Numérique</option><option value="batiment">Bâtiment</option><option value="autre">Autre</option>
                </select>
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Localisation</label>
                <input className={inp} value={form.localisation} onChange={handleLoc} placeholder="Ex: Paris, Lyon..." autoComplete="off" />
                {locSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden mt-1">
                    {locSuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setForm({ ...form, localisation: s.properties.label }); setLocSuggestions([]) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                        {s.properties.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={sauvegarder} className="btn-gradient w-full py-2.5 text-sm font-bold rounded-xl" style={{ color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 12, fontFamily: 'inherit' }}>Sauvegarder</button>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <p className="text-sm font-bold text-gray-900 mb-5">Changer le mot de passe</p>
            <div className="flex flex-col gap-4">
              {[{ label: 'Mot de passe actuel', key: 'ancien_mot_de_passe' }, { label: 'Nouveau mot de passe', key: 'nouveau_mot_de_passe' }, { label: 'Confirmer', key: 'confirmer' }].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                  <input type="password" className={inp} placeholder="••••••••" value={mdpForm[key]} onChange={e => setMdpForm({ ...mdpForm, [key]: e.target.value })} />
                </div>
              ))}
              <button onClick={changerMdp} className="w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">Changer le mot de passe</button>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Informations du compte</p>
              {[{ l: 'Rôle', v: ROLE_LABEL[role] }, { l: 'ID', v: userId?.slice(0, 16) + '...' }].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-400">{s.l}</span>
                  <span className={`text-xs font-bold text-gray-700 ${i === 1 ? 'font-mono' : ''}`}>{s.v}</span>
                </div>
              ))}
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
