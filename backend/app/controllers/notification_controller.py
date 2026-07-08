from sqlalchemy.orm import Session
from uuid import UUID
from app.models.notification import Notification


class NotificationController:

    @staticmethod
    def get_non_lues(utilisateur_id: UUID, db: Session):
        notifs = db.query(Notification).filter(
            Notification.utilisateur_id == utilisateur_id,
            Notification.lu == False,
        ).order_by(Notification.cree_le.desc()).all()
        return [
            {
                "id": str(n.id),
                "type": n.type,
                "titre": n.titre,
                "contenu": n.contenu or "",
                "dossier_id": str(n.dossier_id) if n.dossier_id else None,
                "numero_dossier": n.numero_dossier or "",
                "cree_le": n.cree_le.isoformat(),
            }
            for n in notifs
        ]

    @staticmethod
    def marquer_lue(notification_id: UUID, db: Session):
        notif = db.query(Notification).filter(Notification.id == notification_id).first()
        if notif:
            notif.lu = True
            db.commit()
        return {"message": "Notification marquée comme lue"}

    @staticmethod
    def marquer_toutes_lues(utilisateur_id: UUID, db: Session):
        db.query(Notification).filter(
            Notification.utilisateur_id == utilisateur_id,
            Notification.lu == False,
        ).update({"lu": True})
        db.commit()
        return {"message": "Toutes les notifications marquées comme lues"}
