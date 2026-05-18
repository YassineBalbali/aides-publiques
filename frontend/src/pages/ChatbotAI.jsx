import { useState, useRef, useEffect } from 'react'
import api from '../api'

const SUGGESTIONS = [
  "Comment déposer un dossier ?",
  "Quels types d'aides existent ?",
  "Comment suivre mon dossier ?",
  "Quels documents fournir ?",
]

const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const IconChat = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

export default function ChatbotAI() {
  const [ouvert, setOuvert] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Bonjour ! 👋 Je suis votre assistant virtuel Aides Publiques. Je suis là pour vous aider à naviguer sur la plateforme, déposer vos dossiers et trouver les aides qui vous correspondent. Comment puis-je vous aider ?",
    }
  ])
  const [input, setInput] = useState('')
  const [chargement, setChargement] = useState(false)
  const [notification, setNotification] = useState(true)
  const [tokenVersion, setTokenVersion] = useState(0)
  const messagesEndRef = useRef(null)

  // Écoute les changements de localStorage (déconnexion / reconnexion)
  useEffect(() => {
    const onStorageChange = () => setTokenVersion(v => v + 1)
    window.addEventListener('storage', onStorageChange)
    // Polling pour les changements dans le même onglet (storage event ne se déclenche que cross-tab)
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token')
      if (currentToken !== window.__lastToken) {
        window.__lastToken = currentToken
        setTokenVersion(v => v + 1)
      }
    }, 1000)
    return () => {
      window.removeEventListener('storage', onStorageChange)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (ouvert) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setNotification(false)
    }
  }, [messages, ouvert])

  const envoyerMessage = async (texte) => {
    const messageTexte = texte || input.trim()
    if (!messageTexte || chargement) return

    const nouveauxMessages = [...messages, { role: 'user', content: messageTexte }]
    setMessages(nouveauxMessages)
    setInput('')
    setChargement(true)

    try {
      const data = await api.post('/chatbot/message', {
        messages: nouveauxMessages.map(m => ({ role: m.role, content: m.content })),
      })
      const reponse = data.data.response || "Désolé, je n'ai pas pu traiter votre demande."
      setMessages(prev => [...prev, { role: 'assistant', content: reponse }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "❌ Une erreur s'est produite. Veuillez réessayer dans quelques instants."
      }])
    } finally {
      setChargement(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      envoyerMessage()
    }
  }

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  // Afficher pour les demandeurs et les visiteurs non connectés, masquer pour admin et instructeur
  if (payload && (payload.role === 'admin' || payload.role === 'instructeur')) return null

  return (
    <>
      {/* Bouton flottant — z-index plus élevé que la fenêtre */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2">

        {/* Bulle suggestion */}
        {!ouvert && notification && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 max-w-xs">
            <p className="text-sm text-gray-700 font-semibold">💬 Besoin d'aide ?</p>
            <p className="text-xs text-gray-400 mt-0.5">Je suis disponible pour vous guider !</p>
          </div>
        )}

        <button
          onClick={() => setOuvert(!ouvert)}
          className="w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all relative"
        >
          {ouvert ? <IconClose /> : <IconChat />}
          {!ouvert && notification && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">1</span>
          )}
        </button>
      </div>

      {/* Fenêtre chat */}
      {ouvert && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-5 py-4 bg-blue-600 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-xs">AI</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Assistant Aides Publiques</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-blue-100 text-xs">En ligne — Répond instantanément</p>
              </div>
            </div>
            <button
              onClick={() => setOuvert(false)}
              className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
            >
              <IconClose />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold">AI</span>
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-700 rounded-tl-sm shadow-sm border border-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {chargement && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-[10px] font-bold">AI</span>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-2.5 flex gap-2 flex-wrap border-t border-gray-100 bg-white">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => envoyerMessage(s)}
                  className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors font-semibold">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2 items-end flex-shrink-0">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              rows={1}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 resize-none transition-colors bg-gray-50"
              style={{ maxHeight: '80px' }}
            />
            <button
              onClick={() => envoyerMessage()}
              disabled={!input.trim() || chargement}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white disabled:opacity-40 transition-all flex-shrink-0"
            >
              <IconSend />
            </button>
          </div>
        </div>
      )}
    </>
  )
}