from pydantic import BaseModel
from typing import Optional
from datetime import datetime
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

    class Config:
        from_attributes = True