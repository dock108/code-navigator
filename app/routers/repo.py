from fastapi import APIRouter, Response, Query
from github.GithubException import GithubException
from app.services.github_service import get_repo_file_structure, get_file_content, get_repo_metadata
from app.services.yaml_context_service import generate_yaml_context
from app.services.ai_service import gpt4_summarize
from app.utils.error_handling import raise_error

router = APIRouter()

@router.get("/repo/{owner}/{repo}/files")
def get_repo_files(owner: str, repo: str):
    try:
        return get_repo_file_structure(owner, repo)
    except GithubException as e:
        if e.status == 404:
            raise_error(404, "Repository not found.", "NotFound")
        elif e.status == 401:
            raise_error(401, "Invalid or missing GitHub token.", "ExternalAPIError")
        else:
            raise_error(502, "GitHub API error.", "ExternalAPIError")
    except Exception as e:
        raise_error(500, f"Internal server error: {str(e)}", "InternalError")

@router.get("/repo/{owner}/{repo}/file-content")
def fetch_file_content(owner: str, repo: str, path: str = Query(..., description="Path to the file within the repo")):
    try:
        content = get_file_content(owner, repo, path)
        return Response(content, media_type="text/plain")
    except GithubException as e:
        if e.status == 404:
            raise_error(404, "File not found.", "NotFound")
        elif e.status == 401:
            raise_error(401, "Invalid or missing GitHub token.", "ExternalAPIError")
        else:
            raise_error(502, "GitHub API error.", "ExternalAPIError")
    except Exception as e:
        raise_error(500, f"Internal server error: {str(e)}", "InternalError")

@router.get("/repo/{owner}/{repo}/metadata")
def fetch_repo_metadata(owner: str, repo: str):
    try:
        return get_repo_metadata(owner, repo)
    except GithubException as e:
        if e.status == 404:
            raise_error(404, "Repository not found.", "NotFound")
        elif e.status == 401:
            raise_error(401, "Invalid or missing GitHub token.", "ExternalAPIError")
        else:
            raise_error(502, "GitHub API error.", "ExternalAPIError")
    except Exception as e:
        raise_error(500, f"Internal server error: {str(e)}", "InternalError")

@router.get("/repo/{owner}/{repo}/yaml-context")
async def get_yaml_context(owner: str, repo: str):
    try:
        yaml_str = await generate_yaml_context(owner, repo)
        return Response(content=yaml_str, media_type="text/yaml")
    except GithubException as e:
        if e.status == 404:
            raise_error(404, "Repository not found.", "NotFound")
        elif e.status == 401:
            raise_error(401, "Invalid or missing GitHub token.", "ExternalAPIError")
        else:
            raise_error(502, "GitHub API error.", "ExternalAPIError")
    except Exception as e:
        raise_error(500, f"YAML context generation failed: {str(e)}", "InternalError")

@router.get("/repo/{owner}/{repo}/vibe")
async def get_repo_vibe(owner: str, repo: str):
    """Generate a friendly, detailed Markdown summary (VIBE.md) for non-technical users."""
    try:
        metadata = get_repo_metadata(owner, repo)
        structure = get_repo_file_structure(owner, repo)

        # Flatten structure for prompt
        def flatten(node, prefix=""):
            lines = []
            if isinstance(node, list):
                for n in node:
                    lines += flatten(n, prefix)
            elif node["type"] == "directory":
                lines.append(f"{prefix}{node['path']}/")
                if node.get("contents"):
                    lines += flatten(node["contents"], prefix + "  ")
            else:
                lines.append(f"{prefix}{node['path']}")
            return lines
        structure_lines = flatten(structure["structure"]) if "structure" in structure else []
        structure_md = '\n'.join([f'- {line}' for line in structure_lines])
        prompt = f"""
Generate a friendly, detailed Markdown summary (\"VIBE.md\") clearly explaining the repository \"{owner}/{repo}\" to non-technical users. Include:

- High-level purpose
- Directory/file layout explained simply
- Key modules/functions and their roles
- General logic and interactions described clearly

Repository metadata:
Name: {metadata.get('repo_name')}
Owner: {metadata.get('owner')}
Description: {metadata.get('description')}
Language: {metadata.get('language')}
Stars: {metadata.get('stars')}
Forks: {metadata.get('forks')}
Open Issues: {metadata.get('open_issues')}
URL: {metadata.get('url')}

File structure:
{structure_md}

Write in clear, non-technical language. Format the output as Markdown, with headings and lists for readability.
"""
        summary = await gpt4_summarize(prompt)
        return Response(content=summary, media_type="text/markdown")
    except GithubException as e:
        if e.status == 404:
            raise_error(404, "Repository not found.", "NotFound")
        elif e.status == 401:
            raise_error(401, "Invalid or missing GitHub token.", "ExternalAPIError")
        else:
            raise_error(502, "GitHub API error.", "ExternalAPIError")
    except Exception as e:
        raise_error(500, f"VIBE.md generation failed: {str(e)}", "InternalError") 