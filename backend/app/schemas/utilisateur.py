from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.utilisateur import RoleUtilisateur

class UtilisateurCreate(BaseModel):
    email: EmailStr
    mot_de_passe: str
    nom: Optional[str] = None
    prenom: Optional[str] = None

class UtilisateurResponse(BaseModel):
    id: UUID
    email: str
    nom: Optional[str] = None
    prenom: Optional[str] = None
    role: RoleUtilisateur
    est_actif: bool
    cree_le: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"