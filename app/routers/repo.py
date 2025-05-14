from fastapi import APIRouter, HTTPException
from github.GithubException import GithubException
from app.services.github_service import get_repo_file_structure

router = APIRouter()

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