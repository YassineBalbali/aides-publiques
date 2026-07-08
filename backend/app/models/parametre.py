from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base


class Parametre(Base):
    __tablename__ = "parametres"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom_plateforme = Column(String(200), default="Aides Publiques")
    logo_url = Column(String(500), nullable=True)
    mentions_legales = Column(Text, nullable=True)