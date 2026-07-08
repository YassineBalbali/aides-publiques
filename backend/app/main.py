from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import Base, engine
from app.models import aide, utilisateur, dossier, message, document, historique, notification, parametre
from app.routes import auth, aides, dossiers, documents, messages, ia, chatbot, notifications, parametres
import os
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Plateforme Aides Publiques",
    description="API de gestion des aides publiques",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(aides.router)
app.include_router(dossiers.router)
app.include_router(chatbot.router)
app.include_router(messages.router)
app.include_router(documents.router)
app.include_router(ia.router)
app.include_router(notifications.router)
app.include_router(parametres.router)

os.makedirs("photos", exist_ok=True)
os.makedirs("documents", exist_ok=True)
app.mount("/photos", StaticFiles(directory="photos"), name="photos")
app.mount("/documents", StaticFiles(directory="documents"), name="documents")

@app.get("/")
def accueil():
    return {"message": "Bienvenue sur la plateforme des aides publiques !"}

@app.get("/health")
def health_check():
    return {"status": "ok"}