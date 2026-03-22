import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api'

function Login() {
  const navigate = useNavigate()
  const [erreur, setErreur] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    setErreur('')
    try {
      const response = await api.post('/auth/login', {
        email: data.email,
        mot_de_passe: data.mot_de_passe
      })
      localStorage.setItem('token', response.data.access_token)
      navigate('/')
    } catch (err) {
      setErreur(err.response?.data?.detail || 'Erreur de connexion')
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
        <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
          S'inscrire
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
      <div className="flex items-center justify-center px-4 py-20">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h1>
            <p className="text-gray-500 text-sm">Accédez à votre espace personnel</p>
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
              {erreur}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <a href="#" className="text-sm text-blue-700 hover:underline">Mot de passe oublié ?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                {...register('mot_de_passe', { required: 'Mot de passe obligatoire' })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
              />
              {errors.mot_de_passe && <p className="text-red-500 text-xs mt-1">{errors.mot_de_passe.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{backgroundColor: '#1f2d6e'}}
              className="hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-opacity mt-2 text-sm">
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-blue-700 font-semibold hover:underline">
              S'inscrire
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

export default Login