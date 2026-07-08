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

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# ============================================================
#   STYLE COMMUN (dark + indigo glassmorphism)
# ============================================================
EMAIL_HEADER = """
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f0f1a;">
              <div style="background: linear-gradient(135deg, #4338ca, #6366f1); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
                <h2 style="color: #ffffff; margin: 0; font-weight: 700; letter-spacing: 0.5px;">Aides Publiques</h2>
              </div>
              <div style="background: #15152b; padding: 30px; border-radius: 0 0 12px 12px; color: #e5e7eb;">
"""

EMAIL_FOOTER = """
                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0 16px 0;">
                <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">© 2026 Plateforme Aides Publiques</p>
              </div>
            </div>
"""


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
            'accepte': '#34d399',
            'refuse': '#f87171',
            'en_instruction': '#818cf8',
            'complement_demande': '#fbbf24',
            'depose': '#818cf8',
        }
        label = statut_labels.get(nouveau_statut, nouveau_statut)
        couleur = couleurs.get(nouveau_statut, '#818cf8')

        message = MessageSchema(
            subject=f"Mise à jour de votre dossier {numero_dossier}",
            recipients=[email],
            body=EMAIL_HEADER + f"""
                <h3 style="color: #ffffff; margin-top: 0;">Bonjour,</h3>
                <p>Votre dossier <strong style="color:#a5b4fc;">{numero_dossier}</strong> a été mis à jour.</p>
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0;">Nouveau statut : <strong style="color: {couleur};">{label}</strong></p>
                </div>
                <p style="color: #d1d5db;">Connectez-vous sur <a href="{FRONTEND_URL}" style="color:#a5b4fc; text-decoration: underline;">AidesPubliques</a> pour plus de détails.</p>
""" + EMAIL_FOOTER,
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
        lien = f"{FRONTEND_URL}/reset-password?token={token}"

        message = MessageSchema(
            subject="Réinitialisation de votre mot de passe",
            recipients=[email],
            body=EMAIL_HEADER + f"""
                <h3 style="color: #ffffff; margin-top: 0;">Bonjour {prenom or ''},</h3>
                <p style="color: #d1d5db;">Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{lien}" style="background: linear-gradient(135deg, #4338ca, #6366f1); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Réinitialiser mon mot de passe
                  </a>
                </div>
                <p style="color: #9ca3af; font-size: 13px;">Ce lien est valable <strong style="color:#d1d5db;">1 heure</strong>.</p>
""" + EMAIL_FOOTER,
            subtype="html"
        )

        async def send():
            fm = FastMail(conf)
            await fm.send_message(message)

        asyncio.run(send())
        return {"status": "email_envoye", "destinataire": email}

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@celery_app.task(name="envoyer_email_affectation", bind=True, max_retries=3)
def envoyer_email_affectation(self, email: str, prenom: str, numero_dossier: str, titre_aide: str, demandeur_nom: str):
    try:
        message = MessageSchema(
            subject=f"Nouveau dossier affecté : {numero_dossier}",
            recipients=[email],
            body=EMAIL_HEADER + f"""
                <h3 style="color: #ffffff; margin-top: 0;">Bonjour {prenom or ''},</h3>
                <p style="color: #d1d5db;">Un nouveau dossier vous a été affecté pour instruction.</p>
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 6px 0;"><strong style="color:#a5b4fc;">Numéro de dossier :</strong> {numero_dossier}</p>
                  <p style="margin: 6px 0;"><strong style="color:#a5b4fc;">Aide demandée :</strong> {titre_aide}</p>
                  <p style="margin: 6px 0;"><strong style="color:#a5b4fc;">Demandeur :</strong> {demandeur_nom}</p>
                  <p style="margin: 6px 0;"><strong style="color:#a5b4fc;">Statut :</strong> <span style="color: #818cf8;">En instruction</span></p>
                </div>
                <p style="color: #d1d5db;">Connectez-vous sur <a href="{FRONTEND_URL}" style="color:#a5b4fc; text-decoration: underline;">AidesPubliques</a> pour traiter ce dossier.</p>
""" + EMAIL_FOOTER,
            subtype="html"
        )

        async def send():
            fm = FastMail(conf)
            await fm.send_message(message)

        asyncio.run(send())
        return {"status": "email_envoye", "destinataire": email}

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@celery_app.task(name="envoyer_email_nouveau_message", bind=True, max_retries=3)
def envoyer_email_nouveau_message(self, email: str, prenom: str, numero_dossier: str, expediteur_nom: str, apercu_message: str):
    try:
        message = MessageSchema(
            subject=f"Nouveau message sur le dossier {numero_dossier}",
            recipients=[email],
            body=EMAIL_HEADER + f"""
                <h3 style="color: #ffffff; margin-top: 0;">Bonjour {prenom or ''},</h3>
                <p style="color: #d1d5db;"><strong style="color:#a5b4fc;">{expediteur_nom}</strong> vous a envoyé un message concernant le dossier <strong style="color:#a5b4fc;">{numero_dossier}</strong>.</p>
                <div style="background: rgba(255,255,255,0.05); border-left: 4px solid #6366f1; border-radius: 4px; padding: 15px 20px; margin: 20px 0; color: #d1d5db; font-style: italic;">
                  "{apercu_message}"
                </div>
                <p style="color: #d1d5db;">Connectez-vous sur <a href="{FRONTEND_URL}" style="color:#a5b4fc; text-decoration: underline;">AidesPubliques</a> pour répondre.</p>
""" + EMAIL_FOOTER,
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
            body=EMAIL_HEADER + f"""
                <h3 style="color: #ffffff; margin-top: 0;">Bonjour {prenom or ''},</h3>
                <p style="color: #d1d5db;">Votre dossier a bien été déposé avec succès !</p>
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 6px 0;"><strong style="color:#a5b4fc;">Numéro de dossier :</strong> {numero_dossier}</p>
                  <p style="margin: 6px 0;"><strong style="color:#a5b4fc;">Aide demandée :</strong> {titre_aide}</p>
                  <p style="margin: 6px 0;"><strong style="color:#a5b4fc;">Statut :</strong> <span style="color:#818cf8; font-weight:600;">Déposé — en attente d'instruction</span></p>
                </div>
                <p style="color: #d1d5db;">Vous pouvez suivre l'avancement de votre dossier depuis votre espace personnel.</p>
""" + EMAIL_FOOTER,
            subtype="html"
        )

        async def send():
            fm = FastMail(conf)
            await fm.send_message(message)

        asyncio.run(send())
        return {"status": "email_envoye", "destinataire": email}

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)