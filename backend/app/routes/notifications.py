from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.controllers.notification_controller import NotificationController

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/non-lues/{utilisateur_id}")
def get_non_lues(utilisateur_id: UUID, db: Session = Depends(get_db)):
    return NotificationController.get_non_lues(utilisateur_id, db)


@router.patch("/{notification_id}/lire")
def marquer_lue(notification_id: UUID, db: Session = Depends(get_db)):
    return NotificationController.marquer_lue(notification_id, db)


@router.patch("/toutes-lues/{utilisateur_id}")
def marquer_toutes_lues(utilisateur_id: UUID, db: Session = Depends(get_db)):
    return NotificationController.marquer_toutes_lues(utilisateur_id, db)
