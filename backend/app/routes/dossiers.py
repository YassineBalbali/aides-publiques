from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.views.dossier import DossierCreate, DossierResponse
from app.controllers.dossier_controller import DossierController

router = APIRouter(prefix="/dossiers", tags=["Dossiers"])


@router.get("/", response_model=List[DossierResponse])
def get_dossiers(db: Session = Depends(get_db)):
    return DossierController.get_all(db)


@router.get("/export/csv")
def export_dossiers_csv(db: Session = Depends(get_db)):
    return DossierController.export_csv(db)


@router.get("/export/json")
def export_dossiers_json(db: Session = Depends(get_db)):
    return DossierController.export_json(db)


@router.get("/{dossier_id}", response_model=DossierResponse)
def get_dossier(dossier_id: UUID, db: Session = Depends(get_db)):
    return DossierController.get_by_id(dossier_id, db)


@router.post("/", response_model=DossierResponse, status_code=201)
def create_dossier(data: DossierCreate, demandeur_id: UUID, db: Session = Depends(get_db)):
    return DossierController.create(data, demandeur_id, db)


@router.patch("/{dossier_id}/statut", response_model=DossierResponse)
def changer_statut(dossier_id: UUID, statut: str, db: Session = Depends(get_db)):
    return DossierController.changer_statut(dossier_id, statut, db)


@router.patch("/{dossier_id}/affecter", response_model=DossierResponse)
def affecter_instructeur(dossier_id: UUID, instructeur_id: UUID, db: Session = Depends(get_db)):
    return DossierController.affecter_instructeur(dossier_id, instructeur_id, db)


@router.patch("/{dossier_id}/commentaire-interne", response_model=DossierResponse)
def modifier_commentaire_interne(dossier_id: UUID, data: dict, db: Session = Depends(get_db)):
    return DossierController.modifier_commentaire_interne(dossier_id, data, db)


@router.get("/{dossier_id}/historique")
def get_historique(dossier_id: UUID, db: Session = Depends(get_db)):
    return DossierController.get_historique(dossier_id, db)