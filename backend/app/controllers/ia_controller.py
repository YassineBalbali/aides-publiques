from fastapi import HTTPException
from app.views.ia import (
    SuggererReponseRequest, ReponsesSuggereesResponse,
    AnalyserDossierRequest, AnalyseDossierResponse,
    GenererAideRequest, AideGenereeResponse,
)
import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"


def _extraire_str(val):
    if isinstance(val, str):
        return val.replace('\\n', '\n')
    if isinstance(val, dict):
        texte = val.get("texte") or val.get("message") or val.get("content") or val.get("text") or val.get("fr") or str(val)
        return texte.replace('\\n', '\n') if isinstance(texte, str) else str(texte)
    return str(val) if val else ""


def _extraire_liste(val):
    if isinstance(val, list):
        return [_extraire_str(x) for x in val]
    if isinstance(val, str):
        return [val] if val else []
    return []


class IAController:

    @staticmethod
    async def suggerer_reponse(req: SuggererReponseRequest):
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
            data = json.loads(completion.choices[0].message.content.strip())
            return ReponsesSuggereesResponse(
                acceptation=_extraire_str(data.get("acceptation", "")),
                refus=_extraire_str(data.get("refus", "")),
                complement=_extraire_str(data.get("complement", "")),
            )
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Réponse IA invalide: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")

    @staticmethod
    async def analyser_dossier(req: AnalyserDossierRequest):
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

Génère une analyse au format JSON STRICT avec exactement ces clés :
{{
  "resume": "Résumé du dossier en 2-3 phrases courtes (50-80 mots)",
  "points_attention": ["Point 1", "Point 2", "Point 3"],
  "documents_manquants": ["Doc 1", "Doc 2"],
  "score_completude": 75,
  "recommandation": "Action recommandée à l'instructeur en une phrase courte"
}}

IMPORTANT : La clé du score doit être exactement "score_completude" (sans accent).
Réponds UNIQUEMENT avec le JSON, sans markdown."""

        try:
            completion = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1500,
                response_format={"type": "json_object"},
            )
            data = json.loads(completion.choices[0].message.content.strip())

            # Gestion robuste du score (avec ou sans accent)
            score_val = (
                data.get("score_completude") or
                data.get("score_complétude") or
                data.get("score") or
                0
            )

            return AnalyseDossierResponse(
                resume=_extraire_str(data.get("resume", "")),
                points_attention=_extraire_liste(data.get("points_attention", [])),
                documents_manquants=_extraire_liste(data.get("documents_manquants", [])),
                score_complétude=int(score_val),
                recommandation=_extraire_str(data.get("recommandation", "")),
            )
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Réponse IA invalide: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")

    @staticmethod
    async def generer_description_aide(req: GenererAideRequest):
        prompt = f"""Tu es un expert en aides publiques françaises. À partir des informations ci-dessous, génère une fiche complète pour cette aide.

Titre de l'aide : {req.titre}
Type d'aide : {req.type_aide}
Organisme financeur : {req.organisme_financeur or 'Non spécifié'}
Bénéficiaires : {req.beneficiaires or 'Non spécifié'}

Génère une fiche au format JSON STRICT :
{{
  "description": "Description claire et complète de l'aide en 80-120 mots",
  "criteres_eligibilite": "Liste des critères d'éligibilité (4-6 critères)",
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
            data = json.loads(completion.choices[0].message.content.strip())

            def _local_str(val):
                if isinstance(val, str):
                    return val
                if isinstance(val, list):
                    return "\n".join(str(x) for x in val)
                if isinstance(val, dict):
                    return val.get("texte") or val.get("message") or val.get("content") or val.get("text") or str(val)
                return str(val) if val else ""

            return AideGenereeResponse(
                description=_local_str(data.get("description", "")),
                criteres_eligibilite=_local_str(data.get("criteres_eligibilite", "")),
                documents_requis=_local_str(data.get("documents_requis", "")),
            )
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Réponse IA invalide: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")