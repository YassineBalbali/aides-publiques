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

@celery_app.task(name="envoyer_email_statut", bind=True, max_retries=3)
def envoyer_email_statut(self, email: str, numero_dossier: str, nouveau_statut: str):
    try:
        statut_labels = {
            'accepte': 'Accepté',
            'refuse': 'Refusé',
            'en_instruction': 'En instruction',
            'complement_demande': 'Complément demandé',
            'depose': 'Déposé',
        }
        couleurs = {
            'accepte': '#16a34a',
            'refuse': '#dc2626',
            'en_instruction': '#2563eb',
            'complement_demande': '#d97706',
            'depose': '#1a2b5e',
        }
        label = statut_labels.get(nouveau_statut, nouveau_statut)
        couleur = couleurs.get(nouveau_statut, '#1a2b5e')

        message = MessageSchema(
            subject=f"Mise à jour de votre dossier {numero_dossier}",
            recipients=[email],
            body=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1a2b5e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">Aides Publiques</h2>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                <h3>Bonjour,</h3>
                <p>Votre dossier <strong>{numero_dossier}</strong> a été mis à jour.</p>
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p>Nouveau statut : <strong style="color: {couleur};">{label}</strong></p>
                </div>
                <p>Connectez-vous sur <a href="{os.getenv('FRONTEND_URL', 'http://localhost:5173')}">AidesPubliques</a> pour plus de détails.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #888; font-size: 12px; text-align: center;">© 2026 Plateforme Aides Publiques</p>
              </div>
            </div>
            """,
            subtype="html"
        )

        async def send():
            fm = FastMail(conf)
            await fm.send_message(message)

        asyncio.run(send())
        return {"status": "email_envoye", "destinataire": email}

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@celery_app.task(name="send_reset_password_email", bind=True, max_retries=3)
def send_reset_password_email(self, email: str, prenom: str, token: str):
    try:
        lien = f"http://localhost:5173/reset-password?token={token}"

        message = MessageSchema(
            subject="Réinitialisation de votre mot de passe",
            recipients=[email],
            body=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1a2b5e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">Aides Publiques</h2>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                <h3>Bonjour {prenom or ''},</h3>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{lien}" style="background-color: #1a2b5e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Réinitialiser mon mot de passe
                  </a>
                </div>
                <p style="color: #888; font-size: 13px;">Ce lien est valable <strong>1 heure</strong>.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #888; font-size: 12px; text-align: center;">© 2026 Plateforme Aides Publiques</p>
              </div>
            </div>
            """,
            subtype="html"
        )

        async def send():
            fm = FastMail(conf)
            await fm.send_message(message)

        asyncio.run(send())
        return {"status": "email_envoye", "destinataire": email}

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@celery_app.task(name="send_confirmation_dossier", bind=True, max_retries=3)
def send_confirmation_dossier(self, email: str, prenom: str, numero_dossier: str, titre_aide: str):
    try:
        message = MessageSchema(
            subject=f"Confirmation de votre dossier {numero_dossier}",
            recipients=[email],
            body=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1a2b5e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">Aides Publiques</h2>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                <h3>Bonjour {prenom or ''},</h3>
                <p>Votre dossier a bien été déposé avec succès !</p>
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p><strong>Numéro de dossier :</strong> {numero_dossier}</p>
                  <p><strong>Aide demandée :</strong> {titre_aide}</p>
                  <p><strong>Statut :</strong> Déposé — en attente d'instruction</p>
                </div>
                <p>Vous pouvez suivre l'avancement de votre dossier depuis votre espace personnel.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #888; font-size: 12px; text-align: center;">© 2026 Plateforme Aides Publiques</p>
              </div>
            </div>
            """,
            subtype="html"
        )

        async def send():
            fm = FastMail(conf)
            await fm.send_message(message)

        asyncio.run(send())
        return {"status": "email_envoye", "destinataire": email}

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)