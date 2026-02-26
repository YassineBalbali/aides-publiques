import { useState } from 'react'
import { Link } from 'react-router-dom'

const AIDES_DEMO = [
  {
    id: '1',
    titre: "Aide à la création d'entreprise",
    description: "Subvention pour les jeunes entrepreneurs souhaitant créer leur première entreprise. Accompagnement et financement du projet.",
    type_aide: 'subvention',
    montant_min: 1000,
    montant_max: 5000,
    organisme_financeur: 'État',
    statut: 'active'
  },
  {
    id: '2',
    titre: "Bourse Nationale pour la Recherche",
    description: "Financement accordé aux chercheurs et doctorants pour leurs projets de recherche scientifique appliquée.",
    type_aide: 'subvention',
    montant_min: 5000,
    montant_max: 20000,
    organisme_financeur: "Ministère de l'Enseignement Supérieur",
    statut: 'active'
  },
  {
    id: '3',
    titre: "Prêt à Taux Zéro — Rénovation",
    description: "Prêt sans intérêt pour les propriétaires souhaitant rénover leur logement et améliorer l'efficacité énergétique.",
    type_aide: 'pret',
    montant_min: 10000,
    montant_max: 50000,
    organisme_financeur: 'Caisse des Dépôts',
    statut: 'active'
  },
  {
    id: '4',
    titre: "Formation Professionnelle Continue",
    description: "Financement de formations certifiantes pour les salariés et demandeurs d'emploi souhaitant se reconvertir.",
    type_aide: 'formation',
    montant_min: 500,
    montant_max: 8000,
    organisme_financeur: 'France Travail',
    statut: 'active'
  },
  {
    id: '5',
    titre: "Exonération Fiscale Zone Franche",
    description: "Exonération partielle d'impôts pour les entreprises s'installant dans une zone franche urbaine.",
    type_aide: 'exoneration',
    montant_min: null,
    montant_max: null,
    organisme_financeur: 'Direction Générale des Finances Publiques',
    statut: 'a_venir'
  },
  {
    id: '6',
    titre: "Aide au Logement Social",
    description: "Subvention destinée aux ménages à revenus modestes pour faciliter l'accès à un logement décent.",
    type_aide: 'subvention',
    montant_min: 200,
    montant_max: 3000,
    organisme_financeur: 'CAF',
    statut: 'active'
  },
]

function Catalogue() {
  const [aides] = useState(AIDES_DEMO)
  const [recherche, setRecherche] = useState('')
  const [filtreType, setFiltreType] = useState('')

  const aidesFiltrees = aides.filter(a => {
    const matchRecherche = a.titre.toLowerCase().includes(recherche.toLowerCase())
    const matchType = filtreType ? a.type_aide === filtreType : true
    return matchRecherche && matchType
  })

  const badgeStatut = (statut) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      a_venir: 'bg-blue-100 text-blue-700',
      cloturee: 'bg-gray-100 text-gray-500',
      suspendue: 'bg-red-100 text-red-600',
    }
    const labels = {
      active: 'Active', a_venir: 'À venir',
      cloturee: 'Clôturée', suspendue: 'Suspendue'
    }
    return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles[statut]}`}>{labels[statut]}</span>
  }

  const badgeType = (type) => {
    const styles = {
      subvention: 'bg-yellow-100 text-yellow-700',
      pret: 'bg-purple-100 text-purple-700',
      exoneration: 'bg-orange-100 text-orange-700',
      formation: 'bg-teal-100 text-teal-700',
    }
    const labels = {
      subvention: 'Subvention',
      pret: 'Prêt',
      exoneration: 'Exonération',
      formation: 'Formation',
    }
    return type ? <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles[type] || 'bg-gray-100 text-gray-600'}`}>{labels[type] || type}</span> : null
  }

  return (
    <div style={{backgroundColor: '#1a2744', minHeight: '100vh'}}>
      {/* Navbar */}
      <nav className="px-8 py-4 flex items-center justify-between border-b border-blue-800">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <span>🏛️</span><span>AidesPubliques</span>
        </Link>
        <div className="flex items-center gap-8 text-white">
          <Link to="/aides" className="text-yellow-400 font-semibold">Catalogue</Link>
          <Link to="/deposer" className="hover:text-yellow-400">Déposer</Link>
          <Link to="/mon-espace" className="hover:text-yellow-400">Suivi</Link>
        </div>
        <Link to="/login" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-2 rounded-lg transition-colors">
          Se connecter
        </Link>
      </nav>

      {/* Header */}
      <div className="px-12 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">Catalogue des aides</h1>
        <p className="text-gray-400 mb-8">Trouvez les dispositifs adaptés à votre situation</p>

        {/* Recherche + Filtres */}
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="🔍 Rechercher une aide..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 min-w-xs bg-white rounded-xl px-5 py-3 text-gray-800 focus:outline-none shadow-lg"
          />
          <select
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value)}
            className="bg-white rounded-xl px-5 py-3 text-gray-800 focus:outline-none shadow-lg"
          >
            <option value="">Tous les types</option>
            <option value="subvention">Subvention</option>
            <option value="pret">Prêt</option>
            <option value="exoneration">Exonération</option>
            <option value="formation">Formation</option>
          </select>
        </div>

        <p className="text-gray-400 text-sm mt-4">{aidesFiltrees.length} aide(s) trouvée(s)</p>
      </div>

      {/* Contenu */}
      <div className="px-12 pb-12">
        {aidesFiltrees.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">Aucune aide trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aidesFiltrees.map(aide => (
              <div key={aide.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  {badgeType(aide.type_aide)}
                  {badgeStatut(aide.statut)}
                </div>
                <h3 className="text-gray-800 font-bold text-lg mb-2">{aide.titre}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3">{aide.description}</p>
                {aide.organisme_financeur && (
                  <p className="text-gray-400 text-xs mb-3">🏦 {aide.organisme_financeur}</p>
                )}
                {(aide.montant_min || aide.montant_max) && (
                  <p className="text-green-600 font-semibold text-sm mb-4">
                    💶 {aide.montant_min || '0'} € — {aide.montant_max || '∞'} €
                  </p>
                )}
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 rounded-lg transition-colors text-sm">
                  Voir les détails →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Catalogue