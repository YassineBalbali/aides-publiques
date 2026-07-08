from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.controllers.message_controller import MessageController

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/non-lus/{user_id}")
def get_messages_non_lus(user_id: UUID, db: Session = Depends(get_db)):
    return MessageController.get_non_lus(user_id, db)


@router.get("/{dossier_id}")
def get_messages(dossier_id: UUID, db: Session = Depends(get_db)):
    return MessageController.get_by_dossier(dossier_id, db)


@router.post("/{dossier_id}")
def envoyer_message(dossier_id: UUID, data: dict, db: Session = Depends(get_db)):
    return MessageController.envoyer(dossier_id, data, db)


@router.patch("/{dossier_id}/lire")
def marquer_lu(dossier_id: UUID, data: dict, db: Session = Depends(get_db)):
    return MessageController.marquer_lu(dossier_id, data, db)
