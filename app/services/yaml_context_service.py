import yaml
from app.services.github_service import get_repo_metadata, get_repo_file_structure
from app.services.ai_service import gpt4_summarize

async def generate_yaml_context(owner: str, repo: str) -> str:
    # Fetch repo metadata
    meta = get_repo_metadata(owner, repo)
    # Fetch file structure
    structure = get_repo_file_structure(owner, repo)["structure"]
    # Compose modules and important files (simple logic for demo)
    modules = []
    entry_points = []
    key_concepts = []
    for node in structure:
        if node["type"] == "directory":
            mod = {
                "path": node["path"],
                "description": f"Module or directory at {node['path']}",
                "important_files": []
            }
            for child in node.get("contents", []):
                if child["type"] == "file":
                    mod["important_files"].append({
                        "file": child["path"].split("/")[-1],
                        "purpose": "Key file in module."
                    })
            modules.append(mod)
        elif node["type"] == "file":
            entry_points.append(node["path"])
    # Use AI to generate high-level overview (fallback to static if fails)
    try:
        overview = await gpt4_summarize(f"Provide a high-level overview of the repository '{meta['repo_name']}' and its purpose.")
    except Exception:
        overview = f"This repository contains code for {meta['repo_name']} in {meta['language']}."
    # Example key concepts (could be improved with AI)
    key_concepts = [meta["language"] or "Unknown"]
    # Compose YAML dict
    yaml_dict = {
        "repo_name": meta["repo_name"],
        "language": meta["language"],
        "modules": modules,
        "entry_points": entry_points,
        "key_concepts": key_concepts,
        "high_level_overview": overview,
    }
    return yaml.dump(yaml_dict, sort_keys=False, allow_unicode=True) 