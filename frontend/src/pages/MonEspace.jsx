import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { NotificationIcon } from './Notifications'

const STATUT = {
  brouillon: { label: 'Brouillon', cls: 'bg-gray-100 text-gray-500 border border-gray-200', dot: 'bg-gray-400' },
  depose: { label: 'Déposé', cls: 'bg-blue-50 text-blue-700 border border-blue-100', dot: 'bg-blue-500' },
  en_instruction: { label: 'En instruction', cls: 'bg-amber-50 text-amber-700 border border-amber-100', dot: 'bg-amber-500' },
  accepte: { label: 'Accepté', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100', dot: 'bg-emerald-500' },
  refuse: { label: 'Refusé', cls: 'bg-red-50 text-red-600 border border-red-100', dot: 'bg-red-500' },
  complement_demande: { label: 'Complément requis', cls: 'bg-orange-50 text-orange-600 border border-orange-100', dot: 'bg-orange-500' },
}

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const nomPlateforme = localStorage.getItem('plateforme_nom') || 'Aides Publiques'
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-white font-bold text-xs">AP</span></div>
          <span className="font-bold text-gray-900 text-sm">{nomPlateforme}</span>
        </Link>
        <div className="flex items-center gap-0.5">
          {[{ to: '/', l: 'Accueil' }, { to: '/catalogue', l: 'Catalogue' }, { to: '/deposer', l: 'Déposer' }, { to: '/mon-espace', l: 'Mon espace' }, { to: '/profil', l: 'Profil' }].map(({ to, l }) => (
            <Link key={to} to={to} className={`px-3 py-1.5 rounded-lg text-sm font-medium no-underline transition-colors ${to === '/mon-espace' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>{l}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-emerald-700 font-semibold">{payload?.prenom} {payload?.nom}</span>
          </div>
          <NotificationIcon />
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer">Déconnexion</button>
        </div>
      </div>
    </nav>
  )
}

export default function MonEspace() {
  const [dossiers, setDossiers] = useState([])
  const [aides, setAides] = useState([])
  const [chargement, setChargement] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('')
  const [filtreDate, setFiltreDate] = useState('')
  const [filtreType, setFiltreType] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    Promise.all([api.get('/dossiers/'), api.get('/aides/')])
      .then(([d, a]) => { setDossiers(d.data.filter(dos => dos.demandeur_id === payload.sub)); setAides(a.data); setChargement(false) })
      .catch(() => setChargement(false))
  }, [])

  const dossiersFiltres = dossiers.filter(d => {
    const matchStatut = filtreStatut ? d.statut === filtreStatut : true
    const matchDate = filtreDate ? new Date(d.cree_le).toISOString().split('T')[0] >= filtreDate : true
    const aide = aides.find(a => a.id === d.aide_id)
    const matchType = filtreType ? aide?.type_aide === filtreType : true
    return matchStatut && matchDate && matchType
  })

  const etape = (statut) => ['depose', 'en_instruction', 'accepte'].indexOf(statut)

  const sel = 'px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-400 cursor-pointer'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-100 px-6 py-7">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Mes demandes</h1>
            <p className="text-sm text-gray-400 mt-1">Consultez et suivez l'avancement de vos dossiers</p>
          </div>
          <Link to="/deposer" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg no-underline hover:bg-blue-700">+ Nouvelle demande</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: dossiers.length, color: 'text-blue-600' },
            { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: 'text-amber-600' },
            { label: 'Acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, color: 'text-emerald-600' },
            { label: 'Refusés', value: dossiers.filter(d => d.statut === 'refuse').length, color: 'text-red-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">{s.label}</p>
              <p className={`text-3xl font-extrabold tracking-tight ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 shadow-sm flex gap-3 flex-wrap items-center">
          <select value={filtreType} onChange={e => setFiltreType(e.target.value)} className={sel}><option value="">Tous les types</option><option value="subvention">Subvention</option><option value="pret">Prêt</option><option value="exoneration">Exonération</option><option value="formation">Formation</option></select>
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} className={sel}><option value="">Tous les statuts</option><option value="brouillon">Brouillon</option><option value="depose">Déposé</option><option value="en_instruction">En instruction</option><option value="accepte">Accepté</option><option value="refuse">Refusé</option></select>
          <input type="date" value={filtreDate} onChange={e => setFiltreDate(e.target.value)} className={sel} />
          {(filtreStatut || filtreDate || filtreType) && (
            <button onClick={() => { setFiltreStatut(''); setFiltreDate(''); setFiltreType('') }} className="px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-100 hover:bg-red-100">✕ Réinitialiser</button>
          )}
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{dossiersFiltres.length} dossier(s)</span>
        </div>

        {/* Liste */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">Mes dossiers</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{dossiersFiltres.length}</span>
          </div>

          {chargement ? (
            <div className="p-12 text-center text-sm text-gray-400">Chargement...</div>
          ) : dossiersFiltres.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-4xl mb-4">📭</div>
              <p className="font-bold text-gray-700 mb-2">Aucun dossier trouvé</p>
              <p className="text-sm text-gray-400 mb-5">Déposez votre première demande d'aide</p>
              <Link to="/deposer" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg no-underline hover:bg-blue-700">Déposer une demande</Link>
            </div>
          ) : dossiersFiltres.map((d, idx) => {
            const s = STATUT[d.statut] || STATUT.brouillon
            const idx2 = etape(d.statut)
            return (
              <div key={d.id} className={`px-6 py-5 ${idx < dossiersFiltres.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-blue-600">{d.numero}</span>
                    <span className="text-xs text-gray-400">Déposé le {new Date(d.cree_le).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${s.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                    </span>
                    <Link to={`/mon-espace/dossier/${d.id}`} className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-600 rounded-lg no-underline hover:bg-gray-100">Voir →</Link>
                  </div>
                </div>

                {idx2 >= 0 && d.statut !== 'refuse' && d.statut !== 'brouillon' && d.statut !== 'complement_demande' && (
                  <div className="flex items-center mt-3">
                    {['Déposé', 'En instruction', 'Décision'].map((step, i) => {
                      const done = i <= idx2
                      return (
                        <div key={i} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 ${done ? 'bg-blue-600' : 'bg-gray-200'}`}>
                              <span className={`text-xs font-bold ${done ? 'text-white' : 'text-gray-400'}`}>{done ? '✓' : i + 1}</span>
                            </div>
                            <span className={`text-xs font-medium ${done ? 'text-blue-600' : 'text-gray-400'}`}>{step}</span>
                          </div>
                          {i < 2 && <div className={`flex-1 h-0.5 mx-1.5 rounded-full ${i < idx2 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ marginBottom: 14 }} />}
                        </div>
                      )
                    })}
                  </div>
                )}

                {d.statut === 'accepte' && <div className="mt-3 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-semibold text-emerald-700">✓ Félicitations ! Votre demande a été acceptée.</div>}
                {d.statut === 'refuse' && <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs font-semibold text-red-600">✕ Votre dossier a été refusé. Cliquez sur "Voir" pour consulter la justification.</div>}
                {d.statut === 'complement_demande' && <div className="mt-3 px-3 py-2 bg-orange-50 border border-orange-100 rounded-lg text-xs font-semibold text-orange-600">⚠ Documents complémentaires requis. Cliquez sur "Voir" pour les détails.</div>}
              </div>
            )
          })}
        </div>
      </div>
      <footer className="border-t border-gray-100 py-5 text-center mt-8">
        <p className="text-xs text-gray-400">© 2026 Plateforme Aides Publiques</p>
      </footer>
    </div>
  )
}