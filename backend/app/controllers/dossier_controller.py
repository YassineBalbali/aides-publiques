from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from datetime import datetime
import random
import string
import csv
import io
import json
from app.models.dossier import Dossier
from app.models.utilisateur import Utilisateur
from app.models.aide import Aide
from app.models.notification import Notification
from app.models.historique import Historique
from app.views.dossier import DossierCreate
from app.tasks.email_tasks import envoyer_email_statut, send_confirmation_dossier


def _generer_numero():
    lettres = ''.join(random.choices(string.ascii_uppercase, k=3))
    chiffres = ''.join(random.choices(string.digits, k=6))
    return f"DOS-{lettres}-{chiffres}"


class DossierController:

    @staticmethod
    def get_all(db: Session):
        return db.query(Dossier).options(joinedload(Dossier.demandeur)).all()

    @staticmethod
    def get_by_id(dossier_id: UUID, db: Session):
        dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()
        if not dossier:
            raise HTTPException(status_code=404, detail="Dossier non trouvé")
        return dossier

    @staticmethod
    def create(data: DossierCreate, demandeur_id: UUID, db: Session):
        dossier = Dossier(
            numero=_generer_numero(),
            aide_id=data.aide_id,
            demandeur_id=demandeur_id,
            commentaire=data.commentaire,
        )
        db.add(dossier)
        db.commit()
        db.refresh(dossier)

        # Historique : dépôt du dossier
        historique = Historique(
            action="Dépôt du dossier",
            details=f"Le dossier {dossier.numero} a été déposé.",
            dossier_id=dossier.id,
            utilisateur_id=demandeur_id,
        )
        db.add(historique)
        db.commit()

        dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier.id).first()
        if dossier.demandeur and dossier.demandeur.email:
            aide = db.query(Aide).filter(Aide.id == data.aide_id).first()
            titre_aide = aide.titre if aide else "Aide publique"
            send_confirmation_dossier.delay(
                email=dossier.demandeur.email,
                prenom=dossier.demandeur.prenom or "",
                numero_dossier=dossier.numero,
                titre_aide=titre_aide,
            )
        return dossier

    @staticmethod
    def changer_statut(dossier_id: UUID, statut: str, db: Session):
        dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()
        if not dossier:
            raise HTTPException(status_code=404, detail="Dossier non trouvé")
        dossier.statut = statut
        db.commit()
        db.refresh(dossier)

        # Historique : changement de statut
        acteur_id = dossier.instructeur_id or dossier.demandeur_id
        labels_statut = {
            "depose": "Dossier déposé",
            "en_instruction": "Dossier mis en instruction",
            "accepte": "Dossier accepté",
            "refuse": "Dossier refusé",
            "complement_demande": "Complément demandé",
        }
        historique = Historique(
            action=labels_statut.get(statut, f"Statut changé : {statut}"),
            details=f"Le statut du dossier {dossier.numero} est passé à « {statut} ».",
            dossier_id=dossier.id,
            utilisateur_id=acteur_id,
        )
        db.add(historique)
        db.commit()

        dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()
        if dossier.demandeur and dossier.demandeur.email:
            envoyer_email_statut.delay(
                email=dossier.demandeur.email,
                numero_dossier=dossier.numero,
                nouveau_statut=statut,
            )
        return dossier

    @staticmethod
    def affecter_instructeur(dossier_id: UUID, instructeur_id: UUID, db: Session):
        dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()
        if not dossier:
            raise HTTPException(status_code=404, detail="Dossier non trouvé")
        instructeur = db.query(Utilisateur).filter(
            Utilisateur.id == instructeur_id,
            Utilisateur.role == "instructeur",
        ).first()
        if not instructeur:
            raise HTTPException(status_code=404, detail="Instructeur non trouvé")
        dossier.instructeur_id = instructeur_id
        dossier.statut = "en_instruction"
        db.commit()
        db.refresh(dossier)
        dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()
        aide = db.query(Aide).filter(Aide.id == dossier.aide_id).first()
        titre_aide = aide.titre if aide else "Aide publique"
        demandeur_nom = f"{dossier.demandeur.prenom or ''} {dossier.demandeur.nom or ''}".strip() if dossier.demandeur else "Demandeur"

        # Notification in-app pour l'instructeur
        notif = Notification(
            utilisateur_id=instructeur_id,
            type="affectation",
            titre=f"Dossier {dossier.numero} affecté",
            contenu=f"Le dossier « {titre_aide} » de {demandeur_nom} vous a été confié.",
            dossier_id=dossier.id,
            numero_dossier=dossier.numero,
        )
        db.add(notif)

        # Historique : affectation à un instructeur
        historique = Historique(
            action="Affectation à un instructeur",
            details=f"Le dossier {dossier.numero} a été affecté à {instructeur.prenom or ''} {instructeur.nom or ''}.".strip(),
            dossier_id=dossier.id,
            utilisateur_id=instructeur_id,
        )
        db.add(historique)

        db.commit()
        return dossier

    @staticmethod
    def modifier_commentaire_interne(dossier_id: UUID, data: dict, db: Session):
        dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()
        if not dossier:
            raise HTTPException(status_code=404, detail="Dossier non trouvé")
        dossier.commentaire_interne = data.get("commentaire_interne", "")
        db.commit()
        db.refresh(dossier)
        return db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()

    @staticmethod
    def export_csv(db: Session):
        dossiers = db.query(Dossier).options(joinedload(Dossier.demandeur)).all()
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';')
        writer.writerow(['Numéro', 'Statut', 'Commentaire', 'Demandeur Prénom', 'Demandeur Nom', 'Demandeur Email', 'Aide Titre', 'Date dépôt'])
        for d in dossiers:
            writer.writerow([
                d.numero or '', d.statut or '', d.commentaire or '',
                d.demandeur.prenom if d.demandeur else '',
                d.demandeur.nom if d.demandeur else '',
                d.demandeur.email if d.demandeur else '',
                d.aide.titre if hasattr(d, 'aide') and d.aide else '',
                d.cree_le.strftime('%d/%m/%Y %H:%M') if d.cree_le else '',
            ])
        output.seek(0)
        nom_fichier = f"dossiers_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv; charset=utf-8-sig",
            headers={"Content-Disposition": f"attachment; filename={nom_fichier}"},
        )

    @staticmethod
    def export_json(db: Session):
        dossiers = db.query(Dossier).options(joinedload(Dossier.demandeur)).all()
        data = []
        for d in dossiers:
            data.append({
                "numero": d.numero, "statut": d.statut, "commentaire": d.commentaire,
                "demandeur": {
                    "prenom": d.demandeur.prenom if d.demandeur else None,
                    "nom": d.demandeur.nom if d.demandeur else None,
                    "email": d.demandeur.email if d.demandeur else None,
                },
                "aide": d.aide.titre if hasattr(d, 'aide') and d.aide else None,
                "date_depot": d.cree_le.isoformat() if d.cree_le else None,
            })
        nom_fichier = f"dossiers_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        contenu = json.dumps(data, ensure_ascii=False, indent=2)
        return StreamingResponse(
            iter([contenu]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={nom_fichier}"},
        )
    @staticmethod
    def get_historique(dossier_id: UUID, db: Session):
        historiques = db.query(Historique).filter(
            Historique.dossier_id == dossier_id
        ).order_by(Historique.cree_le.asc()).all()
        return [
            {
                "id": str(h.id),
                "action": h.action,
                "details": h.details,
                "cree_le": h.cree_le.isoformat(),
            }
            for h in historiques
        ]