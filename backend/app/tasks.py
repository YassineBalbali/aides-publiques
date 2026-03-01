from app.celery_app import celery_app
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

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

    message = MessageSchema(
        subject=f"Mise à jour de votre dossier {numero_dossier}",
        recipients=[email],
        body=f"""
        <h2>Bonjour,</h2>
        <p>Votre dossier <strong>{numero_dossier}</strong> a été mis à jour.</p>
        <p>Nouveau statut : <strong>{label}</strong></p>
        <br>
        <p>Connectez-vous sur <a href="http://localhost:5173">AidesPubliques</a> pour plus de détails.</p>
        <br>
        <p>Cordialement,<br>L'équipe AidesPubliques</p>
        """,
        subtype="html"
    )

    async def send():
        fm = FastMail(conf)
        await fm.send_message(message)

    asyncio.run(send())
    print(f"✅ Email envoyé à {email} — dossier {numero_dossier} — statut : {label}")
    return {"status": "email_envoye", "destinataire": email}