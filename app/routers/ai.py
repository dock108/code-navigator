from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_service import gpt4_summarize

router = APIRouter()

class SummarizationRequest(BaseModel):
    prompt: str

@router.post("/ai/test-summarization")
async def test_summarization(req: SummarizationRequest):
    try:
        summary = await gpt4_summarize(req.prompt)
        return {"summary": summary}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e)) 