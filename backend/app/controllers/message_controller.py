from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.message import Message
from app.models.dossier import Dossier
from app.models.utilisateur import Utilisateur
from app.models.notification import Notification


class MessageController:

    @staticmethod
    def get_non_lus(user_id: UUID, db: Session):
        dossiers = db.query(Dossier).filter(
            (Dossier.demandeur_id == user_id) | (Dossier.instructeur_id == user_id)
        ).all()
        notifications = []
        for dossier in dossiers:
            messages_non_lus = db.query(Message).filter(
                Message.dossier_id == dossier.id,
                Message.expediteur_id != user_id,
                Message.lu == False,
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

    @staticmethod
    def get_by_dossier(dossier_id: UUID, db: Session):
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

    @staticmethod
    def envoyer(dossier_id: UUID, data: dict, db: Session):
        dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
        if not dossier:
            raise HTTPException(status_code=404, detail="Dossier non trouvé")

        expediteur_id = data.get("expediteur_id")
        message = Message(
            contenu=data.get("contenu"),
            dossier_id=dossier_id,
            expediteur_id=expediteur_id,
        )
        db.add(message)
        db.commit()
        db.refresh(message)

        # Determiner le destinataire (l'autre partie de la conversation)
        destinataire_id = None
        if str(dossier.demandeur_id) == str(expediteur_id):
            destinataire_id = dossier.instructeur_id
        elif dossier.instructeur_id and str(dossier.instructeur_id) == str(expediteur_id):
            destinataire_id = dossier.demandeur_id

        if destinataire_id:
            expediteur_nom = f"{message.expediteur.prenom or ''} {message.expediteur.nom or ''}".strip()
            apercu = message.contenu[:60] + "..." if len(message.contenu) > 60 else message.contenu
            notif = Notification(
                utilisateur_id=destinataire_id,
                type="message",
                titre=f"Nouveau message - {dossier.numero}",
                contenu=f"{expediteur_nom} : {apercu}",
                dossier_id=dossier.id,
                numero_dossier=dossier.numero,
            )
            db.add(notif)
            db.commit()

        return {
            "id": str(message.id),
            "contenu": message.contenu,
            "expediteur_id": str(message.expediteur_id),
            "expediteur_nom": f"{message.expediteur.prenom or ''} {message.expediteur.nom or ''}".strip(),
            "expediteur_role": message.expediteur.role,
            "lu": message.lu,
            "cree_le": message.cree_le.isoformat(),
        }

    @staticmethod
    def marquer_lu(dossier_id: UUID, data: dict, db: Session):
        user_id = data.get("user_id")
        db.query(Message).filter(
            Message.dossier_id == dossier_id,
            Message.expediteur_id != user_id,
            Message.lu == False,
        ).update({"lu": True})
        db.commit()
        return {"message": "Messages marqués comme lus"}