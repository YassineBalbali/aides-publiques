from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    type = Column(String, nullable=False)        # "affectation" | "message" | ...
    titre = Column(String, nullable=False)
    contenu = Column(Text, nullable=True)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id"), nullable=True)
    numero_dossier = Column(String, nullable=True)
    lu = Column(Boolean, default=False)
    cree_le = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    utilisateur = relationship("Utilisateur", foreign_keys=[utilisateur_id])
    dossier = relationship("Dossier", foreign_keys=[dossier_id])
