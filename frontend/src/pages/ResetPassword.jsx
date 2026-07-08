import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api'

const IconLock = () => (<svg xmlns="http://www.w3.org/2000/svg" style={{ width: 17, height: 17, color: 'rgba(255,255,255,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>)
const IconEye = () => (<svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>)
const IconEyeOff = () => (<svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.555-4.17M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" /></svg>)

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
    <div className="bg-hero-mesh" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Blobs */}
      <div className="anim-blob" style={{ position: 'absolute', top: '10%', left: '5%', width: 440, height: 440, background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', animationDuration: '16s' }} />
      <div className="anim-blob" style={{ position: 'absolute', bottom: '10%', right: '5%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', filter: 'blur(45px)', pointerEvents: 'none', animationDuration: '21s', animationDelay: '-8s' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(99,102,241,0.5)', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>AP</span>
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Aides Publiques</span>
      </Link>

      {/* Glass card */}
      <div className="anim-fadeInUp" style={{ width: '100%', maxWidth: 420, padding: '36px 40px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 }}>

        {!token ? (
          <>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22, color: '#fca5a5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Lien invalide</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Ce lien est invalide ou a expiré. Veuillez demander un nouveau lien.</p>
            <Link to="/forgot-password" className="btn-gradient"
              style={{ display: 'block', width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, color: '#fff', textDecoration: 'none', textAlign: 'center', fontFamily: 'inherit', boxSizing: 'border-box' }}>
              Demander un nouveau lien
            </Link>
            <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
              <Link to="/login" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>Retour à la connexion</Link>
            </p>
          </>
        ) : succes ? (
          <>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22, color: '#6ee7b7' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Mot de passe modifié !</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Votre mot de passe a été mis à jour avec succès.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>Redirection en cours vers la page de connexion...</p>
            <Link to="/login" className="btn-gradient"
              style={{ display: 'block', width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, color: '#fff', textDecoration: 'none', textAlign: 'center', fontFamily: 'inherit', boxSizing: 'border-box' }}>
              Se connecter maintenant
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Nouveau mot de passe</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Choisissez un nouveau mot de passe sécurisé.</p>

            {serverError && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#fca5a5' }}>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Nouveau mot de passe</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: 12, pointerEvents: 'none' }}><IconLock /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('nouveau_mot_de_passe', {
                      required: 'Obligatoire',
                      minLength: { value: 6, message: 'Minimum 6 caractères' }
                    })}
                    className="input-dark"
                    style={{ width: '100%', padding: '12px 42px', borderRadius: 10, fontSize: 14, background: 'rgba(255,255,255,0.08)', border: errors.nouveau_mot_de_passe ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.14)', outline: 'none', color: '#fff', fontFamily: 'inherit', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                    style={{ position: 'absolute', right: 12, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.nouveau_mot_de_passe && <p style={{ color: '#fca5a5', fontSize: 12, marginTop: 4 }}>{errors.nouveau_mot_de_passe.message}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Confirmer le mot de passe</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: 12, pointerEvents: 'none' }}><IconLock /></span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmer', {
                      required: 'Obligatoire',
                      validate: (val) => val === watch('nouveau_mot_de_passe') || 'Les mots de passe ne correspondent pas'
                    })}
                    className="input-dark"
                    style={{ width: '100%', padding: '12px 42px', borderRadius: 10, fontSize: 14, background: 'rgba(255,255,255,0.08)', border: errors.confirmer ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.14)', outline: 'none', color: '#fff', fontFamily: 'inherit', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
                    style={{ position: 'absolute', right: 12, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {showConfirm ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.confirmer && <p style={{ color: '#fca5a5', fontSize: 12, marginTop: 4 }}>{errors.confirmer.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-gradient"
                style={{ width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', color: '#fff', border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.6 : 1, marginTop: 4 }}>
                {isSubmitting ? 'Modification...' : 'Modifier le mot de passe'}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Lien bas */}
      <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.38)', position: 'relative', zIndex: 1 }}>
        <Link to="/login" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>← Retour à la connexion</Link>
      </p>
    </div>
  )
}

export default ResetPassword
