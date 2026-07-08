from app.core.database import SessionLocal
from app.models import aide, document, dossier, historique, message, notification, utilisateur
from app.core.security import hash_password
from app.models.utilisateur import Utilisateur, RoleUtilisateur

db = SessionLocal()

admin = Utilisateur(
    email="belbeliyassine2004@gmail.com",
    mot_de_passe=hash_password("admin123"),
    nom="Belbeli",
    prenom="Yassine",
    role=RoleUtilisateur.admin,
    est_actif=True
)

instructeur = Utilisateur(
    email="belbeliyassine12345@gmail.com",
    mot_de_passe=hash_password("instructeur123"),
    nom="Belbeli",
    prenom="Yassine",
    role=RoleUtilisateur.instructeur,
    est_actif=True
)

db.add(admin)
db.add(instructeur)
db.commit()
db.close()

print("Comptes créés avec succès !")
print("Admin : belbeliyassine2004@gmail.com / admin123")
print("Instructeur : belbeliyassine12345@gmail.com / instructeur123")