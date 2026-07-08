from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.views.parametre import ParametreResponse, ParametreUpdate
from app.controllers.parametre_controller import ParametreController

router = APIRouter(prefix="/parametres", tags=["Parametres"])


@router.get("/", response_model=ParametreResponse)
def get_parametres(db: Session = Depends(get_db)):
    return ParametreController.get(db)


@router.put("/", response_model=ParametreResponse)
def update_parametres(data: ParametreUpdate, db: Session = Depends(get_db)):
    return ParametreController.update(data, db)