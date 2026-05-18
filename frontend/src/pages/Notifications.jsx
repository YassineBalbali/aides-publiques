import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

// Composant icône cloche à intégrer dans la navbar
export function NotificationIcon() {
  const [notifications, setNotifications] = useState([])
  const [ouvert, setOuvert] = useState(false)
  const [nouvelleNotif, setNouvelleNotif] = useState(null)
  const navigate = useNavigate()
  const timerRef = useRef(null)
  const dropdownRef = useRef(null)

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const userId = payload?.sub
  const role = payload?.role

  useEffect(() => {
    if (!userId) return
    chargerNotifications()
    timerRef.current = setInterval(chargerNotifications, 15000)
    return () => clearInterval(timerRef.current)
  }, [userId])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOuvert(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const chargerNotifications = async () => {
    try {
      const res = await api.get(`/messages/non-lus/${userId}`)
      const nouvelles = res.data
      if (nouvelles.length > notifications.length && notifications.length > 0) {
        setNouvelleNotif(nouvelles[0])
        setTimeout(() => setNouvelleNotif(null), 5000)
      }
      setNotifications(nouvelles)
    } catch {}
  }

  const allerVersDossier = (notif) => {
    setOuvert(false)
    if (role === 'instructeur') {
      navigate(`/instructeur/dossier/${notif.dossier_id}`)
    } else {
      navigate(`/mon-espace/dossier/${notif.dossier_id}`)
    }
    api.patch(`/messages/${notif.dossier_id}/lire`, { user_id: userId }).catch(() => {})
    setNotifications(prev => prev.filter(n => n.dossier_id !== notif.dossier_id))
  }

  if (!userId) return null

  return (
    <>
      {/* Popup nouvelle notification */}
      {nouvelleNotif && (
        <div className="fixed top-5 right-5 z-[99999] max-w-sm">
          <div onClick={() => allerVersDossier(nouvelleNotif)}
            className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 flex gap-3 items-start cursor-pointer hover:shadow-xl transition-all">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">💬</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Nouveau message !</p>
              <p className="text-xs text-gray-500 mt-0.5">De : {nouvelleNotif.expediteur_nom}</p>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{nouvelleNotif.contenu}</p>
              <p className="text-xs text-blue-600 font-semibold mt-1">Dossier {nouvelleNotif.numero_dossier}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); setNouvelleNotif(null) }}
              className="text-gray-300 hover:text-gray-500 text-sm flex-shrink-0 transition-colors">✕</button>
          </div>
        </div>
      )}

      {/* Icône cloche */}
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setOuvert(!ouvert)}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {ouvert && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-900">Notifications</p>
              {notifications.length > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{notifications.length}</span>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm text-gray-400 font-medium">Aucun message non lu</p>
                <p className="text-xs text-gray-300 mt-1">Vous êtes à jour !</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.map((notif, i) => (
                  <div key={i} onClick={() => allerVersDossier(notif)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-600">{notif.numero_dossier}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(notif.cree_le).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700">De : {notif.expediteur_nom}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.contenu}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="px-4 py-2.5 border-t border-gray-50 text-center">
              <button onClick={() => setOuvert(false)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Fermer</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Export default vide — le composant est utilisé via NotificationIcon dans les navbars
function Notifications() { return null }
export default Notifications