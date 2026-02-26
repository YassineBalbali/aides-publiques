from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.dossier import StatutDossier

class DemandeurInfo(BaseModel):
    id: UUID
    email: str
    nom: Optional[str] = None
    prenom: Optional[str] = None

    class Config:
        from_attributes = True

class DossierCreate(BaseModel):
    aide_id: UUID
    commentaire: Optional[str] = None

class DossierResponse(BaseModel):
    id: UUID
    numero: str
    statut: StatutDossier
    commentaire: Optional[str] = None
    demandeur_id: UUID
    demandeur: Optional[DemandeurInfo] = None
    aide_id: UUID
    instructeur_id: Optional[UUID] = None
    cree_le: datetime
    mis_a_jour_le: datetime

    class Config:
        from_attributes = True