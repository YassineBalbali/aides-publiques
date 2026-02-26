from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.core.database import Base

class RoleUtilisateur(str, enum.Enum):
    demandeur = "demandeur"
    instructeur = "instructeur"
    admin = "admin"

class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(200), unique=True, nullable=False, index=True)
    mot_de_passe = Column(String(300), nullable=False)
    nom = Column(String(100))
    prenom = Column(String(100))
    role = Column(Enum(RoleUtilisateur), default=RoleUtilisateur.demandeur)
    est_actif = Column(Boolean, default=True)
    cree_le = Column(DateTime, default=datetime.utcnow)