from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom_fichier = Column(String(255), nullable=False)
    chemin = Column(String(500), nullable=False)
    type_fichier = Column(String(50))
    taille = Column(Integer)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id"), nullable=False)
    uploade_par = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    cree_le = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dossier = relationship("Dossier", foreign_keys=[dossier_id])
    uploade_par_user = relationship("Utilisateur", foreign_keys=[uploade_par])