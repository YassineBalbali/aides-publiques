import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api'
import NavbarShared from '../components/NavbarShared'

const MAX_SIZE = 10 * 1024 * 1024

function StepHeader({ n, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <span className="text-white font-extrabold text-xs">{n}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{title}</span>
    </div>
  )
}

export default function DeposerDossier() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [aides, setAides] = useState([])
  const [aideSelectionnee, setAideSelectionnee] = useState(null)
  const [succes, setSucces] = useState(false)
  const [numeroDossier, setNumeroDossier] = useState('')
  const [erreur, setErreur] = useState('')
  const [erreurFichier, setErreurFichier] = useState('')
  const [adresseSuggestions, setAdresseSuggestions] = useState([])
  const adresseRef = useRef(null)

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const prenom = payload?.prenom || ''
  const nom = payload?.nom || ''

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm()
  const documentWatch = watch('document')
  const aideIdWatch = watch('aide_id')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    api.get('/aides/').then(r => setAides(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setAideSelectionnee(aides.find(a => a.id === aideIdWatch) || null)
  }, [aideIdWatch, aides])

  useEffect(() => {
    const preselect = searchParams.get('aide_id')
    if (preselect && aides.length > 0) {
      setValue('aide_id', preselect)
    }
  }, [aides])

  useEffect(() => {
    if (documentWatch?.length > 0) {
      const invalides = Array.from(documentWatch).filter(f => f.size > MAX_SIZE)
      setErreurFichier(invalides.length > 0 ? `${invalides.length} fichier(s) dépassent 10 Mo` : '')
    }
  }, [documentWatch])

  const onSubmit = async (data) => {
    if (erreurFichier) return
    setErreur('')
    try {
      const details = [data.nom && `Nom : ${data.nom}`, data.siret && `SIRET : ${data.siret}`, data.email && `Email : ${data.email}`, data.telephone && `Tél : ${data.telephone}`, data.adresse && `Adresse : ${data.adresse}`, data.montant && `Montant : ${data.montant} €`, data.description && `Description : ${data.description}`, data.justification && `Justification : ${data.justification}`].filter(Boolean).join('\n')
      const res = await api.post(`/dossiers/?demandeur_id=${payload.sub}`, { aide_id: data.aide_id, commentaire: details })
      const dossierId = res.data.id
      if (data.document?.length > 0) {
        for (const file of Array.from(data.document)) {
          if (file.size <= MAX_SIZE) {
            const fd = new FormData(); fd.append('file', file)
            await api.post(`/documents/dossier/${dossierId}?uploade_par=${payload.sub}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
          }
        }
      }
      setNumeroDossier(res.data.numero); setSucces(true)
    } catch (err) { setErreur(err.response?.data?.detail || 'Erreur lors du dépôt') }
  }

  const handleAdresse = async (e) => {
    const val = e.target.value; setValue('adresse', val)
    if (val.length >= 3) {
      try { const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&limit=8`); const d = await r.json(); setAdresseSuggestions(d.features || []) }
      catch { setAdresseSuggestions([]) }
    } else setAdresseSuggestions([])
  }

  const inp = (err) => `w-full px-3 py-2.5 rounded-xl text-sm border ${err ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} outline-none focus:border-indigo-400 text-gray-800 transition-colors`

  if (succes) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7ff' }}>
      <div className="bg-white rounded-2xl p-12 max-w-md w-full text-center" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Dossier soumis !</h1>
        <p className="text-sm text-gray-500 mb-6">Votre demande a bien été enregistrée.</p>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Numéro de dossier</p>
          <p className="text-3xl font-extrabold tracking-tight" style={{ color: '#6366f1' }}>{numeroDossier}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/catalogue" className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl text-center no-underline hover:bg-gray-50">Catalogue</Link>
          <Link to="/mon-espace" className="btn-gradient flex-1 py-2.5 text-sm font-bold rounded-xl text-center no-underline" style={{ color: '#fff', fontFamily: 'inherit' }}>Suivre mon dossier →</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>
      <NavbarShared />
      <div className="px-6 py-7" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #f5f3ff 100%)', borderBottom: '1px solid #ede9fe' }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Déposer un dossier</h1>
          <p className="text-sm text-gray-400 mt-1">Remplissez le formulaire en 4 étapes pour soumettre votre demande.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Étape 1 */}
          <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <StepHeader n={1} title="Aide demandée" />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sélectionnez l'aide <span className="text-red-500">*</span></label>
              <select {...register('aide_id', { required: 'Veuillez sélectionner une aide' })} className={inp(!!errors.aide_id)}>
                <option value="">Choisir une aide...</option>
                {aides.map(a => <option key={a.id} value={a.id}>{a.titre}</option>)}
              </select>
              {errors.aide_id && <p className="text-red-500 text-xs mt-1">{errors.aide_id.message}</p>}
            </div>
            {aideSelectionnee && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mt-4">
                <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#6366f1' }}>Informations sur cette aide</p>
                <div className="grid grid-cols-2 gap-3">
                  {aideSelectionnee.type_aide && <div className="bg-white border border-gray-100 rounded-lg px-3 py-2.5"><p className="text-xs text-gray-400">Type</p><p className="text-sm font-bold text-gray-800 mt-0.5">{aideSelectionnee.type_aide}</p></div>}
                  {(aideSelectionnee.montant_min || aideSelectionnee.montant_max) && <div className="bg-white border border-gray-100 rounded-lg px-3 py-2.5"><p className="text-xs text-gray-400">Montant</p><p className="text-sm font-bold mt-0.5" style={{ color: '#6366f1' }}>{aideSelectionnee.montant_min?.toLocaleString() || '0'} – {aideSelectionnee.montant_max?.toLocaleString() || '∞'} €</p></div>}
                  {aideSelectionnee.organisme_financeur && <div className="bg-white border border-gray-100 rounded-lg px-3 py-2.5"><p className="text-xs text-gray-400">Organisme</p><p className="text-sm font-bold text-gray-800 mt-0.5">{aideSelectionnee.organisme_financeur}</p></div>}
                </div>
                {aideSelectionnee.documents_requis && (
                  <div className="mt-3 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs font-semibold text-amber-700">
                    📎 Documents requis : {aideSelectionnee.documents_requis}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Étape 2 */}
          <div className="bg-white rounded-2xl p-6 mb-4 overflow-visible" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <StepHeader n={2} title="Informations du demandeur" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom / Raison sociale</label><input {...register('nom')} placeholder="SARL Dupont & Fils" className={inp(false)} /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">SIRET</label><input {...register('siret')} placeholder="38012986646943" maxLength={14} className={inp(false)} /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Email de contact</label><input type="email" {...register('email')} placeholder="contact@exemple.fr" className={inp(false)} /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone</label><input {...register('telephone')} placeholder="01 23 45 67 89" className={inp(false)} /></div>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Adresse</label>
              <input ref={adresseRef} {...register('adresse')} placeholder="12 rue de la République, 75001 Paris" autoComplete="off" onChange={handleAdresse} className={inp(false)} />
              {adresseSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden mt-1 max-h-64 overflow-y-auto">
                  {adresseSuggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => { setValue('adresse', s.properties.label); setAdresseSuggestions([]) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                      {s.properties.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Étape 3 */}
          <div className="bg-white rounded-2xl p-6 mb-4" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <StepHeader n={3} title="Détail de la demande" />
            <div className="flex flex-col gap-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Montant demandé (€)</label><input {...register('montant')} placeholder="25000" className={inp(false)} /></div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description du projet <span className="text-red-500">*</span></label>
                <textarea {...register('description', { required: 'Description obligatoire' })} rows={4} placeholder="Décrivez votre projet..." className={`${inp(!!errors.description)} resize-none`} />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Justification</label><textarea {...register('justification')} rows={3} placeholder="Expliquez pourquoi vous êtes éligible..." className={`${inp(false)} resize-none`} /></div>
            </div>
          </div>

          {/* Étape 4 */}
          <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <StepHeader n={4} title="Documents justificatifs" />
            {aideSelectionnee?.documents_requis && (
              <div className="mb-4 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs font-semibold text-amber-700">
                📎 Documents requis : {aideSelectionnee.documents_requis}
              </div>
            )}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
              <p className="text-sm text-gray-600 mb-1">Glissez-déposez vos fichiers ici</p>
              <p className="text-xs text-gray-400 mb-5">PDF, JPG, PNG — max 10 Mo</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                📁 Parcourir les fichiers
                <input type="file" {...register('document')} accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" />
              </label>
              {documentWatch?.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 text-left">
                  {Array.from(documentWatch).map((f, i) => (
                    <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${f.size > MAX_SIZE ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                      <span className={`font-bold ${f.size > MAX_SIZE ? 'text-red-500' : 'text-emerald-600'}`}>{f.size > MAX_SIZE ? '✕' : '✓'}</span>
                      <span className="text-gray-700 flex-1">{f.name}</span>
                      <span className="text-gray-400">{(f.size / 1048576).toFixed(1)} Mo</span>
                    </div>
                  ))}
                </div>
              )}
              {erreurFichier && <p className="text-red-500 text-xs mt-3">{erreurFichier}</p>}
            </div>
          </div>

          {erreur && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold text-red-600">{erreur}</div>}

          <div className="flex gap-3">
            <button type="button" className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Sauvegarder brouillon</button>
            <button type="submit" disabled={isSubmitting || !!erreurFichier}
              className="btn-gradient flex-[2] py-3 text-sm font-bold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 12, fontFamily: 'inherit' }}>
              {isSubmitting ? 'Envoi en cours...' : 'Soumettre le dossier →'}
            </button>
          </div>
        </form>
      </div>
      <footer className="border-t border-gray-100 py-5 text-center mt-4">
        <p className="text-xs text-gray-400">© 2026 Plateforme Aides Publiques</p>
      </footer>
    </div>
  )
}
