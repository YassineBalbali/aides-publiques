from app.celery_app import celery_app

@celery_app.task
def envoyer_email_statut(email: str, numero_dossier: str, nouveau_statut: str):
    statut_labels = {
        'accepte': 'Accepté ✅',
        'refuse': 'Refusé ❌',
        'en_instruction': 'En instruction 📋',
        'complement_demande': 'Complément demandé 📎',
        'depose': 'Déposé 📤',
    }
    label = statut_labels.get(nouveau_statut, nouveau_statut)
    
    print(f"""
    ==============================
    📧 EMAIL ENVOYÉ
    ==============================
    À : {email}
    Objet : Mise à jour de votre dossier {numero_dossier}
    
    Bonjour,
    
    Votre dossier {numero_dossier} a été mis à jour.
    Nouveau statut : {label}
    
    Connectez-vous sur AidesPubliques pour plus de détails.
    ==============================
    """)
    
    return {"status": "email_envoye", "destinataire": email}