import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api'

export default function ForgotPassword() {
  const [envoye, setEnvoye] = useState(false)
  const [emailEnvoye, setEmailEnvoye] = useState('')
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    setServerError('')
    try {
      await api.post('/auth/password/demande-reset', { email: data.email })
      setEmailEnvoye(data.email)
      setEnvoye(true)
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Email non trouvé.')
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Panneau gauche */}
      <div className="w-5/12 bg-blue-900 flex flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-white/5" />

        <Link to="/" className="flex items-center gap-3 no-underline relative z-10">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">AP</span>
          </div>
          <span className="text-white font-bold text-base">Aides Publiques</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-white text-3xl font-extrabold leading-tight mb-4 tracking-tight">
            Récupérez votre accès
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-8">
            Pas de panique ! Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
          <div className="flex flex-col gap-3">
            {[
              'Lien envoyé en quelques secondes',
              'Valable pendant 1 heure',
              'Aucune donnée perdue',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-blue-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-400 text-xs relative z-10">© 2026 Plateforme Aides Publiques</p>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">

          {!envoye ? (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1.5">Mot de passe oublié ?</h1>
                <p className="text-sm text-gray-400">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-600 font-medium">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Adresse email</label>
                  <input type="email" placeholder="vous@exemple.fr"
                    {...register('email', {
                      required: "L'email est obligatoire",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Format invalide" }
                    })}
                    className={`w-full px-4 py-3 rounded-xl text-sm border ${errors.email ? 'border-red-300 bg-red-50 text-red-800' : 'border-gray-200 bg-gray-50 text-gray-800'} outline-none focus:border-blue-500 focus:bg-white transition-colors`} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1">
                  {isSubmitting ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                <Link to="/login" className="text-blue-600 font-semibold no-underline hover:underline">← Retour à la connexion</Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1.5">Email envoyé !</h1>
                <p className="text-sm text-gray-400">Un lien de réinitialisation a été envoyé à</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 mb-5 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm">✉</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{emailEnvoye}</span>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-xs text-amber-700 font-medium">
                ⏱ Le lien est valable <strong>1 heure</strong>. Vérifiez aussi vos spams.
              </div>

              <Link to="/login"
                className="block w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl text-center no-underline hover:bg-blue-700 transition-colors">
                Retour à la connexion
              </Link>

              <p className="mt-4 text-center text-xs text-gray-400">
                Pas reçu ?{' '}
                <button onClick={() => setEnvoye(false)} className="text-blue-600 font-semibold hover:underline bg-none border-none cursor-pointer text-xs">
                  Réessayer
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}