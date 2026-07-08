from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class ParametreResponse(BaseModel):
    id: UUID
    nom_plateforme: str
    logo_url: Optional[str] = None
    mentions_legales: Optional[str] = None

    class Config:
        from_attributes = True


class ParametreUpdate(BaseModel):
    nom_plateforme: Optional[str] = None
    logo_url: Optional[str] = None
    mentions_legales: Optional[str] = None