from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.controllers.document_controller import DocumentController

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("/dossier/{dossier_id}")
def get_documents(dossier_id: UUID, db: Session = Depends(get_db)):
    return DocumentController.get_by_dossier(dossier_id, db)


@router.post("/dossier/{dossier_id}")
async def upload_document(
    dossier_id: UUID,
    uploade_par: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await DocumentController.upload(dossier_id, uploade_par, file, db)


@router.get("/telecharger/{document_id}")
def telecharger_document(document_id: UUID, db: Session = Depends(get_db)):
    return DocumentController.telecharger(document_id, db)


@router.delete("/{document_id}")
def supprimer_document(document_id: UUID, db: Session = Depends(get_db)):
    return DocumentController.supprimer(document_id, db)
