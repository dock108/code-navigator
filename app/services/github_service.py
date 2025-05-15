import os
from github import Github, GithubException
from typing import List, Dict, Any
import ast

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
print("GITHUB_TOKEN loaded:", bool(GITHUB_TOKEN))

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

def get_file_content(owner: str, repo: str, path: str) -> str:
    try:
        repository = github_client.get_repo(f"{owner}/{repo}")
        file_content = repository.get_contents(path)
        if file_content.type != "file":
            raise GithubException(404, "Not a file", None)
        return file_content.decoded_content.decode("utf-8", errors="replace")
    except GithubException as e:
        raise e

def get_repo_metadata(owner: str, repo: str) -> dict:
    try:
        repository = github_client.get_repo(f"{owner}/{repo}")
        return {
            "repo_name": repository.name,
            "owner": repository.owner.login,
            "description": repository.description or "",
            "language": repository.language,
            "stars": repository.stargazers_count,
            "forks": repository.forks_count,
            "open_issues": repository.open_issues_count,
            "url": repository.html_url
        }
    except GithubException as e:
        raise e

def get_python_definitions(owner: str, repo: str, path: str):
    try:
        repository = github_client.get_repo(f"{owner}/{repo}")
        file_content = repository.get_contents(path)
        if file_content.type != "file" or not path.endswith(".py"):
            raise GithubException(400, "Not a Python file", None)
        source = file_content.decoded_content.decode("utf-8", errors="replace")
        try:
            tree = ast.parse(source)
        except Exception as e:
            raise GithubException(400, f"Parse error: {str(e)}", None)
        definitions = []
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                definitions.append({
                    "name": node.name,
                    "type": "function",
                    "line": node.lineno
                })
            elif isinstance(node, ast.ClassDef):
                definitions.append({
                    "name": node.name,
                    "type": "class",
                    "line": node.lineno
                })
        return {"definitions": definitions}
    except GithubException as e:
        raise e

def find_python_references(owner: str, repo: str, path: str, name: str):
    try:
        repository = github_client.get_repo(f"{owner}/{repo}")
        file_content = repository.get_contents(path)
        if file_content.type != "file" or not path.endswith(".py"):
            raise GithubException(400, "Not a Python file", None)
        source = file_content.decoded_content.decode("utf-8", errors="replace")
        references = []
        for idx, line in enumerate(source.splitlines(), 1):
            if name in line:
                references.append({
                    "line": idx,
                    "snippet": line.strip()
                })
        return {"references": references}
    except GithubException as e:
        raise e

def get_repo_structure_visualization(owner: str, repo: str):
    try:
        repository = github_client.get_repo(f"{owner}/{repo}")
        contents = repository.get_contents("")
        structure = _build_visualization_structure(contents, repository)
        return {
            "repo": f"{owner}/{repo}",
            "structure": structure
        }
    except GithubException as e:
        raise e

def _build_visualization_structure(contents, repository):
    result = []
    for content_file in contents if isinstance(contents, list) else [contents]:
        if content_file.type == "dir":
            dir_contents = repository.get_contents(content_file.path)
            result.append({
                "name": content_file.name,
                "type": "directory",
                "children": _build_visualization_structure(dir_contents, repository)
            })
        else:
            result.append({
                "name": content_file.name,
                "type": "file"
            })
    return result 