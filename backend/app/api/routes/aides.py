from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime
import csv
import io
import json
from app.core.database import get_db
from app.core.redis import cache_get, cache_set, cache_delete
from app.models.aide import Aide
from app.schemas.aide import AideCreate, AideResponse
from app.tasks.import_tasks import import_aides_csv

router = APIRouter(prefix="/aides", tags=["Aides"])

# ── GET toutes les aides (avec cache Redis) ────────────
@router.get("/", response_model=List[AideResponse])
def get_aides(db: Session = Depends(get_db)):
    cached = cache_get("aides:all")
    if cached:
        return cached
    aides = db.query(Aide).all()
    result = [AideResponse.model_validate(a).model_dump() for a in aides]
    cache_set("aides:all", result, ttl=600)
    return aides

# ── GET une aide par ID (avec cache Redis) ─────────────
@router.get("/{aide_id}", response_model=AideResponse)
def get_aide(aide_id: UUID, db: Session = Depends(get_db)):
    cache_key = f"aide:{aide_id}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    aide = db.query(Aide).filter(Aide.id == aide_id).first()
    if not aide:
        raise HTTPException(status_code=404, detail="Aide non trouvée")
    cache_set(cache_key, AideResponse.model_validate(aide).model_dump(), ttl=600)
    return aide

# ── POST créer une aide ────────────────────────────────
@router.post("/", response_model=AideResponse, status_code=201)
def create_aide(data: AideCreate, db: Session = Depends(get_db)):
    aide = Aide(**data.model_dump())
    db.add(aide)
    db.commit()
    db.refresh(aide)
    cache_delete("aides:all")
    return aide

# ── PUT modifier une aide ──────────────────────────────
@router.put("/{aide_id}", response_model=AideResponse)
def update_aide(aide_id: UUID, data: AideCreate, db: Session = Depends(get_db)):
    aide = db.query(Aide).filter(Aide.id == aide_id).first()
    if not aide:
        raise HTTPException(status_code=404, detail="Aide non trouvée")
    for key, value in data.model_dump().items():
        setattr(aide, key, value)
    db.commit()
    db.refresh(aide)
    cache_delete(f"aide:{aide_id}")
    cache_delete("aides:all")
    return aide

# ── DELETE supprimer une aide ──────────────────────────
@router.delete("/{aide_id}", status_code=204)
def delete_aide(aide_id: UUID, db: Session = Depends(get_db)):
    aide = db.query(Aide).filter(Aide.id == aide_id).first()
    if not aide:
        raise HTTPException(status_code=404, detail="Aide non trouvée")
    db.delete(aide)
    db.commit()
    cache_delete(f"aide:{aide_id}")
    cache_delete("aides:all")

# ── POST import CSV via Celery ─────────────────────────
@router.post("/import/csv")
async def import_csv(file: UploadFile = File(...)):
    contenu = await file.read()
    texte = contenu.decode("utf-8")
    task = import_aides_csv.delay(texte)
    return {
        "message": "Import lancé en arrière-plan",
        "task_id": task.id,
        "status": "En cours de traitement..."
    }

# ── GET statut import CSV ──────────────────────────────
@router.get("/import/status/{task_id}")
def get_import_status(task_id: str):
    from app.celery_app import celery_app
    task = celery_app.AsyncResult(task_id)
    if task.state == "PENDING":
        return {"status": "En attente", "task_id": task_id}
    elif task.state == "STARTED":
        return {"status": "En cours", "task_id": task_id}
    elif task.state == "SUCCESS":
        return {"status": "Terminé", "task_id": task_id, "result": task.result}
    elif task.state == "FAILURE":
        return {"status": "Erreur", "task_id": task_id, "error": str(task.result)}
    return {"status": task.state, "task_id": task_id}

# ── GET export aides CSV ───────────────────────────────
@router.get("/export/csv")
def export_aides_csv(db: Session = Depends(get_db)):
    aides = db.query(Aide).all()

    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')

    writer.writerow([
        'Titre', 'Description', 'Type', 'Statut',
        'Organisme', 'Montant Min (€)', 'Montant Max (€)',
        'Bénéficiaires', 'Date ouverture', 'Date fermeture',
        'Documents requis', 'Critères éligibilité', 'Lien externe'
    ])

    for a in aides:
        writer.writerow([
            a.titre or '',
            a.description or '',
            a.type_aide or '',
            a.statut or '',
            a.organisme_financeur or '',
            a.montant_min or '',
            a.montant_max or '',
            a.beneficiaires or '',
            a.date_ouverture.strftime('%d/%m/%Y') if a.date_ouverture else '',
            a.date_fermeture.strftime('%d/%m/%Y') if a.date_fermeture else '',
            a.documents_requis or '',
            a.criteres_eligibilite or '',
            a.lien_externe or '',
        ])

    output.seek(0)
    nom_fichier = f"aides_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f"attachment; filename={nom_fichier}"}
    )

# ── GET export aides JSON ──────────────────────────────
@router.get("/export/json")
def export_aides_json(db: Session = Depends(get_db)):
    aides = db.query(Aide).all()

    data = []
    for a in aides:
        data.append({
            "titre": a.titre,
            "description": a.description,
            "type_aide": a.type_aide,
            "statut": a.statut,
            "organisme_financeur": a.organisme_financeur,
            "montant_min": float(a.montant_min) if a.montant_min else None,
            "montant_max": float(a.montant_max) if a.montant_max else None,
            "beneficiaires": a.beneficiaires,
            "date_ouverture": a.date_ouverture.isoformat() if a.date_ouverture else None,
            "date_fermeture": a.date_fermeture.isoformat() if a.date_fermeture else None,
            "documents_requis": a.documents_requis,
            "criteres_eligibilite": a.criteres_eligibilite,
            "lien_externe": a.lien_externe,
        })

    nom_fichier = f"aides_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    contenu = json.dumps(data, ensure_ascii=False, indent=2)

    return StreamingResponse(
        iter([contenu]),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={nom_fichier}"}
    )