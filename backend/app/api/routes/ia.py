"""
Routes IA pour le projet Aides Publiques.

À ajouter dans ton backend FastAPI.
Crée un fichier `app/routes/ia.py` avec ce contenu, puis enregistre-le dans `main.py` :

    from app.routes import ia
    app.include_router(ia.router)

Variables d'environnement requises (dans ton .env) :
    GROQ_API_KEY=ta_cle_groq
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from groq import Groq

router = APIRouter(prefix="/ia", tags=["IA"])

# Initialiser le client Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"


# ============================================================
# 1. GÉNÉRATION DE RÉPONSES POUR L'INSTRUCTEUR
# ============================================================

class SuggererReponseRequest(BaseModel):
    dossier_numero: str
    demandeur_nom: str
    aide_titre: str
    statut_actuel: str
    description_dossier: Optional[str] = ""
    derniers_messages: Optional[List[dict]] = []


class ReponsesSuggereesResponse(BaseModel):
    acceptation: str
    refus: str
    complement: str


@router.post("/suggerer-reponse", response_model=ReponsesSuggereesResponse)
async def suggerer_reponse(req: SuggererReponseRequest):
    """Génère 3 messages prêts à envoyer pour l'instructeur."""
    
    historique = ""
    if req.derniers_messages:
        historique = "\n\nHistorique des derniers messages :\n"
        for msg in req.derniers_messages[-5:]:
            historique += f"- {msg.get('expediteur_nom', 'Anonyme')}: {msg.get('contenu', '')}\n"
    
    prompt = f"""Tu es un assistant pour un instructeur d'aides publiques en France. Génère 3 messages professionnels, courtois et personnalisés à envoyer au demandeur.

Contexte du dossier :
- Numéro : {req.dossier_numero}
- Demandeur : {req.demandeur_nom}
- Aide demandée : {req.aide_titre}
- Statut actuel : {req.statut_actuel}
- Description : {req.description_dossier}
{historique}

Génère 3 messages en français, dans un format JSON STRICT :
{{
  "acceptation": "Message annonçant l'acceptation du dossier (chaleureux, félicitations, prochaines étapes)",
  "refus": "Message annonçant le refus de manière courtoise (motivation, voies de recours)",
  "complement": "Message demandant des documents/informations complémentaires (liste précise)"
}}

Chaque message doit :
- Commencer par "Bonjour M./Mme [Nom]" 
- Mentionner le numéro de dossier
- Être professionnel et bienveillant
- Faire 4-6 lignes maximum
- Se terminer par "Cordialement,\\nL'équipe d'instruction"

Réponds UNIQUEMENT avec le JSON, sans markdown."""

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"},
        )
        
        contenu = completion.choices[0].message.content.strip()
        data = json.loads(contenu)
        
        # Helper pour extraire une string même si l'IA retourne un dict {"message": "..."}
        def extraire_str(val):
            if isinstance(val, str):
                return val
            if isinstance(val, dict):
                return val.get("texte") or val.get("message") or val.get("content") or val.get("text") or str(val)
            return str(val) if val else ""
        
        return ReponsesSuggereesResponse(
            acceptation=extraire_str(data.get("acceptation", "")),
            refus=extraire_str(data.get("refus", "")),
            complement=extraire_str(data.get("complement", "")),
        )
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Réponse IA invalide: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")


# ============================================================
# 2. ANALYSE INTELLIGENTE DE DOSSIER
# ============================================================

class AnalyserDossierRequest(BaseModel):
    dossier_numero: str
    demandeur_nom: str
    aide_titre: str
    aide_criteres: Optional[str] = ""
    aide_documents_requis: Optional[str] = ""
    description_dossier: Optional[str] = ""
    documents_fournis: Optional[List[str]] = []


class AnalyseDossierResponse(BaseModel):
    resume: str
    points_attention: List[str]
    documents_manquants: List[str]
    score_complétude: int
    recommandation: str


@router.post("/analyser-dossier", response_model=AnalyseDossierResponse)
async def analyser_dossier(req: AnalyserDossierRequest):
    """Analyse un dossier et fournit un résumé + points d'attention."""
    
    docs_fournis_str = ", ".join(req.documents_fournis) if req.documents_fournis else "Aucun"
    nb_docs_fournis = len(req.documents_fournis) if req.documents_fournis else 0
    description_existante = "Oui" if req.description_dossier and len(req.description_dossier.strip()) > 20 else "Non"
    
    prompt = f"""Tu es un assistant pour un instructeur d'aides publiques. Analyse le dossier ci-dessous et fournis une synthèse.

Dossier : {req.dossier_numero}
Demandeur : {req.demandeur_nom}
Aide demandée : {req.aide_titre}

Critères d'éligibilité de l'aide :
{req.aide_criteres or 'Non spécifiés'}

Documents requis :
{req.aide_documents_requis or 'Non spécifiés'}

Description fournie par le demandeur :
{req.description_dossier or 'Aucune description'}
(Description fournie : {description_existante})

Documents fournis ({nb_docs_fournis} fichier(s)) :
{docs_fournis_str}

RÈGLES POUR LE SCORE DE COMPLÉTUDE (entre 0 et 100) :
- 90-100 : Description complète + tous documents requis fournis
- 75-89 : Description correcte + plupart des documents fournis (1-2 manquants)
- 60-74 : Description fournie + certains documents fournis
- 40-59 : Description courte ou peu de documents fournis
- 20-39 : Description très brève ET peu/pas de documents
- 0-19 : Aucune description ET aucun document

Si {nb_docs_fournis} > 0 documents sont fournis, le score doit être au minimum 50.
Si une description détaillée existe ET au moins 1 document, le score doit être au minimum 65.

Génère une analyse au format JSON STRICT :
{{
  "resume": "Résumé du dossier en 2-3 phrases courtes (50-80 mots)",
  "points_attention": ["Point 1", "Point 2", "Point 3"] (3 à 5 points clés),
  "documents_manquants": ["Doc 1", "Doc 2"] (uniquement si certains des documents requis ne sont pas fournis, sinon liste vide),
  "score_complétude": 75 (entier entre 0 et 100, suis les règles ci-dessus),
  "recommandation": "Action recommandée à l'instructeur en une phrase courte"
}}

Réponds UNIQUEMENT avec le JSON, sans markdown."""

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=1500,
            response_format={"type": "json_object"},
        )
        
        contenu = completion.choices[0].message.content.strip()
        data = json.loads(contenu)
        
        def extraire_str(val):
            if isinstance(val, str):
                return val
            if isinstance(val, dict):
                return val.get("texte") or val.get("message") or val.get("content") or val.get("text") or str(val)
            return str(val) if val else ""
        
        def extraire_liste(val):
            if isinstance(val, list):
                return [extraire_str(x) for x in val]
            if isinstance(val, str):
                return [val] if val else []
            return []
        
        return AnalyseDossierResponse(
            resume=extraire_str(data.get("resume", "")),
            points_attention=extraire_liste(data.get("points_attention", [])),
            documents_manquants=extraire_liste(data.get("documents_manquants", [])),
            score_complétude=int(data.get("score_complétude", 0) or 0),
            recommandation=extraire_str(data.get("recommandation", "")),
        )
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Réponse IA invalide: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")


# ============================================================
# 3. GÉNÉRATION DE DESCRIPTION D'AIDE
# ============================================================

class GenererAideRequest(BaseModel):
    titre: str
    type_aide: Optional[str] = "subvention"
    organisme_financeur: Optional[str] = ""
    beneficiaires: Optional[str] = ""


class AideGenereeResponse(BaseModel):
    description: str
    criteres_eligibilite: str
    documents_requis: str


@router.post("/generer-description-aide", response_model=AideGenereeResponse)
async def generer_description_aide(req: GenererAideRequest):
    """Génère automatiquement description, critères et documents pour une aide."""
    
    prompt = f"""Tu es un expert en aides publiques françaises. À partir des informations ci-dessous, génère une fiche complète pour cette aide.

Titre de l'aide : {req.titre}
Type d'aide : {req.type_aide}
Organisme financeur : {req.organisme_financeur or 'Non spécifié'}
Bénéficiaires : {req.beneficiaires or 'Non spécifié'}

Génère une fiche au format JSON STRICT :
{{
  "description": "Description claire et complète de l'aide en 80-120 mots, expliquant son objectif et ses avantages",
  "criteres_eligibilite": "Liste des critères d'éligibilité, format texte avec retours à la ligne (4-6 critères)",
  "documents_requis": "Liste des documents à fournir, séparés par des virgules (5-8 documents)"
}}

Sois réaliste et professionnel. Adapte le contenu au type d'aide et aux bénéficiaires.
Réponds UNIQUEMENT avec le JSON, sans markdown."""

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"},
        )
        
        contenu = completion.choices[0].message.content.strip()
        data = json.loads(contenu)
        
        def extraire_str(val):
            if isinstance(val, str):
                return val
            if isinstance(val, list):
                return "\n".join(str(x) for x in val)
            if isinstance(val, dict):
                return val.get("texte") or val.get("message") or val.get("content") or val.get("text") or str(val)
            return str(val) if val else ""
        
        return AideGenereeResponse(
            description=extraire_str(data.get("description", "")),
            criteres_eligibilite=extraire_str(data.get("criteres_eligibilite", "")),
            documents_requis=extraire_str(data.get("documents_requis", "")),
        )
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Réponse IA invalide: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")