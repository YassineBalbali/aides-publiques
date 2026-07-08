from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from uuid import UUID
import shutil
import os
import secrets
from datetime import datetime, timedelta, timezone
from app.core.security import hash_password, verify_password, create_access_token
from app.models.utilisateur import Utilisateur
from app.views.utilisateur import UtilisateurCreate, LoginRequest
from app.tasks.email_tasks import send_reset_password_email

reset_tokens = {}


class UtilisateurController:

    @staticmethod
    def register(user_data: UtilisateurCreate, db: Session):
        existing = db.query(Utilisateur).filter(Utilisateur.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email déjà utilisé")
        utilisateur = Utilisateur(
            email=user_data.email,
            mot_de_passe=hash_password(user_data.mot_de_passe),
            nom=user_data.nom,
            prenom=user_data.prenom,
        )
        db.add(utilisateur)
        db.commit()
        db.refresh(utilisateur)
        return utilisateur

    @staticmethod
    def login(credentials: LoginRequest, db: Session):
        utilisateur = db.query(Utilisateur).filter(Utilisateur.email == credentials.email).first()
        if not utilisateur or not verify_password(credentials.mot_de_passe, utilisateur.mot_de_passe):
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        token = create_access_token({
            "sub": str(utilisateur.id),
            "role": utilisateur.role,
            "prenom": utilisateur.prenom or "",
            "nom": utilisateur.nom or "",
        })
        return {"access_token": token, "token_type": "bearer"}

    @staticmethod
    def get_all(db: Session):
        return db.query(Utilisateur).all()

    @staticmethod
    def get_by_id(user_id: UUID, db: Session):
        utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
        if not utilisateur:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        return utilisateur

    @staticmethod
    def update_profil(user_id: UUID, data: dict, db: Session):
        utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
        if not utilisateur:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        for field in ["nom", "prenom", "email", "type_beneficiaire", "secteur_activite", "localisation"]:
            if field in data:
                setattr(utilisateur, field, data[field])
        if "nouveau_mot_de_passe" in data and data["nouveau_mot_de_passe"]:
            if "ancien_mot_de_passe" not in data:
                raise HTTPException(status_code=400, detail="Ancien mot de passe requis")
            if not verify_password(data["ancien_mot_de_passe"], utilisateur.mot_de_passe):
                raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
            utilisateur.mot_de_passe = hash_password(data["nouveau_mot_de_passe"])
        db.commit()
        db.refresh(utilisateur)
        return utilisateur

    @staticmethod
    async def upload_photo(user_id: UUID, file: UploadFile, db: Session):
        utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
        if not utilisateur:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        os.makedirs("photos", exist_ok=True)
        extension = file.filename.split(".")[-1].lower()
        if extension not in ["jpg", "jpeg", "png", "webp"]:
            raise HTTPException(status_code=400, detail="Format non supporté. Utilisez JPG, PNG ou WEBP")
        nom_fichier = f"photos/{user_id}.{extension}"
        with open(nom_fichier, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        utilisateur.photo = f"http://127.0.0.1:8000/photos/{user_id}.{extension}"
        db.commit()
        return {"photo": utilisateur.photo}

    @staticmethod
    async def supprimer_photo(user_id: UUID, db: Session):
        utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
        if not utilisateur:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        if utilisateur.photo:
            for ext in ["jpg", "jpeg", "png", "webp"]:
                chemin = f"photos/{user_id}.{ext}"
                if os.path.exists(chemin):
                    os.remove(chemin)
                    break
            utilisateur.photo = None
            db.commit()
        return {"detail": "Photo supprimée"}

    @staticmethod
    def update_admin(user_id: UUID, data: dict, db: Session):
        utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
        if not utilisateur:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        for field in ["role", "nom", "prenom", "email"]:
            if field in data:
                setattr(utilisateur, field, data[field])
        db.commit()
        db.refresh(utilisateur)
        return utilisateur

    @staticmethod
    def delete(user_id: UUID, db: Session):
        utilisateur = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
        if not utilisateur:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        db.delete(utilisateur)
        db.commit()

    @staticmethod
    def demande_reset(data: dict, db: Session):
        email = data.get("email")
        utilisateur = db.query(Utilisateur).filter(Utilisateur.email == email).first()
        if not utilisateur:
            raise HTTPException(status_code=404, detail="Email non trouvé")
        token = secrets.token_urlsafe(32)
        expiration = datetime.now(timezone.utc) + timedelta(hours=1)
        reset_tokens[token] = {"user_id": str(utilisateur.id), "expiration": expiration}
        send_reset_password_email.delay(email=email, prenom=utilisateur.prenom or "", token=token)
        return {"message": "Email de réinitialisation envoyé"}

    @staticmethod
    def reset_mot_de_passe(data: dict, db: Session):
        token = data.get("token")
        nouveau_mot_de_passe = data.get("nouveau_mot_de_passe")
        if not token or token not in reset_tokens:
            raise HTTPException(status_code=400, detail="Token invalide ou expiré")
        token_data = reset_tokens[token]
        if datetime.now(timezone.utc) > token_data["expiration"]:
            del reset_tokens[token]
            raise HTTPException(status_code=400, detail="Token expiré")
        utilisateur = db.query(Utilisateur).filter(Utilisateur.id == token_data["user_id"]).first()
        if not utilisateur:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        utilisateur.mot_de_passe = hash_password(nouveau_mot_de_passe)
        db.commit()
        del reset_tokens[token]
        return {"message": "Mot de passe réinitialisé avec succès"}
