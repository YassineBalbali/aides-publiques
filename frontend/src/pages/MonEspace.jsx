import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

function MonEspace() {
  const [dossiers, setDossiers] = useState([])
  const [chargement, setChargement] = useState(true)
  const [utilisateur, setUtilisateur] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
  const token = localStorage.getItem('token')
  if (!token) { navigate('/login'); return }
  const payload = JSON.parse(atob(token.split('.')[1]))
  setUtilisateur(payload)
  api.get('/dossiers/')
    .then(r => {
      setDossiers(r.data.filter(d => d.demandeur_id === payload.sub))
      setChargement(false)
    })
    .catch(() => setChargement(false))
}, [])

  const badgeStatut = (statut) => {
    const styles = {
      brouillon: 'bg-gray-100 text-gray-600',
      depose: 'bg-blue-100 text-blue-800',
      en_instruction: 'bg-yellow-100 text-yellow-800',
      accepte: 'bg-green-100 text-green-800',
      refuse: 'bg-red-100 text-red-800',
      complement_demande: 'bg-orange-100 text-orange-800',
    }
    const labels = {
      brouillon: 'Brouillon',
      depose: 'Déposé',
      en_instruction: 'En instruction',
      accepte: 'Accepté',
      refuse: 'Refusé',
      complement_demande: 'Complément requis',
    }
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[statut] || 'bg-gray-100'}`}>
        {labels[statut] || statut}
      </span>
    )
  }

  const etapeSuivi = (statut) => {
    const etapes = ['depose', 'en_instruction', 'accepte']
    const idx = etapes.indexOf(statut)
    return idx
  }

  return (
    <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
      {/* Bandeau RF */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-2 flex items-center gap-3">
        <div className="bg-red-600 text-white font-bold text-sm px-2 py-1 rounded">RF</div>
        <span className="text-white text-sm font-semibold">RÉPUBLIQUE FRANÇAISE</span>
        <span className="text-blue-300 text-xs">Liberté · Égalité · Fraternité</span>
        <div className="ml-auto flex items-center gap-4 text-white text-sm">
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/') }}
            className="flex items-center gap-1 hover:underline">
            ← Se déconnecter
          </button>
        </div>
      </div>

      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <Link to="/" className="text-blue-900 font-bold text-xl">Aides Publiques</Link>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-900">Accueil</Link>
          <Link to="/aides" className="hover:text-blue-900">Catalogue des aides</Link>
          <Link to="/deposer" className="hover:text-blue-900">Déposer un dossier</Link>
          <Link to="/mon-espace" className="bg-blue-900 text-white px-4 py-2 rounded font-semibold">Suivi</Link>
        </div>
      </div>

      {/* Header */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Suivi de mes demandes</h1>
          <p className="text-blue-200">Consultez l'état d'avancement de vos dossiers d'aides publiques.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-10 px-4">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total dossiers', value: dossiers.length, icon: '📁', color: 'text-blue-900' },
            { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, icon: '📋', color: 'text-yellow-700' },
            { label: 'Acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, icon: '✅', color: 'text-green-700' },
            { label: 'Refusés', value: dossiers.filter(d => d.statut === 'refuse').length, icon: '❌', color: 'text-red-700' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span>{stat.icon}</span>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Liste dossiers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Mes dossiers</h2>
            <Link to="/deposer"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded text-sm transition-colors">
              + Nouvelle demande
            </Link>
          </div>

          {chargement ? (
            <p className="text-gray-400 p-8 text-center">Chargement...</p>
          ) : dossiers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-gray-500 font-semibold mb-2">Aucun dossier pour le moment</p>
              <Link to="/deposer" className="text-blue-600 hover:underline text-sm">
                Déposer ma première demande →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {dossiers.map(dossier => (
                <div key={dossier.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-mono font-bold text-blue-900 text-lg">{dossier.numero}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Déposé le {new Date(dossier.cree_le).toLocaleDateString('fr-FR')}
                      </p>
                      {dossier.commentaire && (
                        <p className="text-gray-600 text-sm mt-1">{dossier.commentaire}</p>
                      )}
                    </div>
                    {badgeStatut(dossier.statut)}
                  </div>

                  {/* Barre de progression */}
                  {dossier.statut !== 'refuse' && dossier.statut !== 'brouillon' && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        {['Déposé', 'En instruction', 'Décision'].map((step, i) => {
                          const idx = etapeSuivi(dossier.statut)
                          const done = i <= idx
                          return (
                            <div key={i} className="flex flex-col items-center flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1
                                ${done ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                {done ? '✓' : i + 1}
                              </div>
                              <span className={`text-xs ${done ? 'text-blue-900 font-semibold' : 'text-gray-400'}`}>
                                {step}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-900 h-1.5 rounded-full transition-all"
                          style={{width: `${Math.min(((etapeSuivi(dossier.statut) + 1) / 3) * 100, 100)}%`}}
                        />
                      </div>
                    </div>
                  )}

                  {dossier.statut === 'refuse' && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded px-4 py-2 text-sm text-red-700">
                      ❌ Votre dossier a été refusé. Contactez-nous pour plus d'informations.
                    </div>
                  )}

                  {dossier.statut === 'accepte' && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded px-4 py-2 text-sm text-green-700">
                      ✅ Félicitations ! Votre demande a été acceptée.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-10">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-red-600 text-white font-bold text-xs px-1 py-1 rounded">RF</div>
                <span className="text-gray-700 font-semibold text-sm">RÉPUBLIQUE FRANÇAISE</span>
              </div>
              <p className="text-gray-400 text-xs">Plateforme de gestion et suivi des aides publiques.</p>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Navigation</h3>
              <div className="flex flex-col gap-2">
                <Link to="/aides" className="text-gray-400 hover:text-gray-700 text-xs">Catalogue des aides</Link>
                <Link to="/deposer" className="text-gray-400 hover:text-gray-700 text-xs">Déposer un dossier</Link>
                <Link to="/mon-espace" className="text-gray-400 hover:text-gray-700 text-xs">Suivre mon dossier</Link>
              </div>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Espace pro</h3>
              <div className="flex flex-col gap-2">
                <Link to="/instructeur" className="text-gray-400 hover:text-gray-700 text-xs">Espace instructeur</Link>
                <Link to="/admin" className="text-gray-400 hover:text-gray-700 text-xs">Administration</Link>
              </div>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Informations</h3>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-400 hover:text-gray-700 text-xs">Mentions légales</a>
                <a href="#" className="text-gray-400 hover:text-gray-700 text-xs">Politique de confidentialité</a>
                <a href="#" className="text-gray-400 hover:text-gray-700 text-xs">Accessibilité</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-gray-400 text-xs">© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default MonEspace