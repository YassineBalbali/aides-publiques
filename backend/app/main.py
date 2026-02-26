from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.models import aide, utilisateur, dossier
from app.api.routes import aides, auth, dossiers

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Plateforme Aides Publiques",
    description="API de gestion des aides publiques",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(aides.router)
app.include_router(dossiers.router)

@app.get("/")
def accueil():
    return {"message": "Bienvenue sur la plateforme des aides publiques !"}

@app.get("/health")
def health_check():
    return {"status": "ok"}