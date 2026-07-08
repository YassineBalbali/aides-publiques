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
    <div className="bg-hero-mesh" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Blobs */}
      <div className="anim-blob" style={{ position: 'absolute', top: '12%', left: '6%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', animationDuration: '14s' }} />
      <div className="anim-blob" style={{ position: 'absolute', bottom: '12%', right: '6%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', filter: 'blur(45px)', pointerEvents: 'none', animationDuration: '19s', animationDelay: '-7s' }} />
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

        {!envoye ? (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22, color: '#a5b4fc' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Mot de passe oublié ?</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 0 }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
            </div>

            {serverError && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#fca5a5' }}>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Adresse email</label>
                <input type="email" placeholder="vous@exemple.fr"
                  {...register('email', {
                    required: "L'email est obligatoire",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Format invalide" }
                  })}
                  className="input-dark"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 14, background: 'rgba(255,255,255,0.08)', border: errors.email ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.14)', outline: 'none', color: '#fff', fontFamily: 'inherit', transition: 'all 0.2s', boxSizing: 'border-box' }} />
                {errors.email && <p style={{ color: '#fca5a5', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-gradient"
                style={{ width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', color: '#fff', border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.6 : 1, marginTop: 4 }}>
                {isSubmitting ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22, color: '#6ee7b7' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Email envoyé !</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Un lien de réinitialisation a été envoyé à</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#a5b4fc', fontSize: 14 }}>✉</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{emailEnvoye}</span>
            </div>

            <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#fcd34d' }}>
              ⏱ Le lien est valable <strong>1 heure</strong>. Vérifiez aussi vos spams.
            </div>

            <Link to="/login" className="btn-gradient"
              style={{ display: 'block', width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', color: '#fff', border: 'none', cursor: 'pointer', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
              Retour à la connexion
            </Link>

            <p style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
              Pas reçu ?{' '}
              <button onClick={() => setEnvoye(false)} style={{ color: '#a5b4fc', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                Réessayer
              </button>
            </p>
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
