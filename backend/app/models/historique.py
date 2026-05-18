from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.core.database import Base

class Historique(Base):
    __tablename__ = "historiques"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action = Column(String(100), nullable=False)
    details = Column(Text)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id"), nullable=False)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    cree_le = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dossier = relationship("Dossier", foreign_keys=[dossier_id])
    utilisateur = relationship("Utilisateur", foreign_keys=[utilisateur_id])