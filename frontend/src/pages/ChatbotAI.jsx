import { useState, useRef, useEffect } from 'react'
import api from '../api'

const SUGGESTIONS = [
  "Comment déposer un dossier ?",
  "Quels types d'aides existent ?",
  "Comment suivre mon dossier ?",
  "Quels documents fournir ?",
]

const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const IconChat = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

export default function ChatbotAI() {
  const [ouvert, setOuvert]         = useState(false)
  const [messages, setMessages]     = useState([{
    role: 'assistant',
    content: "Bonjour ! 👋 Je suis votre assistant virtuel Aides Publiques. Je suis là pour vous aider à naviguer sur la plateforme, déposer vos dossiers et trouver les aides qui vous correspondent. Comment puis-je vous aider ?",
  }])
  const [input, setInput]           = useState('')
  const [chargement, setChargement] = useState(false)
  const [notification, setNotification] = useState(true)
  const [tokenVersion, setTokenVersion] = useState(0)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const onStorageChange = () => setTokenVersion(v => v + 1)
    window.addEventListener('storage', onStorageChange)
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token')
      if (currentToken !== window.__lastToken) {
        window.__lastToken = currentToken
        setTokenVersion(v => v + 1)
      }
    }, 1000)
    return () => { window.removeEventListener('storage', onStorageChange); clearInterval(interval) }
  }, [])

  useEffect(() => {
    if (ouvert) { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); setNotification(false) }
  }, [messages, ouvert])

  const envoyerMessage = async (texte) => {
    const messageTexte = texte || input.trim()
    if (!messageTexte || chargement) return
    const nouveauxMessages = [...messages, { role: 'user', content: messageTexte }]
    setMessages(nouveauxMessages); setInput(''); setChargement(true)
    try {
      const data = await api.post('/chatbot/message', { messages: nouveauxMessages.map(m => ({ role: m.role, content: m.content })) })
      setMessages(prev => [...prev, { role: 'assistant', content: data.data.response || "Désolé, je n'ai pas pu traiter votre demande." }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "❌ Une erreur s'est produite. Veuillez réessayer dans quelques instants." }])
    } finally { setChargement(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerMessage() }
  }

  const token   = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  if (payload && (payload.role === 'admin' || payload.role === 'instructeur')) return null

  return (
    <>
      {/* Bouton flottant */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>

        {/* Bulle notification */}
        {!ouvert && notification && (
          <div style={{
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(99,102,241,0.18)', borderRadius: 14,
            boxShadow: '0 8px 32px rgba(99,102,241,0.18)', padding: '12px 16px', maxWidth: 220,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>💬 Besoin d'aide ?</p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, marginBottom: 0 }}>Je suis disponible pour vous guider !</p>
          </div>
        )}

        {/* Bouton principal */}
        <button
          onClick={() => setOuvert(!ouvert)}
          className="btn-gradient"
          style={{
            width: 52, height: 52, borderRadius: 16, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: '0 8px 28px rgba(99,102,241,0.5)', position: 'relative',
          }}
        >
          {ouvert ? <IconClose /> : <IconChat />}
          {!ouvert && notification && (
            <span style={{
              position: 'absolute', top: -4, right: -4, width: 18, height: 18,
              background: '#ef4444', borderRadius: '50%', border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 800, color: '#fff',
            }}>1</span>
          )}
        </button>
      </div>

      {/* Fenêtre chat */}
      {ouvert && (
        <div className="anim-slideIn" style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 50,
          width: 384, height: 560,
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 20, border: '1px solid rgba(99,102,241,0.18)',
          boxShadow: '0 24px 64px rgba(99,102,241,0.22), 0 4px 16px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '16px 18px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 11 }}>AI</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 13.5, margin: 0 }}>Assistant Aides Publiques</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} />
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, margin: 0 }}>En ligne — Répond instantanément</p>
              </div>
            </div>
            <button onClick={() => setOuvert(false)} style={{
              width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.18)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}>
              <IconClose />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px 14px',
            display: 'flex', flexDirection: 'column', gap: 12,
            background: '#f8f7ff',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>

                {msg.role === 'assistant' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: 9, flexShrink: 0, marginTop: 2,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>AI</span>
                  </div>
                )}

                <div style={{
                  maxWidth: '75%', padding: '10px 14px', fontSize: 13, lineHeight: 1.55,
                  whiteSpace: 'pre-wrap', borderRadius: 16,
                  ...(msg.role === 'user' ? {
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', borderTopRightRadius: 4,
                    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  } : {
                    background: '#fff', color: '#374151',
                    border: '1px solid rgba(99,102,241,0.12)',
                    borderTopLeftRadius: 4,
                    boxShadow: '0 2px 8px rgba(99,102,241,0.06)',
                  }),
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {chargement && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>AI</span>
                </div>
                <div style={{
                  background: '#fff', border: '1px solid rgba(99,102,241,0.12)',
                  borderRadius: 16, borderTopLeftRadius: 4,
                  padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.06)',
                }}>
                  {[0, 150, 300].map(delay => (
                    <div key={delay} className="animate-bounce" style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      animationDelay: `${delay}ms`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div style={{
              padding: '10px 14px', display: 'flex', gap: 7, flexWrap: 'wrap',
              borderTop: '1px solid rgba(99,102,241,0.1)', background: '#fff',
            }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => envoyerMessage(s)} style={{
                  fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                  color: '#6366f1', background: 'rgba(99,102,241,0.07)',
                  border: '1px solid rgba(99,102,241,0.18)', borderRadius: 8,
                  padding: '6px 11px', cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.14)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.18)' }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '12px 14px', borderTop: '1px solid rgba(99,102,241,0.1)',
            background: '#fff', display: 'flex', gap: 9, alignItems: 'flex-end', flexShrink: 0,
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              rows={1}
              style={{
                flex: 1, border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12,
                padding: '10px 14px', fontSize: 13, color: '#374151',
                outline: 'none', resize: 'none', maxHeight: 80,
                background: '#f8f7ff', fontFamily: 'inherit',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.2)'; e.target.style.boxShadow = 'none' }}
            />
            <button
              onClick={() => envoyerMessage()}
              disabled={!input.trim() || chargement}
              className="btn-gradient"
              style={{
                width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                flexShrink: 0, opacity: (!input.trim() || chargement) ? 0.45 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <IconSend />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
