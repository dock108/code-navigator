import os
from github import Github, GithubException
from typing import List, Dict, Any

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

github_client = Github(GITHUB_TOKEN) if GITHUB_TOKEN else Github()

def get_repo_file_structure(owner: str, repo: str) -> Dict[str, Any]:
    try:
        repository = github_client.get_repo(f"{owner}/{repo}")
        contents = repository.get_contents("")
        structure = _build_structure(contents, repository)
        return {
            "repo": f"{owner}/{repo}",
            "structure": structure
        }
    except GithubException as e:
        raise e

def _build_structure(contents, repository) -> List[Dict[str, Any]]:
    result = []
    stack = [(contents, "")] if isinstance(contents, list) else [([contents], "")]
    while stack:
        current_contents, parent_path = stack.pop()
        for content_file in current_contents:
            if content_file.type == "dir":
                dir_contents = repository.get_contents(content_file.path)
                result.append({
                    "path": content_file.path + "/",
                    "type": "directory",
                    "contents": _build_structure(dir_contents, repository)
                })
            else:
                result.append({
                    "path": content_file.path,
                    "type": "file"
                })
    return result 