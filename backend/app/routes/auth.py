from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.views.utilisateur import UtilisateurCreate, UtilisateurResponse, LoginRequest, TokenResponse
from app.controllers.utilisateur_controller import UtilisateurController

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/register", response_model=UtilisateurResponse, status_code=201)
def register(user_data: UtilisateurCreate, db: Session = Depends(get_db)):
    return UtilisateurController.register(user_data, db)


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    return UtilisateurController.login(credentials, db)


@router.get("/utilisateurs", response_model=List[UtilisateurResponse])
def get_utilisateurs(db: Session = Depends(get_db)):
    return UtilisateurController.get_all(db)


@router.get("/profil/{user_id}", response_model=UtilisateurResponse)
def get_profil(user_id: UUID, db: Session = Depends(get_db)):
    return UtilisateurController.get_by_id(user_id, db)


@router.put("/profil/{user_id}", response_model=UtilisateurResponse)
def update_profil(user_id: UUID, data: dict, db: Session = Depends(get_db)):
    return UtilisateurController.update_profil(user_id, data, db)


@router.post("/profil/{user_id}/photo")
async def upload_photo(user_id: UUID, file: UploadFile = File(...), db: Session = Depends(get_db)):
    return await UtilisateurController.upload_photo(user_id, file, db)


@router.delete("/profil/{user_id}/photo")
async def supprimer_photo(user_id: UUID, db: Session = Depends(get_db)):
    return await UtilisateurController.supprimer_photo(user_id, db)


@router.put("/utilisateurs/{user_id}", response_model=UtilisateurResponse)
def update_utilisateur(user_id: UUID, data: dict, db: Session = Depends(get_db)):
    return UtilisateurController.update_admin(user_id, data, db)


@router.delete("/utilisateurs/{user_id}", status_code=204)
def delete_utilisateur(user_id: UUID, db: Session = Depends(get_db)):
    return UtilisateurController.delete(user_id, db)


@router.post("/password/demande-reset")
def demande_reset(data: dict, db: Session = Depends(get_db)):
    return UtilisateurController.demande_reset(data, db)


@router.post("/password/reset")
def reset_mot_de_passe(data: dict, db: Session = Depends(get_db)):
    return UtilisateurController.reset_mot_de_passe(data, db)
