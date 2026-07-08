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

  const inputStyle = (hasError) => ({
    width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 14,
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
      <div className="anim-blob" style={{ position: 'absolute', top: '12%', left: '6%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', animationDuration: '14s' }} />
      <div className="anim-blob" style={{ position: 'absolute', bottom: '12%', right: '6%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', filter: 'blur(45px)', pointerEvents: 'none', animationDuration: '19s', animationDelay: '-7s' }} />

      {/* Grid overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(99,102,241,0.5)', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>AP</span>
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Aides Publiques</span>
      </Link>

      {/* Glass card */}
      <div className="anim-fadeInUp" style={{ width: '100%', maxWidth: 420, padding: '36px 40px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>Connexion</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.48)' }}>Accédez à votre espace personnel</p>
        </div>

        {serverError && (
          <div style={{ background: 'rgba(220,38,38,0.18)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 10, padding: '11px 14px', marginBottom: 20, fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚠️</span> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Adresse email</label>
            <input type="email" placeholder="votre@email.fr"
              {...register('email', { required: "L'email est obligatoire" })}
              className="input-dark"
              style={inputStyle(!!errors.email)}
              onFocus={onFocusInput}
              onBlur={e => onBlurInput(e, !!errors.email)}
            />
            {errors.email && <p style={{ color: '#fca5a5', fontSize: 12, marginTop: 5 }}>{errors.email.message}</p>}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>Mot de passe</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Mot de passe oublié ?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                {...register('mot_de_passe', { required: 'Obligatoire', minLength: { value: 6, message: 'Min 6 caractères' } })}
                className="input-dark"
                style={{ ...inputStyle(!!errors.mot_de_passe), paddingRight: 46 }}
                onFocus={onFocusInput}
                onBlur={e => onBlurInput(e, !!errors.mot_de_passe)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.mot_de_passe && <p style={{ color: '#fca5a5', fontSize: 12, marginTop: 5 }}>{errors.mot_de_passe.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-gradient"
            style={{ width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', color: '#fff', border: 'none', cursor: 'pointer', marginTop: 4 }}>
            {isSubmitting ? 'Connexion...' : 'Se connecter →'}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {['127 aides disponibles', '8 500+ dossiers traités', 'Réponse sous 48h garantie'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 2 ? 8 : 0 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#86efac', fontSize: 10, fontWeight: 700 }}>✓</span>
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.38)', position: 'relative', zIndex: 1 }}>
        Pas encore de compte ?{' '}
        <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Créer un compte</Link>
      </p>
      <p style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.18)', position: 'relative', zIndex: 1 }}>© 2026 Plateforme Aides Publiques</p>
    </div>
  )
}
