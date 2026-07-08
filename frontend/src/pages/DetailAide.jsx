import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import NavbarShared from '../components/NavbarShared'

const parseList = (str) => !str ? [] : str.split(/,|\n/).map(s => s.trim()).filter(Boolean)
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('fr-FR') } catch { return d } }

const TYPE_CFG = { subvention: { label: 'Subvention', cls: 'bg-blue-50 text-blue-700 border border-blue-100' }, pret: { label: 'Prêt', cls: 'bg-violet-50 text-violet-700 border border-violet-100' }, exoneration: { label: 'Exonération', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' }, formation: { label: 'Formation', cls: 'bg-amber-50 text-amber-700 border border-amber-100' } }
const STATUT_CFG = { active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' }, a_venir: { label: 'À venir', cls: 'bg-blue-50 text-blue-700 border border-blue-100' }, cloturee: { label: 'Clôturée', cls: 'bg-gray-100 text-gray-500 border border-gray-200' }, suspendue: { label: 'Suspendue', cls: 'bg-red-50 text-red-600 border border-red-100' } }

export default function DetailAide() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [aide, setAide] = useState(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    api.get(`/aides/${id}`).then(r => { setAide(r.data); setChargement(false) }).catch(() => { setAide(null); setChargement(false) })
  }, [id])

  if (chargement) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7ff' }}>
      <NavbarShared />
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!aide) return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>
      <NavbarShared />
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-gray-600 font-semibold">Aide introuvable</p>
        <button onClick={() => navigate('/catalogue')} className="btn-gradient px-4 py-2 text-sm font-semibold rounded-lg" style={{ color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 8, fontFamily: 'inherit' }}>Retour au catalogue</button>
      </div>
    </div>
  )

  const tc = TYPE_CFG[aide.type_aide] || { label: aide.type_aide, cls: 'bg-gray-100 text-gray-500 border border-gray-200' }
  const sc = STATUT_CFG[aide.statut] || { label: aide.statut, cls: 'bg-gray-100 text-gray-500 border border-gray-200' }
  const documents = parseList(aide.documents_requis)
  const beneficiaires = parseList(aide.beneficiaires)

  return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>
      <NavbarShared />
      <div className="max-w-6xl mx-auto px-6 py-6">
        <button onClick={() => navigate('/catalogue')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
          ← Retour au catalogue
        </button>

        <div className="grid grid-cols-3 gap-6 items-start">
          {/* Colonne principale */}
          <div className="col-span-2 flex flex-col gap-5">
            <div className="bg-white rounded-2xl p-7" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
              <div className="flex gap-2 mb-5">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tc.cls}`}>{tc.label}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.cls}`}>{sc.label}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-4 leading-snug tracking-tight">{aide.titre}</h1>
              {aide.description && <p className="text-gray-500 text-sm leading-relaxed">{aide.description}</p>}
              {aide.criteres_eligibilite && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-800 mb-2">Critères d'éligibilité</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{aide.criteres_eligibilite}</p>
                </div>
              )}
              {aide.lien_externe && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a href={aide.lien_externe} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-semibold hover:underline no-underline flex items-center gap-1.5" style={{ color: '#6366f1' }}>
                    🔗 Site officiel
                  </a>
                </div>
              )}
            </div>

            {documents.length > 0 && (
              <div className="bg-white rounded-2xl p-7" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
                <h2 className="text-base font-bold text-gray-800 mb-4">📎 Documents requis</h2>
                <div className="flex flex-col gap-2.5">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                      <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 text-sm">📄</div>
                      <span className="text-sm text-gray-600">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {beneficiaires.length > 0 && (
              <div className="bg-white rounded-2xl p-7" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
                <h2 className="text-base font-bold text-gray-800 mb-4">👥 Bénéficiaires éligibles</h2>
                <div className="flex flex-wrap gap-2">
                  {beneficiaires.map((b, i) => (
                    <span key={i} className="text-sm px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 font-medium" style={{ color: '#6366f1' }}>{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite */}
          <div className="sticky top-20">
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
              <h2 className="text-sm font-bold text-gray-800 mb-5">Informations clés</h2>
              <div className="flex flex-col gap-4">
                {aide.organisme_financeur && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 text-base">🏛</div>
                    <div><p className="text-xs text-gray-400 mb-0.5">Organisme</p><p className="text-sm font-bold text-gray-800">{aide.organisme_financeur}</p></div>
                  </div>
                )}
                {(aide.montant_min || aide.montant_max) && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 text-base">💶</div>
                    <div><p className="text-xs text-gray-400 mb-0.5">Montant</p><p className="text-sm font-bold text-gray-800">{aide.montant_min?.toLocaleString('fr-FR') || '0'} – {aide.montant_max?.toLocaleString('fr-FR') || '∞'} €</p></div>
                  </div>
                )}
                {(aide.date_ouverture || aide.date_fermeture) && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 text-base">📅</div>
                    <div><p className="text-xs text-gray-400 mb-0.5">Période</p><p className="text-sm font-bold text-gray-800">{fmtDate(aide.date_ouverture) || '—'} → {fmtDate(aide.date_fermeture) || '—'}</p></div>
                  </div>
                )}
                {aide.territoire && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0 text-base">🗺</div>
                    <div><p className="text-xs text-gray-400 mb-0.5">Territoire</p><p className="text-sm font-bold text-gray-800 capitalize">{aide.territoire}</p></div>
                  </div>
                )}
              </div>
              <button onClick={() => navigate(`/deposer?aide_id=${aide.id}`)}
                className="btn-gradient w-full mt-6 py-3 font-bold text-sm rounded-xl"
                style={{ color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 12, fontFamily: 'inherit' }}>
                Déposer une demande →
              </button>
            </div>
          </div>
        </div>
      </div>
      <footer className="border-t border-gray-100 py-5 text-center mt-8">
        <p className="text-xs text-gray-400">© 2026 Plateforme Aides Publiques</p>
      </footer>
    </div>
  )
}
