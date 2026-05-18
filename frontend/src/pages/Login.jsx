import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    setServerError('')
    try {
      const res = await api.post('/auth/login', { email: data.email, mot_de_passe: data.mot_de_passe })
      const { access_token } = res.data
      localStorage.setItem('token', access_token)
      const payload = JSON.parse(atob(access_token.split('.')[1]))
      if (payload.role === 'admin') navigate('/admin')
      else if (payload.role === 'instructeur') navigate('/instructeur')
      else navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Email ou mot de passe incorrect.')
    }
  }

  const inp = (err) => `w-full px-4 py-3 rounded-xl text-sm border ${err ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-blue-400'} outline-none text-gray-800 placeholder-gray-400 transition-colors`

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Panneau gauche */}
      <div className="w-5/12 bg-blue-900 flex flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/[0.04]" />

        <Link to="/" className="flex items-center gap-2.5 no-underline relative z-10">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">AP</span>
          </div>
          <span className="text-white font-bold text-base">Aides Publiques</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-white text-3xl font-extrabold leading-tight mb-4 tracking-tight">
            Accédez à vos<br />aides publiques
          </h2>
          <p className="text-blue-300 text-sm leading-relaxed mb-8">
            Gérez vos demandes d'aides publiques depuis votre espace personnel sécurisé.
          </p>
          <div className="flex flex-col gap-3">
            {['127 aides disponibles', '8 500+ dossiers traités', 'Réponse sous 48h garantie'].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-blue-200 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-400 text-xs relative z-10">© 2026 Plateforme Aides Publiques</p>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center px-12 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1.5">Connexion</h1>
            <p className="text-sm text-gray-500">Accédez à votre espace personnel</p>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Adresse email</label>
              <input type="email" placeholder="votre@email.fr"
                {...register('email', { required: "L'email est obligatoire" })}
                className={inp(!!errors.email)} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 font-semibold no-underline hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  {...register('mot_de_passe', { required: 'Obligatoire', minLength: { value: 6, message: 'Min 6 caractères' } })}
                  className={`${inp(!!errors.mot_de_passe)} pr-11`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-base">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.mot_de_passe && <p className="text-red-500 text-xs mt-1">{errors.mot_de_passe.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1">
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-blue-600 font-semibold no-underline hover:underline">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  )
}