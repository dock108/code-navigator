from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_service import gpt4_summarize, summarize_file
from app.utils.error_handling import raise_error

router = APIRouter()

class SummarizationRequest(BaseModel):
    prompt: str

class FileSummarizationRequest(BaseModel):
    owner: str
    repo: str
    path: str

@router.post("/ai/test-summarization")
async def test_summarization(req: SummarizationRequest):
    try:
        summary = await gpt4_summarize(req.prompt)
        return {"summary": summary}
    except RuntimeError as e:
        raise_error(502, f"AI summarization failed: {str(e)}", "ExternalAPIError")
    except Exception as e:
        raise_error(500, f"Internal server error: {str(e)}", "InternalError")

@router.post("/ai/summarize-file")
async def summarize_file_endpoint(req: FileSummarizationRequest):
    try:
        summary = await summarize_file(req.owner, req.repo, req.path)
        return {"summary": summary}
    except RuntimeError as e:
        raise_error(502, f"AI summarization failed: {str(e)}", "ExternalAPIError")
    except Exception as e:
        raise_error(500, f"Internal server error: {str(e)}", "InternalError") 