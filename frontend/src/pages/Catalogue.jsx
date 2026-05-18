import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { NotificationIcon } from './Notifications'

const AIDES_DEMO = [
  { id: '1', titre: "Aide à la transition écologique des PME", description: "Subvention pour accompagner les PME dans leur transition écologique.", type_aide: 'subvention', montant_min: 5000, montant_max: 50000, organisme_financeur: 'ADEME', statut: 'active', beneficiaires: 'entreprise', territoire: 'national' },
  { id: '2', titre: "Bourse régionale d'excellence académique", description: "Bourse pour étudiants en licence et master.", type_aide: 'subvention', montant_min: 1000, montant_max: 5000, organisme_financeur: 'Conseil Régional IDF', statut: 'a_venir', beneficiaires: 'particulier', territoire: 'regional' },
  { id: '3', titre: "Prêt à taux zéro rénovation énergétique", description: "Prêt sans intérêt pour financer des travaux de rénovation énergétique.", type_aide: 'pret', montant_min: 10000, montant_max: 30000, organisme_financeur: 'Ministère du Logement', statut: 'active', beneficiaires: 'particulier', territoire: 'national' },
  { id: '4', titre: "Exonération de charges jeunes agriculteurs", description: "Exonération partielle de cotisations sociales pour les jeunes agriculteurs.", type_aide: 'exoneration', montant_min: null, montant_max: null, organisme_financeur: 'MSA', statut: 'active', beneficiaires: 'entreprise', territoire: 'national' },
  { id: '5', titre: "Formation numérique pour les associations", description: "Programme de formation gratuit pour la transformation numérique.", type_aide: 'formation', montant_min: null, montant_max: null, organisme_financeur: 'Agence du Numérique', statut: 'active', beneficiaires: 'association', territoire: 'national' },
  { id: '6', titre: "Subvention commerce de proximité", description: "Aide pour la modernisation des commerces en zone rurale.", type_aide: 'subvention', montant_min: 2000, montant_max: 15000, organisme_financeur: 'Conseil Départemental', statut: 'active', beneficiaires: 'entreprise', territoire: 'departemental' },
]

const ITEMS_PAR_PAGE = 6

const TYPE_CFG = {
  subvention: { label: 'Subvention', cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  pret: { label: 'Prêt', cls: 'bg-violet-50 text-violet-700 border border-violet-100' },
  exoneration: { label: 'Exonération', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  formation: { label: 'Formation', cls: 'bg-amber-50 text-amber-700 border border-amber-100' },
}
const STATUT_CFG = {
  active: { label: 'Ouvert', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100', dot: 'bg-emerald-500' },
  a_venir: { label: 'À venir', cls: 'bg-blue-50 text-blue-700 border border-blue-100', dot: 'bg-blue-500' },
  cloturee: { label: 'Clôturé', cls: 'bg-gray-100 text-gray-500 border border-gray-200', dot: 'bg-gray-400' },
}

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const estConnecte = !!token
  const nomPlateforme = localStorage.getItem('plateforme_nom') || 'Aides Publiques'
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">AP</span>
          </div>
          <span className="font-bold text-gray-900 text-sm">{nomPlateforme}</span>
        </Link>
        <div className="flex items-center gap-0.5">
          {[{ to: '/', l: 'Accueil' }, { to: '/catalogue', l: 'Catalogue' }, ...(estConnecte ? [{ to: '/deposer', l: 'Déposer' }, { to: '/mon-espace', l: 'Mon espace' }, { to: '/profil', l: 'Profil' }] : [])].map(({ to, l }) => (
            <Link key={to} to={to} className={`px-3 py-1.5 rounded-lg text-sm font-medium no-underline transition-colors ${to === '/catalogue' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>{l}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {estConnecte ? (
            <>
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-700 font-semibold">{payload?.prenom} {payload?.nom}</span>
              </div>
              <NotificationIcon />
              <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 no-underline hover:bg-gray-50">Connexion</Link>
              <Link to="/register" className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white no-underline hover:bg-blue-700">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function Catalogue() {
  const navigate = useNavigate()
  const [aides, setAides] = useState(AIDES_DEMO)
  const [recherche, setRecherche] = useState('')
  const [filtreType, setFiltreType] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [filtreBeneficiaire, setFiltreBeneficiaire] = useState('')
  const [filtreTerritoire, setFiltreTerritoire] = useState('')
  const [filtreMontantMin, setFiltreMontantMin] = useState('')
  const [filtreMontantMax, setFiltreMontantMax] = useState('')
  const [tri, setTri] = useState('pertinence')
  const [page, setPage] = useState(1)
  const [showFiltres, setShowFiltres] = useState(false)

  useEffect(() => { api.get('/aides/').then(r => { if (r.data.length > 0) setAides(r.data) }).catch(() => {}) }, [])
  useEffect(() => { setPage(1) }, [recherche, filtreType, filtreStatut, filtreBeneficiaire, filtreTerritoire, filtreMontantMin, filtreMontantMax, tri])

  const aidesFiltrees = aides.filter(a => {
    const matchR = a.titre.toLowerCase().includes(recherche.toLowerCase()) || a.description?.toLowerCase().includes(recherche.toLowerCase())
    return matchR && (filtreType ? a.type_aide === filtreType : true) && (filtreStatut ? a.statut === filtreStatut : true)
      && (filtreBeneficiaire ? a.beneficiaires?.toLowerCase().includes(filtreBeneficiaire) : true)
      && (filtreTerritoire ? a.territoire === filtreTerritoire : true)
      && (filtreMontantMin ? (a.montant_max || 0) >= parseFloat(filtreMontantMin) : true)
      && (filtreMontantMax ? (a.montant_min || 0) <= parseFloat(filtreMontantMax) : true)
  }).sort((a, b) => tri === 'montant_asc' ? (a.montant_min || 0) - (b.montant_min || 0) : tri === 'montant_desc' ? (b.montant_max || 0) - (a.montant_max || 0) : 0)

  const totalPages = Math.ceil(aidesFiltrees.length / ITEMS_PAR_PAGE)
  const aidesPaginees = aidesFiltrees.slice((page - 1) * ITEMS_PAR_PAGE, page * ITEMS_PAR_PAGE)
  const hasFiltres = recherche || filtreType || filtreStatut || filtreBeneficiaire || filtreTerritoire || filtreMontantMin || filtreMontantMax
  const reset = () => { setRecherche(''); setFiltreType(''); setFiltreStatut(''); setFiltreBeneficiaire(''); setFiltreTerritoire(''); setFiltreMontantMin(''); setFiltreMontantMax(''); setTri('pertinence') }
  const exportCSV = () => { const b = new Blob(['Titre;Type;Statut;Montant Min;Montant Max;Organisme\n' + aidesFiltrees.map(a => `${a.titre};${a.type_aide};${a.statut};${a.montant_min || ''};${a.montant_max || ''};${a.organisme_financeur || ''}`).join('\n')], { type: 'text/csv' }); const el = document.createElement('a'); el.href = URL.createObjectURL(b); el.download = 'aides.csv'; el.click() }

  const sel = 'px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-400 cursor-pointer'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-100 px-6 py-7">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Catalogue des aides</h1>
            <p className="text-sm text-gray-400 mt-1">{aidesFiltrees.length} aide(s) disponible(s)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="px-3 py-2 text-sm font-medium border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50">⬇ CSV</button>
            <button onClick={() => window.print()} className="px-3 py-2 text-sm font-medium border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50">🖨 Imprimer</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex gap-3 flex-wrap items-center">
            <input type="text" placeholder="🔍  Rechercher une aide..." value={recherche} onChange={e => setRecherche(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-blue-400 bg-gray-50 text-gray-800 placeholder-gray-400" />
            <select value={tri} onChange={e => setTri(e.target.value)} className={sel}>
              <option value="pertinence">Pertinence</option><option value="montant_asc">Montant ↑</option><option value="montant_desc">Montant ↓</option>
            </select>
            <button onClick={() => setShowFiltres(!showFiltres)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${showFiltres ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              Filtres {hasFiltres ? '•' : ''}
            </button>
            {hasFiltres && <button onClick={reset} className="px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-100 hover:bg-red-100">✕ Réinitialiser</button>}
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{aidesFiltrees.length}</span>
          </div>
          {showFiltres && (
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
              <select value={filtreType} onChange={e => setFiltreType(e.target.value)} className={sel}><option value="">Tous les types</option><option value="subvention">Subvention</option><option value="pret">Prêt</option><option value="exoneration">Exonération</option><option value="formation">Formation</option></select>
              <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} className={sel}><option value="">Tous les statuts</option><option value="active">Ouvert</option><option value="a_venir">À venir</option><option value="cloturee">Fermé</option></select>
              <select value={filtreBeneficiaire} onChange={e => setFiltreBeneficiaire(e.target.value)} className={sel}><option value="">Tous bénéficiaires</option><option value="particulier">Particulier</option><option value="entreprise">Entreprise</option><option value="association">Association</option></select>
              <select value={filtreTerritoire} onChange={e => setFiltreTerritoire(e.target.value)} className={sel}><option value="">Tous territoires</option><option value="national">National</option><option value="regional">Régional</option><option value="departemental">Départemental</option></select>
              <input type="number" placeholder="Montant min (€)" value={filtreMontantMin} onChange={e => setFiltreMontantMin(e.target.value)} className={sel} />
              <input type="number" placeholder="Montant max (€)" value={filtreMontantMax} onChange={e => setFiltreMontantMax(e.target.value)} className={sel} />
            </div>
          )}
        </div>

        {aidesPaginees.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <p className="font-bold text-gray-800 mb-2">Aucune aide trouvée</p>
            <p className="text-sm text-gray-400 mb-5">Modifiez vos critères de recherche</p>
            <button onClick={reset} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Réinitialiser</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {aidesPaginees.map(aide => {
              const tc = TYPE_CFG[aide.type_aide] || { label: aide.type_aide, cls: 'bg-gray-100 text-gray-500 border border-gray-200' }
              const sc = STATUT_CFG[aide.statut] || { label: aide.statut, cls: 'bg-gray-100 text-gray-500 border border-gray-200', dot: 'bg-gray-400' }
              return (
                <div key={aide.id} onClick={() => navigate(`/catalogue/${aide.id}`)}
                  className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tc.cls}`}>{tc.label}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${sc.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug line-clamp-2">{aide.titre}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 flex-1 line-clamp-2">{aide.description}</p>
                  {aide.organisme_financeur && <p className="text-xs text-gray-400 mb-3">🏛 {aide.organisme_financeur}</p>}
                  {(aide.montant_min || aide.montant_max) && (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-3">
                      <span className="text-sm font-bold text-blue-600">{aide.montant_min?.toLocaleString('fr-FR') || '0'} – {aide.montant_max?.toLocaleString('fr-FR') || '∞'} €</span>
                    </div>
                  )}
                  <button onClick={e => { e.stopPropagation(); navigate(`/catalogue/${aide.id}`) }}
                    className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    En savoir plus →
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-2 text-sm font-medium border border-gray-200 bg-white text-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Précédent</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 text-sm font-semibold rounded-lg border transition-colors ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-2 text-sm font-medium border border-gray-200 bg-white text-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50">Suivant →</button>
          </div>
        )}
      </div>
      <footer className="border-t border-gray-100 py-5 text-center mt-8">
        <p className="text-xs text-gray-400">© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
      </footer>
    </div>
  )
}