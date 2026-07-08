from fastapi import APIRouter
from app.views.ia import (
    SuggererReponseRequest, ReponsesSuggereesResponse,
    AnalyserDossierRequest, AnalyseDossierResponse,
    GenererAideRequest, AideGenereeResponse,
)
from app.controllers.ia_controller import IAController

router = APIRouter(prefix="/ia", tags=["IA"])


@router.post("/suggerer-reponse", response_model=ReponsesSuggereesResponse)
async def suggerer_reponse(req: SuggererReponseRequest):
    return await IAController.suggerer_reponse(req)


@router.post("/analyser-dossier", response_model=AnalyseDossierResponse)
async def analyser_dossier(req: AnalyserDossierRequest):
    return await IAController.analyser_dossier(req)


@router.post("/generer-description-aide", response_model=AideGenereeResponse)
async def generer_description_aide(req: GenererAideRequest):
    return await IAController.generer_description_aide(req)
