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