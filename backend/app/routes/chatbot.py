from fastapi import APIRouter
from app.controllers.chatbot_controller import ChatbotController

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/message")
def chatbot_message(data: dict):
    return ChatbotController.repondre(data)
