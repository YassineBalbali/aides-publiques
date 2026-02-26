from sqlalchemy import Column, String, Text, Numeric, Date, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.core.database import Base

class TypeAide(str, enum.Enum):
    subvention = "subvention"
    pret = "pret"
    exoneration = "exoneration"
    formation = "formation"

class StatutAide(str, enum.Enum):
    active = "active"
    a_venir = "a_venir"
    cloturee = "cloturee"
    suspendue = "suspendue"

class Aide(Base):
    __tablename__ = "aides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titre = Column(String(300), nullable=False)
    description = Column(Text)
    type_aide = Column(Enum(TypeAide))
    montant_min = Column(Numeric)
    montant_max = Column(Numeric)
    organisme_financeur = Column(String(200))
    statut = Column(Enum(StatutAide), default=StatutAide.active)
    cree_le = Column(DateTime, default=datetime.utcnow)
    