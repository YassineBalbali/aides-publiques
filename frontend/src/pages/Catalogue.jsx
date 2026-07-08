import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import NavbarShared from '../components/NavbarShared'

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

  const sel = 'px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-700 outline-none focus:border-indigo-400 cursor-pointer'

  return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>
      <NavbarShared />
      <div className="px-6 py-7" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #f5f3ff 100%)', borderBottom: '1px solid #ede9fe' }}>
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
        <div className="bg-white rounded-2xl p-4 mb-6" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
          <div className="flex gap-3 flex-wrap items-center">
            <input type="text" placeholder="🔍  Rechercher une aide..." value={recherche} onChange={e => setRecherche(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 rounded-lg text-sm border border-gray-200 outline-none focus:border-indigo-400 bg-gray-50 text-gray-800 placeholder-gray-400" />
            <select value={tri} onChange={e => setTri(e.target.value)} className={sel}>
              <option value="pertinence">Pertinence</option><option value="montant_asc">Montant ↑</option><option value="montant_desc">Montant ↓</option>
            </select>
            <button onClick={() => setShowFiltres(!showFiltres)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${showFiltres ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
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
          <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <div className="text-4xl mb-4">🔍</div>
            <p className="font-bold text-gray-800 mb-2">Aucune aide trouvée</p>
            <p className="text-sm text-gray-400 mb-5">Modifiez vos critères de recherche</p>
            <button onClick={reset} className="btn-gradient px-4 py-2 text-sm font-semibold rounded-lg" style={{ color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 8, fontFamily: 'inherit' }}>Réinitialiser</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {aidesPaginees.map(aide => {
              const tc = TYPE_CFG[aide.type_aide] || { label: aide.type_aide, cls: 'bg-gray-100 text-gray-500 border border-gray-200' }
              const sc = STATUT_CFG[aide.statut] || { label: aide.statut, cls: 'bg-gray-100 text-gray-500 border border-gray-200', dot: 'bg-gray-400' }
              return (
                <div key={aide.id} onClick={() => navigate(`/catalogue/${aide.id}`)}
                  className="bg-white rounded-2xl p-5 flex flex-col cursor-pointer transition-all"
                  style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.14)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(99,102,241,0.06)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)' }}>
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
                      <span className="text-sm font-bold" style={{ color: '#6366f1' }}>{aide.montant_min?.toLocaleString('fr-FR') || '0'} – {aide.montant_max?.toLocaleString('fr-FR') || '∞'} €</span>
                    </div>
                  )}
                  <button onClick={e => { e.stopPropagation(); navigate(`/catalogue/${aide.id}`) }}
                    className="btn-gradient w-full py-2 text-sm font-semibold rounded-lg"
                    style={{ color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 8, fontFamily: 'inherit' }}>
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
                className={`w-9 h-9 text-sm font-semibold rounded-lg border transition-colors ${p === page ? 'text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                style={p === page ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderColor: '#6366f1' } : {}}>{p}</button>
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
