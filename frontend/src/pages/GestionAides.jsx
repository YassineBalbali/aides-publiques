import { useState, useEffect } from 'react'
import { SidebarLayout, IconFolder, IconList, IconUsers, IconLink, IconChart, IconSettings, IconUser } from './SidebarLayout'
import api from '../api'

const ADMIN_NAV = [
  { to: '/admin/dossiers', label: 'Dossiers', Icon: IconFolder },
  { to: '/admin/aides', label: 'Gestion Aides', Icon: IconList },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', Icon: IconUsers },
  { to: '/admin/affectations', label: 'Affectations', Icon: IconLink },
  { to: '/admin/dashboard', label: 'Dashboard', Icon: IconChart },
  { to: '/admin/parametres', label: 'Paramètres', Icon: IconSettings },
  { to: '/profil', label: 'Profil', Icon: IconUser },
]

const TYPE_COLORS = {
  subvention: { bg: '#eff6ff', color: '#2563eb' },
  pret: { bg: '#f5f3ff', color: '#7c3aed' },
  exoneration: { bg: '#ecfdf5', color: '#059669' },
  formation: { bg: '#fffbeb', color: '#d97706' },
}
const STATUT_COLORS = {
  active: { bg: '#ecfdf5', color: '#059669' },
  a_venir: { bg: '#eff6ff', color: '#2563eb' },
  cloturee: { bg: '#f1f5f9', color: '#64748b' },
  suspendue: { bg: '#fef2f2', color: '#dc2626' },
}

const FORM_INIT = { titre: '', description: '', type_aide: 'subvention', montant_min: '', montant_max: '', organisme_financeur: '', statut: 'active', beneficiaires: '', date_ouverture: '', date_fermeture: '', documents_requis: '', criteres_eligibilite: '', secteur: '', territoire: 'national' }

const errorStyle = {
  color: '#dc2626',
  fontSize: 12,
  marginTop: 4,
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: 4
}

const errorInputStyle = {
  borderColor: '#dc2626',
  background: '#fef2f2'
}

function GestionAides() {
  const [aides, setAides] = useState([])
  const [chargement, setChargement] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [aideEnEdition, setAideEnEdition] = useState(null)
  const [csvResultat, setCsvResultat] = useState(null)
  const [importEnCours, setImportEnCours] = useState(false)
  const [iaEnCours, setIaEnCours] = useState(false)
  const [form, setForm] = useState(FORM_INIT)
  const [notification, setNotification] = useState(null)
  const [erreurs, setErreurs] = useState({})

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => { chargerAides() }, [])

  const afficherNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const chargerAides = () => {
    api.get('/aides/').then(r => { setAides(r.data); setChargement(false) }).catch(() => setChargement(false))
  }

  const ouvrirFormulaire = (aide = null) => {
    setErreurs({})
    if (aide) {
      setForm({ titre: aide.titre || '', description: aide.description || '', type_aide: aide.type_aide || 'subvention', montant_min: aide.montant_min || '', montant_max: aide.montant_max || '', organisme_financeur: aide.organisme_financeur || '', statut: aide.statut || 'active', beneficiaires: aide.beneficiaires || '', date_ouverture: aide.date_ouverture || '', date_fermeture: aide.date_fermeture || '', documents_requis: aide.documents_requis || '', criteres_eligibilite: aide.criteres_eligibilite || '', secteur: aide.secteur || '', territoire: aide.territoire || 'national' })
      setAideEnEdition(aide)
    } else {
      setForm(FORM_INIT)
      setAideEnEdition(null)
    }
    setShowForm(true)
  }

  const updateField = (champ, valeur) => {
    setForm({ ...form, [champ]: valeur })
    if (erreurs[champ]) {
      const nouvellesErreurs = { ...erreurs }
      delete nouvellesErreurs[champ]
      setErreurs(nouvellesErreurs)
    }
  }

  const validerFormulaire = () => {
    const nouvellesErreurs = {}

    if (!form.titre.trim()) {
      nouvellesErreurs.titre = 'Le titre est obligatoire'
    } else if (form.titre.trim().length < 5) {
      nouvellesErreurs.titre = 'Le titre doit contenir au moins 5 caractères'
    }

    if (!form.description.trim()) {
      nouvellesErreurs.description = 'La description est obligatoire'
    } else if (form.description.trim().length < 20) {
      nouvellesErreurs.description = 'La description doit contenir au moins 20 caractères'
    }

    if (!form.organisme_financeur.trim()) {
      nouvellesErreurs.organisme_financeur = "L'organisme financeur est obligatoire"
    }

    if (form.montant_min && (isNaN(form.montant_min) || parseFloat(form.montant_min) < 0)) {
      nouvellesErreurs.montant_min = 'Le montant minimum doit être un nombre positif'
    }
    if (form.montant_max && (isNaN(form.montant_max) || parseFloat(form.montant_max) < 0)) {
      nouvellesErreurs.montant_max = 'Le montant maximum doit être un nombre positif'
    }
    if (form.montant_min && form.montant_max &&
        parseFloat(form.montant_min) > parseFloat(form.montant_max)) {
      nouvellesErreurs.montant_max = 'Le montant maximum doit être supérieur au minimum'
    }

    if (form.date_ouverture && form.date_fermeture &&
        new Date(form.date_fermeture) <= new Date(form.date_ouverture)) {
      nouvellesErreurs.date_fermeture = "La date de fermeture doit être après la date d'ouverture"
    }

    setErreurs(nouvellesErreurs)
    return Object.keys(nouvellesErreurs).length === 0
  }

  const sauvegarder = async () => {
    if (!validerFormulaire()) {
      afficherNotification('error', 'Veuillez corriger les erreurs dans le formulaire')
      return
    }

    const data = { ...form, montant_min: form.montant_min ? parseFloat(form.montant_min) : null, montant_max: form.montant_max ? parseFloat(form.montant_max) : null, date_ouverture: form.date_ouverture || null, date_fermeture: form.date_fermeture || null }
    try {
      if (aideEnEdition) {
        await api.put(`/aides/${aideEnEdition.id}`, data)
        afficherNotification('success', 'Aide modifiée avec succès')
      } else {
        await api.post('/aides/', data)
        afficherNotification('success', 'Aide créée avec succès')
      }
      setShowForm(false)
      setErreurs({})
      chargerAides()
    } catch (err) {
      afficherNotification('error', err.response?.data?.detail || 'Erreur lors de la sauvegarde')
    }
  }

  const supprimerAide = async (id) => {
    if (!confirm('Supprimer cette aide ?')) return
    try {
      await api.delete(`/aides/${id}`)
      afficherNotification('success', 'Aide supprimée avec succès')
      chargerAides()
    } catch (err) {
      afficherNotification('error', 'Erreur lors de la suppression')
    }
  }

  const telechargerTemplate = () => {
    const headers = 'titre;description;type_aide;montant_min;montant_max;organisme_financeur;statut;beneficiaires;criteres_eligibilite;documents_requis\n'
    const exemple = 'Aide écologique;Subvention PME;subvention;5000;50000;ADEME;active;PME;PME -50 salariés;RIB,Kbis\n'
    const blob = new Blob([headers + exemple], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'template_aides.csv'; a.click()
  }

  const importerCSV = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setImportEnCours(true); setCsvResultat(null)
    try {
      const text = await file.text()
      const lignes = text.split('\n').filter(l => l.trim())
      const headers = lignes[0].split(';').map(h => h.trim())
      const succes = [], erreurs = []
      for (let i = 1; i < lignes.length; i++) {
        const valeurs = lignes[i].split(';').map(v => v.trim())
        const aide = {}
        headers.forEach((h, idx) => { aide[h] = valeurs[idx] || '' })
        if (!aide.titre) { erreurs.push(`Ligne ${i + 1}: titre manquant`); continue }
        try {
          await api.post('/aides/', { titre: aide.titre, description: aide.description || '', type_aide: aide.type_aide || 'subvention', montant_min: aide.montant_min ? parseFloat(aide.montant_min) : null, montant_max: aide.montant_max ? parseFloat(aide.montant_max) : null, organisme_financeur: aide.organisme_financeur || '', statut: aide.statut || 'active', beneficiaires: aide.beneficiaires || '', criteres_eligibilite: aide.criteres_eligibilite || '', documents_requis: aide.documents_requis || '' })
          succes.push(aide.titre)
        } catch { erreurs.push(`Ligne ${i + 1}: erreur "${aide.titre}"`) }
      }
      setCsvResultat({ succes, erreurs })
      if (succes.length > 0) afficherNotification('success', `${succes.length} aide(s) importée(s) avec succès`)
      chargerAides()
    } catch { setCsvResultat({ succes: [], erreurs: ['Erreur lecture fichier'] }) }
    finally { setImportEnCours(false); e.target.value = '' }
  }

  const genererAvecIA = async () => {
    if (!form.titre.trim()) {
      afficherNotification('error', "Veuillez d'abord saisir le titre de l'aide")
      return
    }
    setIaEnCours(true)
    try {
      const res = await api.post('/ia/generer-description-aide', {
        titre: form.titre,
        type_aide: form.type_aide,
        organisme_financeur: form.organisme_financeur,
        beneficiaires: form.beneficiaires,
      })
      setForm({
        ...form,
        description: res.data.description || form.description,
        criteres_eligibilite: res.data.criteres_eligibilite || form.criteres_eligibilite,
        documents_requis: res.data.documents_requis || form.documents_requis,
      })
      const nouvellesErreurs = { ...erreurs }
      delete nouvellesErreurs.description
      delete nouvellesErreurs.criteres_eligibilite
      delete nouvellesErreurs.documents_requis
      setErreurs(nouvellesErreurs)
      afficherNotification('success', 'Contenu généré avec succès par IA')
    } catch (err) {
      afficherNotification('error', 'Erreur IA : ' + (err.response?.data?.detail || 'Erreur inconnue'))
    } finally {
      setIaEnCours(false)
    }
  }

  return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      {notification && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          padding: '14px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 12,
          background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: notification.type === 'success' ? '#065f46' : '#991b1b',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          minWidth: 280, maxWidth: 420,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <span style={{ fontSize: 20 }}>
            {notification.type === 'success' ? '✅' : '❌'}
          </span>
          <span>{notification.message}</span>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Gestion des aides</h1>
          <p className="page-subtitle">Créez, modifiez et supprimez les aides du catalogue</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.open('http://127.0.0.1:8000/aides/export/csv', '_blank')}>⬇ CSV</button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.open('http://127.0.0.1:8000/aides/export/json', '_blank')}>⬇ JSON</button>
          <button className="btn btn-secondary btn-sm" onClick={telechargerTemplate}>Template CSV</button>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            {importEnCours ? 'Import...' : '⬆ Importer CSV'}
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={importerCSV} disabled={importEnCours} />
          </label>
          <button className="btn btn-primary" onClick={() => ouvrirFormulaire()}>+ Nouvelle aide</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Total', value: aides.length, color: '#2563eb' },
          { label: 'Actives', value: aides.filter(a => a.statut === 'active').length, color: '#059669' },
          { label: 'À venir', value: aides.filter(a => a.statut === 'a_venir').length, color: '#d97706' },
          { label: 'Clôturées', value: aides.filter(a => a.statut === 'cloturee').length, color: '#64748b' },
        ].map((s, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {csvResultat && (
        <div className="card" style={{ marginBottom: 14, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Rapport d'import</span>
            <button onClick={() => setCsvResultat(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 6 }}>✓ Importés ({csvResultat.succes.length})</p>
              {csvResultat.succes.map((s, i) => <p key={i} style={{ fontSize: 12, color: '#065f46' }}>• {s}</p>)}
            </div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>✕ Erreurs ({csvResultat.erreurs.length})</p>
              {csvResultat.erreurs.map((e, i) => <p key={i} style={{ fontSize: 12, color: '#991b1b' }}>• {e}</p>)}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">{aides.length} aide(s)</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              {['Titre', 'Type', 'Montant', 'Statut', 'Actions'].map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {chargement ? (
              <tr><td colSpan={5} className="empty-state">Chargement...</td></tr>
            ) : aides.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">📋</div>Aucune aide créée</div></td></tr>
            ) : aides.map((aide) => {
              const tc = TYPE_COLORS[aide.type_aide] || { bg: '#f1f5f9', color: '#64748b' }
              const sc = STATUT_COLORS[aide.statut] || { bg: '#f1f5f9', color: '#64748b' }
              return (
                <tr key={aide.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{aide.titre}</div>
                    {aide.organisme_financeur && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{aide.organisme_financeur}</div>}
                  </td>
                  <td><span className="badge" style={{ background: tc.bg, color: tc.color }}>{aide.type_aide}</span></td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>
                    {aide.montant_min && aide.montant_max ? `${Number(aide.montant_min).toLocaleString()} – ${Number(aide.montant_max).toLocaleString()} €` : '—'}
                  </td>
                  <td><span className="badge" style={{ background: sc.bg, color: sc.color }}>{aide.statut}</span></td>
                  <td>
                    <div className="action-row">
                      <button className="btn btn-sm btn-blue-sm" onClick={() => ouvrirFormulaire(aide)}>✎ Modifier</button>
                      <button className="btn btn-sm btn-danger-sm" onClick={() => supprimerAide(aide.id)}>✕ Supprimer</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">{aideEnEdition ? '✎ Modifier une aide' : '+ Nouvelle aide'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Titre <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  className="form-input"
                  placeholder="Titre de l'aide"
                  value={form.titre}
                  onChange={e => updateField('titre', e.target.value)}
                  style={erreurs.titre ? errorInputStyle : {}}
                />
                {erreurs.titre && <div style={errorStyle}>⚠ {erreurs.titre}</div>}
              </div>

              <button
                type="button"
                onClick={genererAvecIA}
                disabled={iaEnCours || !form.titre.trim()}
                style={{
                  padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: iaEnCours ? '#f5f3ff' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: iaEnCours ? '#7c3aed' : '#fff',
                  border: '1px solid #ddd6fe',
                  cursor: (iaEnCours || !form.titre.trim()) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: !form.titre.trim() ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                {iaEnCours ? '⏳ Génération en cours...' : '✨ Générer description, critères & documents avec IA'}
              </button>
              {!form.titre.trim() && (
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: -8, textAlign: 'center' }}>
                  💡 Saisissez d'abord le titre pour activer la génération IA
                </p>
              )}

              <div className="form-group">
                <label className="form-label">Description <span style={{ color: '#dc2626' }}>*</span></label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                  style={erreurs.description ? errorInputStyle : {}}
                />
                {erreurs.description && <div style={errorStyle}>⚠ {erreurs.description}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group"><label className="form-label">Type</label>
                  <select className="form-input" value={form.type_aide} onChange={e => setForm({ ...form, type_aide: e.target.value })}>
                    <option value="subvention">Subvention</option><option value="pret">Prêt</option><option value="exoneration">Exonération</option><option value="formation">Formation</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Statut</label>
                  <select className="form-input" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                    <option value="active">Active</option><option value="a_venir">À venir</option><option value="cloturee">Clôturée</option><option value="suspendue">Suspendue</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Montant min (€)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={form.montant_min}
                    onChange={e => updateField('montant_min', e.target.value)}
                    style={erreurs.montant_min ? errorInputStyle : {}}
                  />
                  {erreurs.montant_min && <div style={errorStyle}>⚠ {erreurs.montant_min}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Montant max (€)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="100000"
                    value={form.montant_max}
                    onChange={e => updateField('montant_max', e.target.value)}
                    style={erreurs.montant_max ? errorInputStyle : {}}
                  />
                  {erreurs.montant_max && <div style={errorStyle}>⚠ {erreurs.montant_max}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Organisme financeur <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  className="form-input"
                  placeholder="Ex: ADEME"
                  value={form.organisme_financeur}
                  onChange={e => updateField('organisme_financeur', e.target.value)}
                  style={erreurs.organisme_financeur ? errorInputStyle : {}}
                />
                {erreurs.organisme_financeur && <div style={errorStyle}>⚠ {erreurs.organisme_financeur}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Date ouverture</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.date_ouverture}
                    onChange={e => updateField('date_ouverture', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date fermeture</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.date_fermeture}
                    onChange={e => updateField('date_fermeture', e.target.value)}
                    style={erreurs.date_fermeture ? errorInputStyle : {}}
                  />
                  {erreurs.date_fermeture && <div style={errorStyle}>⚠ {erreurs.date_fermeture}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group"><label className="form-label">Bénéficiaires</label>
                  <select className="form-input" value={form.beneficiaires} onChange={e => setForm({ ...form, beneficiaires: e.target.value })}>
                    <option value="">Tous</option><option value="particulier">Particuliers</option><option value="entreprise">Entreprises</option><option value="association">Associations</option><option value="collectivite">Collectivités</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Territoire</label>
                  <select className="form-input" value={form.territoire} onChange={e => setForm({ ...form, territoire: e.target.value })}>
                    <option value="national">National</option><option value="regional">Régional</option><option value="departemental">Départemental</option>
                  </select>
                </div>
              </div>

              <div className="form-group"><label className="form-label">Secteur</label>
                <select className="form-input" value={form.secteur} onChange={e => setForm({ ...form, secteur: e.target.value })}>
                  <option value="">Tous secteurs</option><option value="agriculture">Agriculture</option><option value="industrie">Industrie</option><option value="commerce">Commerce</option><option value="sante">Santé</option><option value="education">Éducation</option><option value="numerique">Numérique</option><option value="batiment">Bâtiment</option><option value="autre">Autre</option>
                </select>
              </div>

              <div className="form-group"><label className="form-label">Documents requis</label><textarea className="form-input form-textarea" rows={2} placeholder="Ex: RIB, Kbis..." value={form.documents_requis} onChange={e => setForm({ ...form, documents_requis: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Critères d'éligibilité</label><textarea className="form-input form-textarea" rows={2} placeholder="Ex: PME de moins de 50 salariés..." value={form.criteres_eligibilite} onChange={e => setForm({ ...form, criteres_eligibilite: e.target.value })} /></div>

            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={sauvegarder}>{aideEnEdition ? 'Enregistrer' : "Créer l'aide"}</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowForm(false); setErreurs({}); }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default GestionAides