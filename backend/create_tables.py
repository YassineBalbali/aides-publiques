from app.core.database import Base, engine
from app.models import aide, document, dossier, historique, message, notification, utilisateur

Base.metadata.create_all(bind=engine)
print("Toutes les tables ont été créées avec succès !")