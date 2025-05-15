from fastapi import APIRouter, HTTPException, Response, Query
from github.GithubException import GithubException
from app.services.github_service import get_repo_file_structure, get_file_content, get_repo_metadata, get_python_definitions, find_python_references, get_repo_structure_visualization

from pydantic import BaseModel

router = APIRouter()

class DefinitionRequest(BaseModel):
    path: str

class ReferenceRequest(BaseModel):
    path: str
    name: str

@router.get("/repo/{owner}/{repo}/files")
def get_repo_files(owner: str, repo: str):
    try:
        return get_repo_file_structure(owner, repo)
    except GithubException as e:
        if e.status == 404:
            raise HTTPException(status_code=404, detail="Repository not found.")
        elif e.status == 401:
            raise HTTPException(status_code=401, detail="Invalid or missing GitHub token.")
        else:
            raise HTTPException(status_code=500, detail="GitHub API error.")

@router.get("/repo/{owner}/{repo}/file-content")
def fetch_file_content(owner: str, repo: str, path: str = Query(..., description="Path to the file within the repo")):
    try:
        content = get_file_content(owner, repo, path)
        return Response(content, media_type="text/plain")
    except GithubException as e:
        if e.status == 404:
            raise HTTPException(status_code=404, detail="File not found.")
        elif e.status == 401:
            raise HTTPException(status_code=401, detail="Invalid or missing GitHub token.")
        else:
            raise HTTPException(status_code=500, detail="GitHub API error.")

@router.get("/repo/{owner}/{repo}/metadata")
def fetch_repo_metadata(owner: str, repo: str):
    try:
        return get_repo_metadata(owner, repo)
    except GithubException as e:
        if e.status == 404:
            raise HTTPException(status_code=404, detail="Repository not found.")
        elif e.status == 401:
            raise HTTPException(status_code=401, detail="Invalid or missing GitHub token.")
        else:
            raise HTTPException(status_code=500, detail="GitHub API error.")

@router.post("/repo/{owner}/{repo}/definitions")
def get_definitions(owner: str, repo: str, req: DefinitionRequest):
    try:
        return get_python_definitions(owner, repo, req.path)
    except GithubException as e:
        if e.status == 404:
            raise HTTPException(status_code=404, detail="File not found.")
        elif e.status == 400:
            raise HTTPException(status_code=400, detail=str(e.data) if e.data else "Invalid file or parse error.")
        elif e.status == 401:
            raise HTTPException(status_code=401, detail="Invalid or missing GitHub token.")
        else:
            raise HTTPException(status_code=500, detail="GitHub API error.")

@router.post("/repo/{owner}/{repo}/references")
def get_references(owner: str, repo: str, req: ReferenceRequest):
    try:
        return find_python_references(owner, repo, req.path, req.name)
    except GithubException as e:
        if e.status == 404:
            raise HTTPException(status_code=404, detail="File not found.")
        elif e.status == 400:
            raise HTTPException(status_code=400, detail=str(e.data) if e.data else "Invalid file or parse error.")
        elif e.status == 401:
            raise HTTPException(status_code=401, detail="Invalid or missing GitHub token.")
        else:
            raise HTTPException(status_code=500, detail="GitHub API error.")

@router.get("/repo/{owner}/{repo}/structure-visualization")
def get_structure_visualization(owner: str, repo: str):
    try:
        return get_repo_structure_visualization(owner, repo)
    except GithubException as e:
        if e.status == 404:
            raise HTTPException(status_code=404, detail="Repository not found.")
        elif e.status == 401:
            raise HTTPException(status_code=401, detail="Invalid or missing GitHub token.")
        else:
            raise HTTPException(status_code=500, detail="GitHub API error.") 