from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.message import Message
from app.models.dossier import Dossier

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("/non-lus/{user_id}")
def get_messages_non_lus(user_id: UUID, db: Session = Depends(get_db)):
    dossiers = db.query(Dossier).filter(
        (Dossier.demandeur_id == user_id) | (Dossier.instructeur_id == user_id)
    ).all()

    notifications = []
    for dossier in dossiers:
        messages_non_lus = db.query(Message).filter(
            Message.dossier_id == dossier.id,
            Message.expediteur_id != user_id,
            Message.lu == False
        ).order_by(Message.cree_le.desc()).all()

        for m in messages_non_lus:
            notifications.append({
                "id": str(m.id),
                "dossier_id": str(dossier.id),
                "numero_dossier": dossier.numero,
                "contenu": m.contenu[:60] + "..." if len(m.contenu) > 60 else m.contenu,
                "expediteur_nom": f"{m.expediteur.prenom or ''} {m.expediteur.nom or ''}".strip(),
                "expediteur_role": m.expediteur.role,
                "cree_le": m.cree_le.isoformat(),
            })

    return notifications

@router.get("/{dossier_id}")
def get_messages(dossier_id: UUID, db: Session = Depends(get_db)):
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    messages = db.query(Message).filter(
        Message.dossier_id == dossier_id
    ).order_by(Message.cree_le.asc()).all()
    return [
        {
            "id": str(m.id),
            "contenu": m.contenu,
            "expediteur_id": str(m.expediteur_id),
            "expediteur_nom": f"{m.expediteur.prenom or ''} {m.expediteur.nom or ''}".strip(),
            "expediteur_role": m.expediteur.role,
            "lu": m.lu,
            "cree_le": m.cree_le.isoformat(),
        }
        for m in messages
    ]

@router.post("/{dossier_id}")
def envoyer_message(dossier_id: UUID, data: dict, db: Session = Depends(get_db)):
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    message = Message(
        contenu=data.get("contenu"),
        dossier_id=dossier_id,
        expediteur_id=data.get("expediteur_id"),
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return {
        "id": str(message.id),
        "contenu": message.contenu,
        "expediteur_id": str(message.expediteur_id),
        "expediteur_nom": f"{message.expediteur.prenom or ''} {message.expediteur.nom or ''}".strip(),
        "expediteur_role": message.expediteur.role,
        "lu": message.lu,
        "cree_le": message.cree_le.isoformat(),
    }

@router.patch("/{dossier_id}/lire")
def marquer_lu(dossier_id: UUID, data: dict, db: Session = Depends(get_db)):
    user_id = data.get("user_id")
    db.query(Message).filter(
        Message.dossier_id == dossier_id,
        Message.expediteur_id != user_id,
        Message.lu == False
    ).update({"lu": True})
    db.commit()
    return {"message": "Messages marqués comme lus"}