from fastapi import HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from uuid import UUID
import os
import shutil
from app.models.document import Document

UPLOAD_DIR = "documents"


class DocumentController:

    @staticmethod
    def get_by_dossier(dossier_id: UUID, db: Session):
        documents = db.query(Document).filter(Document.dossier_id == dossier_id).all()
        return [
            {
                "id": str(d.id),
                "nom_fichier": d.nom_fichier,
                "type_fichier": d.type_fichier,
                "taille": d.taille,
                "cree_le": d.cree_le.isoformat(),
            }
            for d in documents
        ]

    @staticmethod
    async def upload(dossier_id: UUID, uploade_par: UUID, file: UploadFile, db: Session):
        extension = file.filename.split(".")[-1].lower()
        if extension not in ["pdf", "jpg", "jpeg", "png"]:
            raise HTTPException(status_code=400, detail="Format non supporté")
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        nom_unique = f"{dossier_id}_{file.filename}"
        chemin = os.path.join(UPLOAD_DIR, nom_unique)
        with open(chemin, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        taille = os.path.getsize(chemin)
        document = Document(
            nom_fichier=file.filename,
            chemin=chemin,
            type_fichier=extension,
            taille=taille,
            dossier_id=dossier_id,
            uploade_par=uploade_par,
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        return {
            "id": str(document.id),
            "nom_fichier": document.nom_fichier,
            "type_fichier": document.type_fichier,
            "taille": document.taille,
            "cree_le": document.cree_le.isoformat(),
        }

    @staticmethod
    def telecharger(document_id: UUID, db: Session):
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document non trouvé")
        if not os.path.exists(document.chemin):
            raise HTTPException(status_code=404, detail="Fichier non trouvé")
        media_types = {"pdf": "application/pdf", "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}
        media_type = media_types.get(document.type_fichier, "application/octet-stream")
        return FileResponse(
            document.chemin,
            media_type=media_type,
        )

    @staticmethod
    def supprimer(document_id: UUID, db: Session):
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document non trouvé")
        if os.path.exists(document.chemin):
            os.remove(document.chemin)
        db.delete(document)
        db.commit()
        return {"message": "Document supprimé"}

