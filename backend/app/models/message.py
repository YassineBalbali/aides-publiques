from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.core.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contenu = Column(Text, nullable=False)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id"), nullable=False)
    expediteur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    lu = Column(Boolean, default=False)
    cree_le = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dossier = relationship("Dossier", foreign_keys=[dossier_id])
    expediteur = relationship("Utilisateur", foreign_keys=[expediteur_id])