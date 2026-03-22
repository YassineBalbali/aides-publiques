import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api'

function Register() {
  const navigate = useNavigate()
  const [erreur, setErreur] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

  const motDePasse = watch('mot_de_passe')

  const onSubmit = async (data) => {
    setErreur('')
    try {
      await api.post('/auth/register', {
        email: data.email,
        mot_de_passe: data.mot_de_passe,
        nom: data.nom,
        prenom: data.prenom
      })
      navigate('/login')
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur lors de l'inscription")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bandeau RF */}
      <div style={{backgroundColor: '#1f2d6e'}} className="px-8 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white font-bold text-sm px-2 py-1">RF</div>
          <div className="text-white text-xs">
            <div className="font-bold">RÉPUBLIQUE FRANÇAISE</div>
            <div className="text-blue-200">Liberté · Égalité · Fraternité</div>
          </div>
        </div>
        <Link to="/login" className="flex items-center gap-1 text-white text-sm hover:underline">
          → Connexion
        </Link>
      </div>

      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between shadow-sm">
        <a href="/" className="text-blue-900 font-bold text-xl">Aides Publiques</a>
        <div className="flex items-center gap-8 text-sm">
          <a href="/" className="text-gray-700 hover:text-blue-900 transition-colors">Accueil</a>
          <a href="/aides" className="text-gray-700 hover:text-blue-900 transition-colors">Catalogue des aides</a>
          <a href="/deposer" className="text-gray-700 hover:text-blue-900 transition-colors">Déposer un dossier</a>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h1>
            <p className="text-gray-500 text-sm">Inscrivez-vous pour accéder aux aides publiques</p>
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
              {erreur}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  placeholder="Jean"
                  {...register('prenom', { required: 'Prénom obligatoire' })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
                />
                {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  placeholder="Dupont"
                  {...register('nom', { required: 'Nom obligatoire' })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
              <input
                type="email"
                placeholder="vous@exemple.fr"
                {...register('email', { required: 'Email obligatoire' })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de profil</label>
              <select
                {...register('type_profil')}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-900 text-sm">
                <option value="">Sélectionnez...</option>
                <option value="particulier">Particulier</option>
                <option value="entreprise">Entreprise</option>
                <option value="association">Association</option>
                <option value="collectivite">Collectivité</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('mot_de_passe', {
                  required: 'Mot de passe obligatoire',
                  minLength: { value: 6, message: 'Minimum 6 caractères' }
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
              />
              {errors.mot_de_passe && <p className="text-red-500 text-xs mt-1">{errors.mot_de_passe.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('confirmer_mot_de_passe', {
                  required: 'Confirmation obligatoire',
                  validate: value => value === motDePasse || 'Les mots de passe ne correspondent pas'
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
              />
              {errors.confirmer_mot_de_passe && <p className="text-red-500 text-xs mt-1">{errors.confirmer_mot_de_passe.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{backgroundColor: '#1f2d6e'}}
              className="hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-opacity text-sm">
              {isSubmitting ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 px-8 text-center">
        <p className="text-gray-400 text-sm">© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
      </footer>
    </div>
  )
}

export default Register