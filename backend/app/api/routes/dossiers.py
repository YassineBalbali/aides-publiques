from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
from datetime import datetime
import random
import string
import csv
import io
import json
from app.core.database import get_db
from app.models.dossier import Dossier
from app.models.utilisateur import Utilisateur
from app.models.aide import Aide
from app.schemas.dossier import DossierCreate, DossierResponse
from app.tasks.email_tasks import envoyer_email_statut, send_confirmation_dossier

router = APIRouter(prefix="/dossiers", tags=["Dossiers"])

def generer_numero():
    lettres = ''.join(random.choices(string.ascii_uppercase, k=3))
    chiffres = ''.join(random.choices(string.digits, k=6))
    return f"DOS-{lettres}-{chiffres}"

@router.get("/", response_model=List[DossierResponse])
def get_dossiers(db: Session = Depends(get_db)):
    return db.query(Dossier).options(joinedload(Dossier.demandeur)).all()

@router.get("/{dossier_id}", response_model=DossierResponse)
def get_dossier(dossier_id: UUID, db: Session = Depends(get_db)):
    dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    return dossier

@router.post("/", response_model=DossierResponse, status_code=201)
def create_dossier(data: DossierCreate, demandeur_id: UUID, db: Session = Depends(get_db)):
    dossier = Dossier(
        numero=generer_numero(),
        aide_id=data.aide_id,
        demandeur_id=demandeur_id,
        commentaire=data.commentaire
    )
    db.add(dossier)
    db.commit()
    db.refresh(dossier)
    dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier.id).first()

    # Envoyer email de confirmation
    if dossier.demandeur and dossier.demandeur.email:
        aide = db.query(Aide).filter(Aide.id == data.aide_id).first()
        titre_aide = aide.titre if aide else "Aide publique"
        send_confirmation_dossier.delay(
            email=dossier.demandeur.email,
            prenom=dossier.demandeur.prenom or "",
            numero_dossier=dossier.numero,
            titre_aide=titre_aide
        )

    return dossier

@router.patch("/{dossier_id}/statut", response_model=DossierResponse)
def changer_statut(dossier_id: UUID, statut: str, db: Session = Depends(get_db)):
    dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    dossier.statut = statut
    db.commit()
    db.refresh(dossier)
    dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()
    if dossier.demandeur and dossier.demandeur.email:
        envoyer_email_statut.delay(
            email=dossier.demandeur.email,
            numero_dossier=dossier.numero,
            nouveau_statut=statut
        )
    return dossier

@router.patch("/{dossier_id}/affecter", response_model=DossierResponse)
def affecter_instructeur(dossier_id: UUID, instructeur_id: UUID, db: Session = Depends(get_db)):
    dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    instructeur = db.query(Utilisateur).filter(
        Utilisateur.id == instructeur_id,
        Utilisateur.role == "instructeur"
    ).first()
    if not instructeur:
        raise HTTPException(status_code=404, detail="Instructeur non trouvé")
    dossier.instructeur_id = instructeur_id
    dossier.statut = "en_instruction"
    db.commit()
    db.refresh(dossier)
    return db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()

@router.patch("/{dossier_id}/commentaire-interne", response_model=DossierResponse)
def modifier_commentaire_interne(dossier_id: UUID, data: dict, db: Session = Depends(get_db)):
    dossier = db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    dossier.commentaire_interne = data.get("commentaire_interne", "")
    db.commit()
    db.refresh(dossier)
    return db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier_id).first()

@router.get("/export/csv")
def export_dossiers_csv(db: Session = Depends(get_db)):
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
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f"attachment; filename={nom_fichier}"})

@router.get("/export/json")
def export_dossiers_json(db: Session = Depends(get_db)):
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
    return StreamingResponse(iter([contenu]), media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={nom_fichier}"})