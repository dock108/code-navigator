# Changelog

## [Unreleased]
- Initial project scaffold created using FastAPI.
- Project structure established with main.py, config.py, and empty directories for routers, services, utils, schemas, and tests.
- Added root endpoint (/) returning {"message": "Hello, World!"}.
- requirements.txt and Dockerfile added for dependencies and containerization.
- Added GitHub API integration using PyGithub.
- New endpoint /repo/{owner}/{repo}/files returns nested JSON of repository file structure.
- GitHub token authentication via GITHUB_TOKEN environment variable.
- Error handling for repository not found and authentication issues.
- Added endpoint /repo/{owner}/{repo}/file-content to fetch and return raw file content from GitHub repositories.
- Added endpoint /repo/{owner}/{repo}/metadata to return basic repository metadata (name, owner, description, language, stars, forks, open issues, url).
- Added POST /repo/{owner}/{repo}/definitions endpoint to return Python function/class definitions and line numbers using AST.
- Added POST /repo/{owner}/{repo}/references endpoint to return all references (usages) of a given function/class in a Python file, with line numbers and code snippets.
- Added GET /repo/{owner}/{repo}/structure-visualization endpoint to return repo structure in a nested format for visualization.
- Added POST /ai/summarize-file endpoint to summarize the content of a specified repository file using GPT-4, with error handling.
- Added GET /repo/{owner}/{repo}/yaml-context endpoint to export structured YAML context for AI, including repo layout, modules, entry points, and metadata.
- Added /repo/{owner}/{repo}/vibe endpoint: generates a friendly, detailed Markdown summary (VIBE.md) of the repository using GPT-4, designed for non-technical users ("vibecoders"). 