import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api'

const TYPES = [
  { value: 'particulier', label: 'Particulier', desc: 'Personne physique', icon: '👤' },
  { value: 'entreprise', label: 'Entreprise', desc: 'Société, TPE, PME', icon: '🏢' },
  { value: 'association', label: 'Association', desc: 'But non lucratif', icon: '🤝' },
]

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [erreur, setErreur] = useState('')
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm()

  const handleTypeSelect = (value) => {
    setSelectedType(value)
    setValue('type_beneficiaire', value, { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    setErreur('')
    try {
      await api.post('/auth/register', {
        nom: data.nom, prenom: data.prenom, email: data.email,
        mot_de_passe: data.mot_de_passe, type_beneficiaire: data.type_beneficiaire
      })
      navigate('/login')
    } catch (err) { setErreur(err.response?.data?.detail || "Une erreur est survenue.") }
  }

  const inp = (err) => `w-full px-4 py-3 rounded-xl text-sm border ${err ? 'border-red-300 bg-red-50 text-red-800' : 'border-gray-200 bg-gray-50 text-gray-800'} outline-none focus:border-blue-500 focus:bg-white transition-colors`

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
            Rejoignez la plateforme
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-8">
            Créez votre compte gratuitement et accédez à plus de 127 aides publiques disponibles.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[{ n: '127', l: 'Aides' }, { n: '3 240', l: 'Bénéficiaires' }, { n: '8 500+', l: 'Dossiers' }, { n: '45', l: 'Partenaires' }].map((s, i) => (
              <div key={i} className="bg-white/10 border border-white/10 rounded-xl p-3.5">
                <div className="text-white font-extrabold text-xl tracking-tight">{s.n}</div>
                <div className="text-blue-200 text-xs mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-400 text-xs relative z-10">© 2026 Plateforme Aides Publiques</p>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1.5">Créer un compte</h1>
            <p className="text-sm text-gray-400">Inscrivez-vous pour déposer vos demandes</p>
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-600 font-medium">
              {erreur}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {/* Nom / Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom</label>
                <input type="text" placeholder="Dupont" {...register('nom', { required: 'Obligatoire' })} className={inp(!!errors.nom)} />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Prénom</label>
                <input type="text" placeholder="Jean" {...register('prenom', { required: 'Obligatoire' })} className={inp(!!errors.prenom)} />
                {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Adresse email</label>
              <input type="email" placeholder="votre@email.fr"
                {...register('email', { required: 'Obligatoire', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format invalide' } })}
                className={inp(!!errors.email)} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Type bénéficiaire */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Type de bénéficiaire</label>
              <input type="hidden" {...register('type_beneficiaire', { required: 'Veuillez choisir un type' })} />
              <div className="grid grid-cols-3 gap-2.5">
                {TYPES.map(({ value, label, desc, icon }) => (
                  <button key={value} type="button" onClick={() => handleTypeSelect(value)}
                    className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      selectedType === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                    }`}>
                    <div className="text-lg mb-1">{icon}</div>
                    <div className={`text-xs font-bold ${selectedType === value ? 'text-blue-700' : 'text-gray-700'}`}>{label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
              {errors.type_beneficiaire && <p className="text-red-500 text-xs mt-1">{errors.type_beneficiaire.message}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 caractères"
                  {...register('mot_de_passe', { required: 'Obligatoire', minLength: { value: 8, message: 'Min 8 caractères' } })}
                  className={`${inp(!!errors.mot_de_passe)} pr-11`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-base cursor-pointer">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.mot_de_passe && <p className="text-red-500 text-xs mt-1">{errors.mot_de_passe.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1">
              {isSubmitting ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 font-semibold no-underline hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}