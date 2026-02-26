import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const AIDES_DEMO = [
  { id: '56cd55a8-7d8c-4967-abe7-c1171998e7c5', titre: "Aide à la création d'entreprise", type_aide: 'subvention' },
  { id: '37bb533d-4f16-42c3-85a4-7365e4defad6', titre: "Bourse Nationale pour la Recherche", type_aide: 'subvention' },
  { id: '0dbf5b57-2a77-4b80-82fa-162f40b080af', titre: "Prêt à Taux Zéro Rénovation", type_aide: 'pret' },
  { id: 'bb3622c9-c1bd-43c3-b543-860d6c8b8454', titre: "Formation Professionnelle Continue", type_aide: 'formation' },
  { id: '99023bbb-4bbd-4aa9-9cd8-7e199db31085', titre: "Exonération Fiscale Zone Franche", type_aide: 'exoneration' },
  { id: 'e99b5e79-5d40-49bc-b0d1-934e988a77a7', titre: "Aide au Logement Social", type_aide: 'subvention' },
]

function DeposerDossier() {
  const navigate = useNavigate()
  const [etape, setEtape] = useState(1)
  const [form, setForm] = useState({
    aide_id: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    commentaire: '',
    document: null,
  })
  const [succes, setSucces] = useState(false)
  const [numeroDossier, setNumeroDossier] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')

    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const demandeurId = payload.sub

      const response = await fetch(
        `http://127.0.0.1:8000/dossiers/?demandeur_id=${demandeurId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aide_id: form.aide_id,
            commentaire: form.commentaire
          })
        }
      )

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail)

      setNumeroDossier(data.numero)
      setSucces(true)

    } catch (err) {
      setErreur(err.message || 'Erreur lors du dépôt du dossier')
    } finally {
      setChargement(false)
    }
  }

  const aideSelectionnee = AIDES_DEMO.find(a => a.id === form.aide_id)

  if (succes) {
    return (
      <div style={{backgroundColor: '#1a2744', minHeight: '100vh'}} className="flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-lg text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Dossier déposé avec succès !</h1>
          <p className="text-gray-500 mb-6">Votre demande a bien été enregistrée.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 mb-8">
            <p className="text-sm text-gray-500 mb-1">Numéro de dossier</p>
            <p className="text-2xl font-bold text-blue-700">{numeroDossier}</p>
          </div>
          <p className="text-gray-400 text-sm mb-8">
            Conservez ce numéro pour suivre l'avancement de votre demande.
            Un email de confirmation vous sera envoyé.
          </p>
          <div className="flex gap-3">
            <Link to="/aides" className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg text-center hover:bg-gray-50 transition-colors">
              Retour au catalogue
            </Link>
            <Link to="/" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-lg text-center transition-colors">
              Accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{backgroundColor: '#1a2744', minHeight: '100vh'}}>
      {/* Navbar */}
      <nav className="px-8 py-4 flex items-center justify-between border-b border-blue-800">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <span>🏛️</span><span>AidesPubliques</span>
        </Link>
        <div className="flex items-center gap-8 text-white">
          <Link to="/aides" className="hover:text-yellow-400">Catalogue</Link>
          <Link to="/deposer" className="text-yellow-400 font-semibold">Déposer</Link>
          <a href="#" className="hover:text-yellow-400">Suivi</a>
        </div>
        <Link to="/login" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-2 rounded-lg transition-colors">
          Se connecter
        </Link>
      </nav>

      <div className="px-12 py-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Déposer une demande</h1>
        <p className="text-gray-400 mb-8">Remplissez le formulaire pour soumettre votre dossier</p>

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-4 mb-10">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${etape >= n ? 'bg-yellow-400 text-gray-900' : 'bg-blue-900 text-gray-400'}`}>
                {n}
              </div>
              <span className={`text-sm ${etape >= n ? 'text-white' : 'text-gray-500'}`}>
                {n === 1 ? "Choix de l'aide" : n === 2 ? 'Vos informations' : 'Documents'}
              </span>
              {n < 3 && <div className={`h-px w-12 ${etape > n ? 'bg-yellow-400' : 'bg-blue-800'}`}></div>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Étape 1 — Choix de l'aide */}
          {etape === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Quelle aide souhaitez-vous demander ?</h2>
              <div className="flex flex-col gap-3 mb-8">
                {AIDES_DEMO.map(aide => (
                  <label key={aide.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                    ${form.aide_id === aide.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="aide_id"
                      value={aide.id}
                      checked={form.aide_id === aide.id}
                      onChange={handleChange}
                      className="accent-yellow-400"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{aide.titre}</p>
                      <p className="text-xs text-gray-400 capitalize">{aide.type_aide}</p>
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={() => form.aide_id && setEtape(2)}
                disabled={!form.aide_id}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
                Continuer →
              </button>
            </div>
          )}

          {/* Étape 2 — Informations personnelles */}
          {etape === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Vos informations</h2>
              <p className="text-gray-400 text-sm mb-6">
                Demande pour : <span className="font-semibold text-gray-700">{aideSelectionnee?.titre}</span>
              </p>
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input name="prenom" value={form.prenom} onChange={handleChange} required
                      placeholder="Mohamed"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input name="nom" value={form.nom} onChange={handleChange} required
                      placeholder="Ben Ali"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="votre@email.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="telephone" value={form.telephone} onChange={handleChange}
                    placeholder="+216 XX XXX XXX"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description de votre projet</label>
                  <textarea name="commentaire" value={form.commentaire} onChange={handleChange} rows={4}
                    placeholder="Décrivez votre projet et pourquoi vous sollicitez cette aide..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-400 resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEtape(1)}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  ← Retour
                </button>
                <button
                  onClick={() => form.nom && form.prenom && form.email && setEtape(3)}
                  disabled={!form.nom || !form.prenom || !form.email}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 — Documents */}
          {etape === 3 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Pièces justificatives</h2>
              <p className="text-gray-400 text-sm mb-6">Ajoutez les documents requis (PDF, JPG — max 5 MB)</p>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 hover:border-yellow-400 transition-colors">
                <div className="text-4xl mb-3">📎</div>
                <p className="text-gray-600 font-semibold mb-1">Glissez vos fichiers ici</p>
                <p className="text-gray-400 text-sm mb-4">ou</p>
                <label className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-2 rounded-lg cursor-pointer transition-colors">
                  Parcourir les fichiers
                  <input type="file" name="document" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                </label>
                {form.document && (
                  <p className="text-green-600 text-sm mt-4">✅ {form.document.name}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6 text-sm text-blue-700">
                📋 <strong>Documents généralement requis :</strong> Pièce d'identité, justificatif de domicile, RIB, business plan
              </div>

              {erreur && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
                  ❌ {erreur}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setEtape(2)}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  ← Retour
                </button>
                <button type="submit" disabled={chargement}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
                  {chargement ? 'Envoi en cours...' : 'Soumettre le dossier ✓'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeposerDossier