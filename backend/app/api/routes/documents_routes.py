from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from uuid import UUID
import os
import shutil
from app.core.database import get_db
from app.models.document import Document

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/dossier/{dossier_id}")
def get_documents(dossier_id: UUID, db: Session = Depends(get_db)):
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

@router.post("/dossier/{dossier_id}")
async def upload_document(
    dossier_id: UUID,
    uploade_par: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    extension = file.filename.split(".")[-1].lower()
    if extension not in ["pdf", "jpg", "jpeg", "png"]:
        raise HTTPException(status_code=400, detail="Format non supporté")

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

@router.get("/telecharger/{document_id}")
def telecharger_document(document_id: UUID, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    if not os.path.exists(document.chemin):
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    return FileResponse(
        document.chemin,
        filename=document.nom_fichier,
        media_type="application/octet-stream"
    )

@router.delete("/{document_id}")
def supprimer_document(document_id: UUID, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    if os.path.exists(document.chemin):
        os.remove(document.chemin)
    db.delete(document)
    db.commit()
    return {"message": "Document supprimé"}