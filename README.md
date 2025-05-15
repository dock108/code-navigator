# Code Navigator Backend

## Introduction

The Code Navigator backend is a FastAPI service that powers the Code Navigator app. It provides endpoints for summarizing GitHub repositories, fetching file content, exporting YAML context, and generating AI-powered summaries. The backend integrates with the GitHub API and OpenAI GPT-4 to deliver clear, user-friendly insights into any public GitHub repository.

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/code-navigator.git
cd code-navigator/app
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Required Environment Variables

Create a `.env` file or export the following variables in your shell:

- `GITHUB_TOKEN`: Your GitHub personal access token (for higher rate limits and private repo access)
- `OPENAI_API_KEY`: Your OpenAI API key (for GPT-4 summaries)

Example:
```bash
export GITHUB_TOKEN=your_github_token_here
export OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the FastAPI Backend Locally

```bash
uvicorn app.main:app --reload
```

The server will be available at [http://localhost:8000/](http://localhost:8000/).

---

## Environment Variables

| Variable           | Description                                 |
|--------------------|---------------------------------------------|
| `GITHUB_TOKEN`     | GitHub API key (required for higher rate limits and private repos) |
| `OPENAI_API_KEY`   | OpenAI API key for GPT-4 (required for AI summaries) |

---

## API Endpoints

### GET /repo/{owner}/{repo}/metadata
- **Description:** Returns basic metadata about a GitHub repository.
- **Example Request:**
  ```bash
  curl http://localhost:8000/repo/octocat/Hello-World/metadata
  ```
- **Response Example:**
  ```json
  {
    "repo_name": "Hello-World",
    "owner": "octocat",
    "description": "This your first repo!",
    "language": "Python",
    "stars": 42,
    "forks": 10,
    "open_issues": 2,
    "url": "https://github.com/octocat/Hello-World"
  }
  ```

---

### GET /repo/{owner}/{repo}/file-content?path={file_path}
- **Description:** Returns the raw content of a file in plain text.
- **Query Parameter:** `path` (required) — Path to the file within the repo
- **Example Request:**
  ```bash
  curl "http://localhost:8000/repo/octocat/Hello-World/file-content?path=README.md"
  ```
- **Response:**
  - Content-Type: text/plain
  - Body: Raw file content

---

### GET /repo/{owner}/{repo}/yaml-context
- **Description:** Returns a structured YAML summary of the repository layout, modules, entry points, and metadata for AI ingestion.
- **Example Request:**
  ```bash
  curl http://localhost:8000/repo/octocat/Hello-World/yaml-context
  ```
- **Response:**
  - Content-Type: text/yaml
  - Body: YAML summary

---

### GET /repo/{owner}/{repo}/vibe
- **Description:** Generates a friendly, detailed Markdown summary ("VIBE.md") of the repository using GPT-4, designed for non-technical users.
- **Example Request:**
  ```bash
  curl http://localhost:8000/repo/octocat/Hello-World/vibe
  ```
- **Response:**
  - Content-Type: text/markdown
  - Body: Markdown summary

---

### POST /ai/summarize-file
- **Description:** Uses GPT-4 to summarize the functionality and purpose of a specific file in the repository.
- **Request Body:**
  ```json
  {
    "owner": "octocat",
    "repo": "Hello-World",
    "path": "main.py"
  }
  ```
- **Example Request:**
  ```bash
  curl -X POST http://localhost:8000/ai/summarize-file \
    -H "Content-Type: application/json" \
    -d '{"owner": "octocat", "repo": "Hello-World", "path": "main.py"}'
  ```
- **Response Example:**
  ```json
  {
    "summary": "This file defines the main FastAPI application entry point."
  }
  ```

---

## Standardized Error Handling

All backend API errors use a consistent, structured JSON format:

```json
{
  "error": {
    "message": "Clear, user-friendly description of error.",
    "type": "ErrorType"
  }
}
```

- `message`: A clear, user-friendly description of the error.
- `type`: The category of error. Possible values include:
  - `NotFound`: Resource not found (404)
  - `BadRequest`: Invalid parameters or request (400)
  - `ExternalAPIError`: Issues with GitHub, OpenAI, or other external APIs (502)
  - `InternalError`: Internal server errors (500)
  - `ValidationError`: Input validation errors (400)

All endpoints return appropriate HTTP status codes and this error format for all error cases.

---

## Tech Stack
- **Python 3.9+**
- **FastAPI**
- **PyGithub** (GitHub API integration)
- **OpenAI** (GPT-4 summaries)
- **Uvicorn** (ASGI server)

---

## Health & Status
- The root endpoint `/` returns `{ "message": "Hello, World!" }` if the backend is running.

---

## License
MIT 