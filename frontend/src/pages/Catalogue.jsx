import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const estConnecte = !!token

  return (
    <div>
      {/* Bandeau RF */}
      <div style={{backgroundColor: '#1f2d6e'}} className="px-8 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white font-bold text-sm px-2 py-1">RF</div>
          <div className="text-white text-xs">
            <div className="font-bold">RÉPUBLIQUE FRANÇAISE</div>
            <div className="text-blue-200">Liberté · Égalité · Fraternité</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {estConnecte ? (
            <button
              onClick={() => { localStorage.removeItem('token'); navigate('/') }}
              className="text-white text-sm hover:underline">
              Se déconnecter
            </button>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1 text-white text-sm hover:underline">
                <span>→</span> Connexion
              </Link>
              <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Navbar principale */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between shadow-sm">
        <Link to="/" className="text-blue-900 font-bold text-xl">Aides Publiques</Link>
        <div className="flex items-center gap-8 text-sm">
          <Link to="/" className="text-gray-700 hover:text-blue-900 transition-colors">Accueil</Link>
          <Link to="/aides" className="text-blue-900 font-semibold border-b-2 border-blue-900 pb-1">Catalogue des aides</Link>
          <Link to="/deposer" className="text-gray-700 hover:text-blue-900 transition-colors">Déposer un dossier</Link>
          <Link to="/mon-espace" className="text-gray-700 hover:text-blue-900 transition-colors">Suivi</Link>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 px-8 mt-12">
      <div className="grid grid-cols-4 gap-8 max-w-6xl mx-auto mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-red-600 text-white font-bold text-sm px-2 py-1">RF</div>
            <span className="font-bold text-gray-900">RÉPUBLIQUE FRANÇAISE</span>
          </div>
          <p className="text-gray-500 text-sm">Plateforme de gestion et suivi des aides publiques.</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Navigation</h3>
          <div className="flex flex-col gap-2">
            <Link to="/aides" className="text-gray-500 hover:text-blue-900 text-sm transition-colors">Catalogue des aides</Link>
            <Link to="/deposer" className="text-gray-500 hover:text-blue-900 text-sm transition-colors">Déposer un dossier</Link>
            <Link to="/mon-espace" className="text-gray-500 hover:text-blue-900 text-sm transition-colors">Suivre mon dossier</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Espace pro</h3>
          <div className="flex flex-col gap-2">
            <Link to="/admin" className="text-gray-500 hover:text-blue-900 text-sm transition-colors">Espace instructeur</Link>
            <Link to="/admin" className="text-gray-500 hover:text-blue-900 text-sm transition-colors">Administration</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Informations</h3>
          <div className="flex flex-col gap-2">
            <a href="#" className="text-gray-500 hover:text-blue-900 text-sm transition-colors">Mentions légales</a>
            <a href="#" className="text-gray-500 hover:text-blue-900 text-sm transition-colors">Politique de confidentialité</a>
            <a href="#" className="text-gray-500 hover:text-blue-900 text-sm transition-colors">Accessibilité</a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-6 text-center">
        <p className="text-gray-400 text-sm">© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
      </div>
    </footer>
  )
}

const AIDES_DEMO = [
  {
    id: '1',
    titre: "Aide à la transition écologique des PME",
    description: "Subvention pour accompagner les petites et moyennes entreprises dans leur transition écologique et environnementale.",
    type_aide: 'subvention',
    montant_min: 5000,
    montant_max: 50000,
    organisme_financeur: 'ADEME',
    territoire: 'National',
    date_fin: '31/12/2026',
    statut: 'active'
  },
  {
    id: '2',
    titre: "Bourse régionale d'excellence académique",
    description: "Bourse destinée aux étudiants en licence et master résidant en Île-de-France ayant obtenu mention très bien.",
    type_aide: 'subvention',
    montant_min: 1000,
    montant_max: 5000,
    organisme_financeur: 'Conseil Régional IDF',
    territoire: 'Île-de-France',
    date_fin: '30/11/2026',
    statut: 'a_venir'
  },
  {
    id: '3',
    titre: "Prêt à taux zéro pour la rénovation énergétique",
    description: "Prêt sans intérêt pour financer des travaux de rénovation énergétique dans les logements anciens.",
    type_aide: 'pret',
    montant_min: 10000,
    montant_max: 30000,
    organisme_financeur: 'Ministère du Logement',
    territoire: 'National',
    date_fin: '31/12/2026',
    statut: 'active'
  },
  {
    id: '4',
    titre: "Exonération de charges pour jeunes agriculteurs",
    description: "Exonération partielle de cotisations sociales pour les jeunes agriculteurs s'installant pour la première fois.",
    type_aide: 'exoneration',
    montant_min: null,
    montant_max: null,
    organisme_financeur: 'MSA',
    territoire: 'National',
    date_fin: '31/12/2026',
    statut: 'active'
  },
  {
    id: '5',
    titre: "Formation numérique pour les associations",
    description: "Programme de formation gratuit pour accompagner la transformation numérique des associations loi 1901.",
    type_aide: 'formation',
    montant_min: null,
    montant_max: null,
    organisme_financeur: 'Agence du Numérique',
    territoire: 'National',
    date_fin: '15/06/2026',
    statut: 'active'
  },
  {
    id: '6',
    titre: "Subvention commerce de proximité",
    description: "Aide financière pour la modernisation des commerces de proximité en zone rurale.",
    type_aide: 'subvention',
    montant_min: 2000,
    montant_max: 15000,
    organisme_financeur: 'Conseil Départemental',
    territoire: 'Départemental',
    date_fin: '30/09/2026',
    statut: 'active'
  },
]

function Catalogue() {
  const [aides, setAides] = useState(AIDES_DEMO)
  const [recherche, setRecherche] = useState('')
  const [filtreType, setFiltreType] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [filtreTerritoire, setFiltreTerritoire] = useState('')

  useEffect(() => {
  api.get('/aides/')
    .then(r => { if (r.data.length > 0) setAides(r.data) })
    .catch(() => {})
}, [])
  const aidesFiltrees = aides.filter(a => {
    const matchRecherche = a.titre.toLowerCase().includes(recherche.toLowerCase())
    const matchType = filtreType ? a.type_aide === filtreType : true
    const matchStatut = filtreStatut ? a.statut === filtreStatut : true
    const matchTerritoire = filtreTerritoire ? a.territoire === filtreTerritoire : true
    return matchRecherche && matchType && matchStatut && matchTerritoire
  })

  const badgeStatut = (statut) => {
    const styles = {
      active: 'bg-green-500 text-white',
      a_venir: 'bg-blue-500 text-white',
      cloturee: 'bg-gray-400 text-white',
      suspendue: 'bg-red-500 text-white',
    }
    const labels = {
      active: 'Active',
      a_venir: 'À venir',
      cloturee: 'Clôturée',
      suspendue: 'Suspendue'
    }
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[statut] || 'bg-gray-400 text-white'}`}>
        {labels[statut] || statut}
      </span>
    )
  }

  const badgeType = (type) => {
    const styles = {
      subvention: 'border border-gray-300 text-gray-600',
      pret: 'border border-gray-300 text-gray-600',
      exoneration: 'border border-gray-300 text-gray-600',
      formation: 'border border-gray-300 text-gray-600',
    }
    const labels = {
      subvention: 'Subvention',
      pret: 'Prêt',
      exoneration: 'Exonération',
      formation: 'Formation',
    }
    return type ? (
      <span className={`text-xs px-3 py-1 rounded-full bg-gray-50 ${styles[type] || ''}`}>
        {labels[type] || type}
      </span>
    ) : null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header bleu */}
      <div style={{backgroundColor: '#1f2d6e'}} className="px-12 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Catalogue des aides</h1>
        <p className="text-blue-200">Retrouvez l'ensemble des dispositifs d'aides publiques disponibles.</p>
      </div>

      {/* Filtres */}
      <div className="px-12 py-6 bg-white border-b border-gray-200">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="🔍 Rechercher une aide..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 min-w-64 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
          />
          <select
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none text-sm"
          >
            <option value="">Tous les types</option>
            <option value="subvention">Subvention</option>
            <option value="pret">Prêt</option>
            <option value="exoneration">Exonération</option>
            <option value="formation">Formation</option>
          </select>
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="a_venir">À venir</option>
            <option value="cloturee">Clôturée</option>
          </select>
          <select
            value={filtreTerritoire}
            onChange={(e) => setFiltreTerritoire(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none text-sm"
          >
            <option value="">Tous</option>
            <option value="National">National</option>
            <option value="Île-de-France">Île-de-France</option>
            <option value="Départemental">Départemental</option>
          </select>
        </div>
        <p className="text-gray-500 text-sm mt-3">{aidesFiltrees.length} aide(s) trouvée(s)</p>
      </div>

      {/* Cards */}
      <div className="px-12 py-8">
        {aidesFiltrees.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">Aucune aide trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aidesFiltrees.map(aide => (
              <div key={aide.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  {badgeType(aide.type_aide)}
                  {badgeStatut(aide.statut)}
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2 leading-snug">{aide.titre}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3">{aide.description}</p>
                <div className="flex flex-col gap-1 mb-4">
                  {aide.organisme_financeur && (
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      🏦 {aide.organisme_financeur}
                    </p>
                  )}
                  {aide.territoire && (
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      📍 {aide.territoire}
                    </p>
                  )}
                  {aide.date_fin && (
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      📅 Jusqu'au {aide.date_fin}
                    </p>
                  )}
                </div>
                {(aide.montant_min || aide.montant_max) && (
                  <div className="bg-gray-50 rounded-lg px-4 py-2 mb-4">
                    <p className="text-gray-700 font-semibold text-sm">
                      {aide.montant_min?.toLocaleString() || '0'} € — {aide.montant_max?.toLocaleString() || '∞'} €
                    </p>
                  </div>
                )}
                <button className="w-full border border-gray-300 hover:border-blue-900 hover:text-blue-900 text-gray-700 font-semibold py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                  Voir le détail →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Catalogue