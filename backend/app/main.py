from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import Base, engine
from app.models import aide, utilisateur, dossier, message, document, historique
from app.api.routes import aides, auth, dossiers, chatbot, messages_routes, documents_routes
from app.api.routes import ia
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
    "http://127.0.0.1:5173",
    "http://192.168.1.180:5173",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(aides.router)
app.include_router(dossiers.router)
app.include_router(chatbot.router)
app.include_router(messages_routes.router)
app.include_router(documents_routes.router)
app.include_router(ia.router)

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