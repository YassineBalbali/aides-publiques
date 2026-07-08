from app.core.database import SessionLocal
from app.models.aide import Aide
import csv
import io


def import_aides_csv(contenu_csv: str):
    """
    Importe des aides depuis un CSV de manière synchrone.
    """
    db = SessionLocal()
    succes = 0
    erreurs = []

    try:
        reader = csv.DictReader(io.StringIO(contenu_csv))

        for i, ligne in enumerate(reader, start=2):
            try:
                aide = Aide(
                    titre=ligne.get("titre", "").strip(),
                    description=ligne.get("description", "").strip() or None,
                    type_aide=ligne.get("type_aide", "subvention").strip(),
                    montant_min=float(ligne["montant_min"]) if ligne.get("montant_min") else None,
                    montant_max=float(ligne["montant_max"]) if ligne.get("montant_max") else None,
                    organisme_financeur=ligne.get("organisme_financeur", "").strip() or None,
                    statut=ligne.get("statut", "active").strip(),
                    beneficiaires=ligne.get("beneficiaires", "").strip() or None,
                    documents_requis=ligne.get("documents_requis", "").strip() or None,
                    criteres_eligibilite=ligne.get("criteres_eligibilite", "").strip() or None,
                    lien_externe=ligne.get("lien_externe", "").strip() or None,
                )
                db.add(aide)
                succes += 1
            except Exception as e:
                erreurs.append(f"Ligne {i} : {str(e)}")

        db.commit()

    except Exception as e:
        db.rollback()
        erreurs.append(f"Erreur globale : {str(e)}")
    finally:
        db.close()

    return {
        "succes": succes,
        "erreurs": erreurs,
        "message": f"{succes} aide(s) importée(s) avec succès"
    }