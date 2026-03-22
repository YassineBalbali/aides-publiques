from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from uuid import UUID
from app.models.aide import TypeAide, StatutAide

class AideCreate(BaseModel):
    titre: str
    description: Optional[str] = None
    type_aide: Optional[TypeAide] = None
    montant_min: Optional[float] = None
    montant_max: Optional[float] = None
    organisme_financeur: Optional[str] = None
    statut: Optional[StatutAide] = StatutAide.active
    beneficiaires: Optional[str] = None
    date_ouverture: Optional[date] = None
    date_fermeture: Optional[date] = None
    documents_requis: Optional[str] = None
    criteres_eligibilite: Optional[str] = None
    lien_externe: Optional[str] = None

class AideResponse(BaseModel):
    id: UUID
    titre: str
    description: Optional[str] = None
    type_aide: Optional[TypeAide] = None
    montant_min: Optional[float] = None
    montant_max: Optional[float] = None
    organisme_financeur: Optional[str] = None
    statut: Optional[StatutAide] = None
    cree_le: datetime
    beneficiaires: Optional[str] = None
    date_ouverture: Optional[date] = None
    date_fermeture: Optional[date] = None
    documents_requis: Optional[str] = None
    criteres_eligibilite: Optional[str] = None
    lien_externe: Optional[str] = None

    class Config:
        from_attributes = True