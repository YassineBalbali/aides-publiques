from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
import random
import string
from app.core.database import get_db
from app.models.dossier import Dossier
from app.schemas.dossier import DossierCreate, DossierResponse
from app.tasks import envoyer_email_statut

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
    return db.query(Dossier).options(joinedload(Dossier.demandeur)).filter(Dossier.id == dossier.id).first()

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