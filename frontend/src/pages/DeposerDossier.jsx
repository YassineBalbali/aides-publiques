import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api'

function DeposerDossier() {
  const navigate = useNavigate()
  const [aides, setAides] = useState([])
  const [succes, setSucces] = useState(false)
  const [numeroDossier, setNumeroDossier] = useState('')
  const [erreur, setErreur] = useState('')
  const [siretChargement, setSiretChargement] = useState(false)
  const [siretInfo, setSiretInfo] = useState('')
  const [siretErreur, setSiretErreur] = useState('')
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm()

  const document = watch('document')

  useEffect(() => {
    api.get('/aides/')
      .then(r => setAides(r.data))
      .catch(() => {})
  }, [])

  const onSubmit = async (data) => {
    setErreur('')
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const response = await api.post(`/dossiers/?demandeur_id=${payload.sub}`, {
        aide_id: data.aide_id,
        commentaire: data.description || data.commentaire
      })
      setNumeroDossier(response.data.numero)
      setSucces(true)
    } catch (err) {
      setErreur(err.response?.data?.detail || 'Erreur lors du dépôt')
    }
  }

  const BandeauRF = () => (
    <div>
      <div style={{backgroundColor: '#1f2d6e'}} className="px-8 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white font-bold text-sm px-2 py-1">RF</div>
          <div className="text-white text-xs">
            <div className="font-bold">RÉPUBLIQUE FRANÇAISE</div>
            <div className="text-blue-200">Liberté · Égalité · Fraternité</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-white text-sm hover:underline">→ Connexion</Link>
          <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded transition-colors">S'inscrire</Link>
        </div>
      </div>
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between shadow-sm">
        <a href="/" className="text-blue-900 font-bold text-xl">Aides Publiques</a>
        <div className="flex items-center gap-8 text-sm">
          <a href="/" className="text-gray-700 hover:text-blue-900 transition-colors">Accueil</a>
          <a href="/aides" className="text-gray-700 hover:text-blue-900 transition-colors">Catalogue des aides</a>
          <a href="/deposer" className="text-blue-900 font-semibold border-b-2 border-blue-900 pb-1">Déposer un dossier</a>
          <a href="/mon-espace" className="text-gray-700 hover:text-blue-900 transition-colors">Suivi</a>
        </div>
      </div>
    </div>
  )

  const Footer = () => (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 px-12 mt-12">
      <div className="grid grid-cols-4 gap-8 max-w-6xl mx-auto mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-red-600 text-white font-bold text-sm px-2 py-1">RF</div>
            <span className="font-bold text-gray-900 text-sm">RÉPUBLIQUE FRANÇAISE</span>
          </div>
          <p className="text-gray-500 text-sm">Plateforme de gestion et suivi des aides publiques.</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Navigation</h3>
          <div className="flex flex-col gap-2">
            <a href="/aides" className="text-gray-500 hover:text-blue-900 text-sm">Catalogue des aides</a>
            <a href="/deposer" className="text-gray-500 hover:text-blue-900 text-sm">Déposer un dossier</a>
            <a href="/mon-espace" className="text-gray-500 hover:text-blue-900 text-sm">Suivre mon dossier</a>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Espace pro</h3>
          <div className="flex flex-col gap-2">
            <a href="/instructeur" className="text-gray-500 hover:text-blue-900 text-sm">Espace instructeur</a>
            <a href="/admin" className="text-gray-500 hover:text-blue-900 text-sm">Administration</a>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Informations</h3>
          <div className="flex flex-col gap-2">
            <a href="#" className="text-gray-500 hover:text-blue-900 text-sm">Mentions légales</a>
            <a href="#" className="text-gray-500 hover:text-blue-900 text-sm">Politique de confidentialité</a>
            <a href="#" className="text-gray-500 hover:text-blue-900 text-sm">Accessibilité</a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-6 text-center">
        <p className="text-gray-400 text-sm">© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
      </div>
    </footer>
  )

  if (succes) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BandeauRF />
        <div className="max-w-2xl mx-auto py-20 px-4 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-3xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dossier soumis avec succès !</h1>
            <p className="text-gray-500 mb-6">Votre demande a bien été enregistrée.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 mb-8">
              <p className="text-sm text-gray-500 mb-1">Numéro de dossier</p>
              <p className="text-2xl font-bold text-blue-900">{numeroDossier}</p>
            </div>
            <p className="text-gray-400 text-sm mb-8">
              Conservez ce numéro pour suivre l'avancement de votre demande.
            </p>
            <div className="flex gap-3">
              <a href="/aides" className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded text-center hover:bg-gray-50">
                Retour au catalogue
              </a>
              <a href="/mon-espace" className="flex-1 text-white font-semibold py-3 rounded text-center hover:opacity-90" style={{backgroundColor: '#1f2d6e'}}>
                Suivre mon dossier
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BandeauRF />

      {/* Header */}
      <div style={{backgroundColor: '#1f2d6e'}} className="px-12 py-8">
        <h1 className="text-3xl font-bold text-white mb-1">Déposer un dossier</h1>
        <p className="text-blue-200">Remplissez le formulaire ci-dessous pour soumettre votre demande d'aide.</p>
      </div>

      <div className="max-w-3xl mx-auto py-10 px-4">
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Étape 1 — Aide demandée */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">1. Aide demandée</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionnez l'aide *</label>
            <select
              {...register('aide_id', { required: 'Veuillez sélectionner une aide' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm">
              <option value="">Choisir une aide...</option>
              {aides.map(aide => (
                <option key={aide.id} value={aide.id}>{aide.titre}</option>
              ))}
            </select>
            {errors.aide_id && <p className="text-red-500 text-xs mt-1">{errors.aide_id.message}</p>}
          </div>

          {/* Étape 2 — Informations demandeur */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">2. Informations du demandeur</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom / Raison sociale</label>
                <input
                  {...register('nom')}
                  placeholder="Ex: SARL Dupont & Fils"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SIRET (si applicable)</label>
                <div className="relative">
                  <input
                  {...register('siret')}
                  placeholder="123 456 789 00012"
                  maxLength={14}
                  onChange={async (e) => {
  const siret = e.target.value.replace(/\s/g, '')
  setValue('siret', e.target.value)
  if (siret.length === 14) {
    setSiretChargement(true)
    setSiretErreur('')
    setSiretInfo('')
    try {
      const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${siret}&page=1&per_page=1`)
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        const entreprise = data.results[0]
        const nom = entreprise.nom_raison_sociale || entreprise.nom_complet || ''
        const adresse = entreprise.siege?.adresse || ''
        setValue('nom', nom)
        setValue('adresse', adresse)
        setSiretInfo(`✅ ${nom}`)
      } else {
        setSiretErreur('SIRET non trouvé')
      }
    } catch {
      setSiretErreur('Erreur de recherche')
    } finally {
      setSiretChargement(false)
    }
  }
}}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
                  />
                  {siretChargement && <p className="text-blue-600 text-xs mt-1">🔍 Recherche en cours...</p>}
                  {siretInfo && <p className="text-green-600 text-xs mt-1">{siretInfo}</p>}
                  {siretErreur && <p className="text-red-500 text-xs mt-1">❌ {siretErreur}</p>}
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="contact@exemple.fr"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  {...register('telephone')}
                  placeholder="01 23 45 67 89"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                {...register('adresse')}
                placeholder="12 rue de la République, 75001 Paris"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
              />
            </div>
          </div>

          {/* Étape 3 — Détail de la demande */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">3. Détail de la demande</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant demandé (€)</label>
              <input
                {...register('montant')}
                placeholder="25000"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description du projet *</label>
              <textarea
                {...register('description', { required: 'Description obligatoire' })}
                rows={4}
                placeholder="Décrivez votre projet et l'utilisation prévue de l'aide..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Justification</label>
              <textarea
                {...register('justification')}
                rows={4}
                placeholder="Expliquez pourquoi vous êtes éligible à cette aide..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm resize-none"
              />
            </div>
          </div>

          {/* Étape 4 — Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">4. Documents justificatifs</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-900 transition-colors">
              <div className="text-4xl mb-3 text-gray-400">↑</div>
              <p className="text-gray-500 mb-1">Glissez-déposez vos fichiers ici</p>
              <p className="text-gray-400 text-sm mb-4">PDF, JPG, PNG — 10 Mo max par fichier</p>
              <label className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm">
                📄 Parcourir
                <input
                  type="file"
                  {...register('document')}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </label>
              {document && document[0] && (
                <p className="text-green-600 text-sm mt-4">✅ {document[0].name}</p>
              )}
            </div>
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
              ❌ {erreur}
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-4">
            <button
              type="button"
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              💾 Sauvegarder brouillon
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
              {isSubmitting ? 'Envoi...' : '→ Soumettre le dossier'}
            </button>
          </div>
        </form>

        <Footer />
      </div>
    </div>
  )
}

export default DeposerDossier