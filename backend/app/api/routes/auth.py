from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.utilisateur import Utilisateur
from app.schemas.utilisateur import UtilisateurCreate, UtilisateurResponse, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentification"])

@router.post("/register", response_model=UtilisateurResponse, status_code=201)
def register(user_data: UtilisateurCreate, db: Session = Depends(get_db)):
    existing = db.query(Utilisateur).filter(Utilisateur.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    utilisateur = Utilisateur(
        email=user_data.email,
        mot_de_passe=hash_password(user_data.mot_de_passe),
        nom=user_data.nom,
        prenom=user_data.prenom
    )
    db.add(utilisateur)
    db.commit()
    db.refresh(utilisateur)
    return utilisateur

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == credentials.email).first()
    if not utilisateur or not verify_password(credentials.mot_de_passe, utilisateur.mot_de_passe):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_access_token({"sub": str(utilisateur.id), "role": utilisateur.role})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/utilisateurs", response_model=List[UtilisateurResponse])
def get_utilisateurs(db: Session = Depends(get_db)):
    return db.query(Utilisateur).all()

@router.get("/profil/{user_id}", response_model=UtilisateurResponse)
def get_profil(user_id: UUID, db: Session = Depends(get_db)):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur

@router.put("/profil/{user_id}", response_model=UtilisateurResponse)
def update_profil(user_id: UUID, data: dict, db: Session = Depends(get_db)):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if "nom" in data:
        utilisateur.nom = data["nom"]
    if "prenom" in data:
        utilisateur.prenom = data["prenom"]
    if "email" in data:
        utilisateur.email = data["email"]
    
    # Changement de mot de passe
    if "nouveau_mot_de_passe" in data and data["nouveau_mot_de_passe"]:
        if "ancien_mot_de_passe" not in data:
            raise HTTPException(status_code=400, detail="Ancien mot de passe requis")
        if not verify_password(data["ancien_mot_de_passe"], utilisateur.mot_de_passe):
            raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
        utilisateur.mot_de_passe = hash_password(data["nouveau_mot_de_passe"])
    
    db.commit()
    db.refresh(utilisateur)
    return utilisateur

@router.put("/utilisateurs/{user_id}", response_model=UtilisateurResponse)
def update_utilisateur(user_id: UUID, data: dict, db: Session = Depends(get_db)):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    if "role" in data:
        utilisateur.role = data["role"]
    if "nom" in data:
        utilisateur.nom = data["nom"]
    if "prenom" in data:
        utilisateur.prenom = data["prenom"]
    if "email" in data:
        utilisateur.email = data["email"]
    db.commit()
    db.refresh(utilisateur)
    return utilisateur

@router.delete("/utilisateurs/{user_id}", status_code=204)
def delete_utilisateur(user_id: UUID, db: Session = Depends(get_db)):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    db.delete(utilisateur)
    db.commit()