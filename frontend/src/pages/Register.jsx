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
    } catch (err) { setErreur(err.response?.data?.detail || 'Une erreur est survenue.') }
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
    background: hasError ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.08)',
    border: hasError ? '1px solid rgba(220,38,38,0.5)' : '1px solid rgba(255,255,255,0.14)',
    outline: 'none', color: '#fff', fontFamily: 'inherit',
    transition: 'all 0.2s', boxSizing: 'border-box',
  })

  const onFocusInput = (e) => {
    e.target.style.borderColor = 'rgba(99,102,241,0.7)'
    e.target.style.background = 'rgba(255,255,255,0.12)'
    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'
  }
  const onBlurInput = (e, hasError) => {
    e.target.style.borderColor = hasError ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.14)'
    e.target.style.background = hasError ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.08)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="bg-hero-mesh" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>

      {/* Animated blobs */}
      <div className="anim-blob" style={{ position: 'absolute', top: '10%', right: '6%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', animationDuration: '14s' }} />
      <div className="anim-blob" style={{ position: 'absolute', bottom: '8%', left: '5%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', filter: 'blur(45px)', pointerEvents: 'none', animationDuration: '19s', animationDelay: '-6s' }} />

      {/* Grid overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 28, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(99,102,241,0.5)', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>AP</span>
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Aides Publiques</span>
      </Link>

      {/* Glass card */}
      <div className="anim-fadeInUp" style={{ width: '100%', maxWidth: 480, padding: '32px 36px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 5 }}>Créer un compte</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>Inscrivez-vous pour déposer vos demandes</p>
        </div>

        {erreur && (
          <div style={{ background: 'rgba(220,38,38,0.18)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 10, padding: '11px 14px', marginBottom: 18, fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚠️</span> {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>

          {/* Nom / Prénom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 7 }}>Nom</label>
              <input type="text" placeholder="Dupont" {...register('nom', { required: 'Obligatoire' })}
                className="input-dark" style={inputStyle(!!errors.nom)}
                onFocus={onFocusInput} onBlur={e => onBlurInput(e, !!errors.nom)} />
              {errors.nom && <p style={{ color: '#fca5a5', fontSize: 11, marginTop: 4 }}>{errors.nom.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 7 }}>Prénom</label>
              <input type="text" placeholder="Jean" {...register('prenom', { required: 'Obligatoire' })}
                className="input-dark" style={inputStyle(!!errors.prenom)}
                onFocus={onFocusInput} onBlur={e => onBlurInput(e, !!errors.prenom)} />
              {errors.prenom && <p style={{ color: '#fca5a5', fontSize: 11, marginTop: 4 }}>{errors.prenom.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 7 }}>Adresse email</label>
            <input type="email" placeholder="votre@email.fr"
              {...register('email', { required: 'Obligatoire', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format invalide' } })}
              className="input-dark" style={inputStyle(!!errors.email)}
              onFocus={onFocusInput} onBlur={e => onBlurInput(e, !!errors.email)} />
            {errors.email && <p style={{ color: '#fca5a5', fontSize: 11, marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          {/* Type bénéficiaire */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>Type de bénéficiaire</label>
            <input type="hidden" {...register('type_beneficiaire', { required: 'Veuillez choisir un type' })} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {TYPES.map(({ value, label, desc, icon }) => {
                const isSelected = selectedType === value
                return (
                  <button key={value} type="button" onClick={() => handleTypeSelect(value)}
                    style={{ padding: '12px 8px', borderRadius: 12, textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', background: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: isSelected ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)', boxShadow: isSelected ? '0 0 0 1px rgba(99,102,241,0.3)' : 'none' }}>
                    <div style={{ fontSize: 20, marginBottom: 5 }}>{icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#a5b4fc' : 'rgba(255,255,255,0.7)' }}>{label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{desc}</div>
                  </button>
                )
              })}
            </div>
            {errors.type_beneficiaire && <p style={{ color: '#fca5a5', fontSize: 11, marginTop: 5 }}>{errors.type_beneficiaire.message}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 7 }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 caractères"
                {...register('mot_de_passe', { required: 'Obligatoire', minLength: { value: 8, message: 'Min 8 caractères' } })}
                className="input-dark" style={{ ...inputStyle(!!errors.mot_de_passe), paddingRight: 46 }}
                onFocus={onFocusInput} onBlur={e => onBlurInput(e, !!errors.mot_de_passe)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.mot_de_passe && <p style={{ color: '#fca5a5', fontSize: 11, marginTop: 4 }}>{errors.mot_de_passe.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-gradient"
            style={{ width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', color: '#fff', border: 'none', cursor: 'pointer', marginTop: 4 }}>
            {isSubmitting ? 'Création...' : 'Créer mon compte →'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.38)', position: 'relative', zIndex: 1 }}>
        Déjà un compte ?{' '}
        <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
      </p>
      <p style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.18)', position: 'relative', zIndex: 1 }}>© 2026 Plateforme Aides Publiques</p>
    </div>
  )
}
