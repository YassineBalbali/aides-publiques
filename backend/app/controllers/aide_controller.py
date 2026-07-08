from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
import csv
import io
import json
from app.core.redis import cache_get, cache_set, cache_delete
from app.models.aide import Aide
from app.views.aide import AideCreate, AideResponse
from app.tasks.import_tasks import import_aides_csv


class AideController:

    @staticmethod
    def get_all(db: Session):
        cached = cache_get("aides:all")
        if cached:
            return cached
        aides = db.query(Aide).all()
        result = [AideResponse.model_validate(a).model_dump() for a in aides]
        cache_set("aides:all", result, ttl=600)
        return aides

    @staticmethod
    def get_by_id(aide_id: UUID, db: Session):
        cache_key = f"aide:{aide_id}"
        cached = cache_get(cache_key)
        if cached:
            return cached
        aide = db.query(Aide).filter(Aide.id == aide_id).first()
        if not aide:
            raise HTTPException(status_code=404, detail="Aide non trouvée")
        cache_set(cache_key, AideResponse.model_validate(aide).model_dump(), ttl=600)
        return aide

    @staticmethod
    def create(data: AideCreate, db: Session):
        aide = Aide(**data.model_dump())
        db.add(aide)
        db.commit()
        db.refresh(aide)
        cache_delete("aides:all")
        return aide

    @staticmethod
    def update(aide_id: UUID, data: AideCreate, db: Session):
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

    @staticmethod
    def delete(aide_id: UUID, db: Session):
        aide = db.query(Aide).filter(Aide.id == aide_id).first()
        if not aide:
            raise HTTPException(status_code=404, detail="Aide non trouvée")
        db.delete(aide)
        db.commit()
        cache_delete(f"aide:{aide_id}")
        cache_delete("aides:all")

    @staticmethod
    async def import_csv(file):
        contenu = await file.read()
        texte = contenu.decode("utf-8")
        task = import_aides_csv.delay(texte)
        return {
            "message": "Import lancé en arrière-plan",
            "task_id": task.id,
            "status": "En cours de traitement...",
        }

    @staticmethod
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

    @staticmethod
    def export_csv(db: Session):
        aides = db.query(Aide).all()
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';')
        writer.writerow([
            'Titre', 'Description', 'Type', 'Statut',
            'Organisme', 'Montant Min (€)', 'Montant Max (€)',
            'Bénéficiaires', 'Date ouverture', 'Date fermeture',
            'Documents requis', 'Critères éligibilité', 'Lien externe',
        ])
        for a in aides:
            writer.writerow([
                a.titre or '', a.description or '', a.type_aide or '', a.statut or '',
                a.organisme_financeur or '', a.montant_min or '', a.montant_max or '',
                a.beneficiaires or '',
                a.date_ouverture.strftime('%d/%m/%Y') if a.date_ouverture else '',
                a.date_fermeture.strftime('%d/%m/%Y') if a.date_fermeture else '',
                a.documents_requis or '', a.criteres_eligibilite or '', a.lien_externe or '',
            ])
        output.seek(0)
        nom_fichier = f"aides_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv; charset=utf-8-sig",
            headers={"Content-Disposition": f"attachment; filename={nom_fichier}"},
        )

    @staticmethod
    def export_json(db: Session):
        aides = db.query(Aide).all()
        data = []
        for a in aides:
            data.append({
                "titre": a.titre, "description": a.description,
                "type_aide": a.type_aide, "statut": a.statut,
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
            headers={"Content-Disposition": f"attachment; filename={nom_fichier}"},
        )
