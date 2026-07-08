from sqlalchemy.orm import Session
from app.models.parametre import Parametre


class ParametreController:

    @staticmethod
    def get(db: Session):
        return db.query(Parametre).first()

    @staticmethod
    def update(data, db: Session):
        param = db.query(Parametre).first()
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(param, key, value)
        db.commit()
        db.refresh(param)
        return param