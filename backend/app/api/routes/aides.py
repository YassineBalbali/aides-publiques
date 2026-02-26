from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import csv
import io
from app.core.database import get_db
from app.models.aide import Aide
from app.schemas.aide import AideCreate, AideResponse

router = APIRouter(prefix="/aides", tags=["Aides"])

@router.get("/", response_model=List[AideResponse])
def get_aides(db: Session = Depends(get_db)):
    return db.query(Aide).all()

@router.get("/{aide_id}", response_model=AideResponse)
def get_aide(aide_id: UUID, db: Session = Depends(get_db)):
    aide = db.query(Aide).filter(Aide.id == aide_id).first()
    if not aide:
        raise HTTPException(status_code=404, detail="Aide non trouvée")
    return aide

@router.post("/", response_model=AideResponse, status_code=201)
def create_aide(data: AideCreate, db: Session = Depends(get_db)):
    aide = Aide(**data.model_dump())
    db.add(aide)
    db.commit()
    db.refresh(aide)
    return aide

@router.put("/{aide_id}", response_model=AideResponse)
def update_aide(aide_id: UUID, data: AideCreate, db: Session = Depends(get_db)):
    aide = db.query(Aide).filter(Aide.id == aide_id).first()
    if not aide:
        raise HTTPException(status_code=404, detail="Aide non trouvée")
    for key, value in data.model_dump().items():
        setattr(aide, key, value)
    db.commit()
    db.refresh(aide)
    return aide

@router.delete("/{aide_id}", status_code=204)
def delete_aide(aide_id: UUID, db: Session = Depends(get_db)):
    aide = db.query(Aide).filter(Aide.id == aide_id).first()
    if not aide:
        raise HTTPException(status_code=404, detail="Aide non trouvée")
    db.delete(aide)
    db.commit()

@router.post("/import/csv")
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contenu = await file.read()
    texte = contenu.decode("utf-8")
    reader = csv.DictReader(io.StringIO(texte))

    succes = 0
    erreurs = []

    for i, ligne in enumerate(reader, start=2):
        try:
            aide = Aide(
                titre=ligne.get("titre", "").strip(),
                description=ligne.get("description", "").strip() or None,
                type_aide=ligne.get("type_aide", "subvention").strip(),
                montant_min=float(ligne["montant_min"]) if ligne.get("montant_min") else None,
                montant_max=float(ligne["montant_max"]) if ligne.get("montant_max") else None,
                organisme_financeur=ligne.get("organisme_financeur", "").strip() or None,
                statut=ligne.get("statut", "active").strip(),
            )
            db.add(aide)
            succes += 1
        except Exception as e:
            erreurs.append(f"Ligne {i} : {str(e)}")

    db.commit()
    return {
        "message": f"{succes} aide(s) importée(s) avec succès",
        "succes": succes,
        "erreurs": erreurs
    }