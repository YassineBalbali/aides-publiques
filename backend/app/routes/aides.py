from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.views.aide import AideCreate, AideResponse
from app.controllers.aide_controller import AideController

router = APIRouter(prefix="/aides", tags=["Aides"])


@router.get("/", response_model=List[AideResponse])
def get_aides(db: Session = Depends(get_db)):
    return AideController.get_all(db)


@router.get("/export/csv")
def export_aides_csv(db: Session = Depends(get_db)):
    return AideController.export_csv(db)


@router.get("/export/json")
def export_aides_json(db: Session = Depends(get_db)):
    return AideController.export_json(db)


@router.get("/import/status/{task_id}")
def get_import_status(task_id: str):
    return AideController.get_import_status(task_id)


@router.get("/{aide_id}", response_model=AideResponse)
def get_aide(aide_id: UUID, db: Session = Depends(get_db)):
    return AideController.get_by_id(aide_id, db)


@router.post("/", response_model=AideResponse, status_code=201)
def create_aide(data: AideCreate, db: Session = Depends(get_db)):
    return AideController.create(data, db)


@router.put("/{aide_id}", response_model=AideResponse)
def update_aide(aide_id: UUID, data: AideCreate, db: Session = Depends(get_db)):
    return AideController.update(aide_id, data, db)


@router.delete("/{aide_id}", status_code=204)
def delete_aide(aide_id: UUID, db: Session = Depends(get_db)):
    return AideController.delete(aide_id, db)


@router.post("/import/csv")
async def import_csv(file: UploadFile = File(...)):
    return await AideController.import_csv(file)
