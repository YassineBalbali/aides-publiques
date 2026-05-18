import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api'

const IconLock = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-[17px] h-[17px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>)
const IconEye = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>)
const IconEyeOff = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.555-4.17M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" /></svg>)

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [succes, setSucces] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    setServerError('')
    try {
      await api.post('/auth/password/reset', { token, nouveau_mot_de_passe: data.nouveau_mot_de_passe })
      setSucces(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Token invalide ou expiré.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche - Bleu */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)' }}>
        <div>
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <span className="text-white font-bold">AP</span>
            </div>
            <div>
              <p className="font-bold text-white">Aides Publiques</p>
              <p className="text-xs text-blue-200">Plateforme officielle</p>
            </div>
          </Link>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Sécurité<br />et confidentialité<br />de vos données
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Vos informations sont protégées par un système d'authentification sécurisé conforme aux standards RGPD.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <p className="text-sm">Chiffrement de bout en bout</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <p className="text-sm">Authentification sécurisée JWT</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm">Conformité RGPD</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-blue-200">© 2026 Plateforme Aides Publiques</p>
      </div>

      {/* Panneau droit - Formulaire */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-20 bg-gray-50">
        <div className="w-full max-w-md mx-auto">
          {/* Logo mobile */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}>
              <span className="text-white font-bold">AP</span>
            </div>
            <div>
              <p className="font-bold text-gray-800">Aides Publiques</p>
              <p className="text-xs text-gray-400">Plateforme officielle</p>
            </div>
          </div>

          {!token ? (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-red-50 border border-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Lien invalide</h1>
              <p className="text-gray-500 mb-8">Ce lien est invalide ou a expiré. Veuillez demander un nouveau lien pour réinitialiser votre mot de passe.</p>
              <Link to="/forgot-password" className="w-full inline-flex items-center justify-center text-white font-bold py-3.5 rounded-xl shadow-sm hover:opacity-90 transition-all no-underline" style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}>
                Demander un nouveau lien
              </Link>
              <p className="mt-6 text-sm text-gray-500 text-center">
                <Link to="/login" className="font-semibold text-blue-700 hover:underline no-underline">Retour à la connexion</Link>
              </p>
            </>
          ) : succes ? (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-emerald-50 border border-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Mot de passe modifié !</h1>
              <p className="text-gray-500 mb-2">Votre mot de passe a été mis à jour avec succès.</p>
              <p className="text-sm text-gray-400 mb-8">Redirection en cours vers la page de connexion...</p>
              <Link to="/login" className="w-full inline-flex items-center justify-center text-white font-bold py-3.5 rounded-xl shadow-sm hover:opacity-90 transition-all no-underline" style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}>
                Se connecter maintenant
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Nouveau mot de passe</h1>
              <p className="text-gray-500 mb-8">Choisissez un nouveau mot de passe sécurisé pour votre compte.</p>

              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Nouveau mot de passe</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 pointer-events-none"><IconLock /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('nouveau_mot_de_passe', {
                        required: 'Obligatoire',
                        minLength: { value: 6, message: 'Minimum 6 caractères' }
                      })}
                      className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all bg-white ${errors.nouveau_mot_de_passe ? 'border-red-400' : 'border-gray-200 focus:border-blue-700 focus:ring-2 focus:ring-blue-100'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  {errors.nouveau_mot_de_passe && (
                    <p className="text-xs text-red-500">{errors.nouveau_mot_de_passe.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Confirmer le mot de passe</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 pointer-events-none"><IconLock /></span>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmer', {
                        required: 'Obligatoire',
                        validate: (val) => val === watch('nouveau_mot_de_passe') || 'Les mots de passe ne correspondent pas'
                      })}
                      className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all bg-white ${errors.confirmer ? 'border-red-400' : 'border-gray-200 focus:border-blue-700 focus:ring-2 focus:ring-blue-100'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      tabIndex={-1}
                      className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirm ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  {errors.confirmer && (
                    <p className="text-xs text-red-500">{errors.confirmer.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white font-bold py-3.5 rounded-xl shadow-sm hover:opacity-90 disabled:opacity-60 transition-all mt-2"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}
                >
                  {isSubmitting ? 'Modification...' : 'Modifier le mot de passe'}
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-500 text-center">
                <Link to="/login" className="font-semibold text-blue-700 hover:underline no-underline">← Retour à la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword