from pydantic import BaseModel
from typing import List, Optional

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

class GenererAideRequest(BaseModel):
    titre: str
    type_aide: Optional[str] = "subvention"
    organisme_financeur: Optional[str] = ""
    beneficiaires: Optional[str] = ""

class AideGenereeResponse(BaseModel):
    description: str
    criteres_eligibilite: str
    documents_requis: str
