from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from app.core.database import Base

class StatutDossier(str, enum.Enum):
    brouillon = "brouillon"
    depose = "depose"
    en_instruction = "en_instruction"
    accepte = "accepte"
    refuse = "refuse"
    complement_demande = "complement_demande"

class Dossier(Base):
    __tablename__ = "dossiers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    numero = Column(String(20), unique=True, nullable=False)
    statut = Column(Enum(StatutDossier), default=StatutDossier.brouillon)
    commentaire = Column(Text)
    demandeur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"))
    aide_id = Column(UUID(as_uuid=True), ForeignKey("aides.id"))
    instructeur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)
    cree_le = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    mis_a_jour_le = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    demandeur = relationship("Utilisateur", foreign_keys=[demandeur_id])
    aide = relationship("Aide")