# Code Navigator Backend

This is the backend foundation for the Code Navigator web app, built with FastAPI.

## Project Structure

```
/app
├── main.py (FastAPI entry point)
├── routers (empty directory for now)
├── services (empty directory for now)
├── utils (empty directory for now)
├── schemas (empty directory for now)
├── tests (empty directory for now)
├── config.py (basic app configuration)
├── requirements.txt
└── Dockerfile (basic dockerization structure)
```

## Getting Started

### 1. Install dependencies

```bash
pip install -r app/requirements.txt
```

### 2. Run the server

```bash
uvicorn app.main:app --reload
```

The server will be accessible at [http://localhost:8000/](http://localhost:8000/).

### 3. Test the root endpoint

Navigate to [http://localhost:8000/](http://localhost:8000/) or run:

```bash
curl http://localhost:8000/
```

You should see:

```json
{"message": "Hello, World!"}
```

## Docker

To build and run the app in a container:

```bash
docker build -t code-navigator-backend ./app

docker run -p 8000:8000 code-navigator-backend
```

## GitHub API Integration

This project uses the [PyGithub](https://pygithub.readthedocs.io/) library to interact with the GitHub API.

- **Authentication:**
  - **For public repositories, a GitHub token is optional.**
  - If you do not set a token, the API will still work for public repositories, but you will be subject to much lower rate limits (60 requests/hour per IP).
  - Setting your GitHub personal access token in the environment variable `GITHUB_TOKEN` is recommended for higher rate limits (5,000 requests/hour) and reliability.
  - Example (Unix/macOS):
    ```bash
    export GITHUB_TOKEN=your_token_here
    ```

## API Endpoints

### Get Repository File Structure

- **Endpoint:** `/repo/{owner}/{repo}/files`
- **Method:** GET
- **Description:** Returns the complete file structure of a public GitHub repository as nested JSON (does not include file contents).
- **Example:**
  ```bash
  curl http://localhost:8000/repo/dock108/code-navigator/files
  ```
- **Response Example:**
  ```json
  {
    "repo": "dock108/code-navigator",
    "structure": [
      {
        "path": "app/",
        "type": "directory",
        "contents": [
          {"path": "main.py", "type": "file"},
          {"path": "routers/", "type": "directory", "contents": []}
        ]
      },
      {"path": "Dockerfile", "type": "file"}
    ]
  }
  ```

### Get File Content

- **Endpoint:** `/repo/{owner}/{repo}/file-content`
- **Method:** GET
- **Query Parameter:** `path` (required) — Path to the file within the repo
- **Description:** Returns the raw content of a file in plain text. Responds with 404 if the file is not found.
- **Example:**
  ```bash
  curl "http://localhost:8000/repo/dock108/code-navigator/file-content?path=app/main.py"
  ```
- **Response Example (Content-Type: text/plain):**
  ```
  from fastapi import FastAPI
  app = FastAPI()

  @app.get("/")
  def read_root():
      return {"message": "Hello, World!"}
  ```

### Get Repository Metadata

- **Endpoint:** `/repo/{owner}/{repo}/metadata`
- **Method:** GET
- **Description:** Returns basic metadata about a GitHub repository.
- **Example:**
  ```bash
  curl http://localhost:8000/repo/dock108/code-navigator/metadata
  ```
- **Response Example:**
  ```json
  {
    "repo_name": "code-navigator",
    "owner": "dock108",
    "description": "Read-only app for easy navigation of large GitHub repos.",
    "language": "Python",
    "stars": 4,
    "forks": 0,
    "open_issues": 2,
    "url": "https://github.com/dock108/code-navigator"
  }
  ```

### Jump to Definition (Python)

- **Endpoint:** `/repo/{owner}/{repo}/definitions`
- **Method:** POST
- **Request Body:**
  ```json
  { "path": "app/main.py" }
  ```
- **Response Example:**
  ```json
  {
    "definitions": [
      {"name": "read_root", "type": "function", "line": 5},
      {"name": "MyClass", "type": "class", "line": 12}
    ]
  }
  ```
- **Description:** Returns all function and class definitions (with line numbers) in a Python file. Handles errors for non-Python files and parse issues.

### Find References (Python)

- **Endpoint:** `/repo/{owner}/{repo}/references`
- **Method:** POST
- **Request Body:**
  ```json
  { "path": "app/main.py", "name": "read_root" }
  ```
- **Response Example:**
  ```json
  {
    "references": [
      {"line": 10, "snippet": "result = read_root()"},
      {"line": 22, "snippet": "response = read_root()"}
    ]
  }
  ```
- **Description:** Returns all references (usages) of the given function or class name in the specified Python file, with line numbers and code snippets. Returns an empty list if no references are found.

### Repo Structure Visualization

- **Endpoint:** `/repo/{owner}/{repo}/structure-visualization`
- **Method:** GET
- **Response Example:**
  ```json
  {
    "repo": "dock108/code-navigator",
    "structure": [
      {
        "name": "app",
        "type": "directory",
        "children": [
          { "name": "main.py", "type": "file" },
          { "name": "routers", "type": "directory", "children": [] }
        ]
      },
      { "name": "Dockerfile", "type": "file" }
    ]
  }
  ```
- **Description:** Returns a nested JSON structure suitable for visualizing the repository's file/module architecture. Handles errors for invalid repositories.

### Summarize File (AI)

- **Endpoint:** `/ai/summarize-file`
- **Method:** POST
- **Request Body:**
  ```json
  {
    "owner": "dock108",
    "repo": "code-navigator",
    "path": "app/main.py"
  }
  ```
- **Response Example:**
  ```json
  {
    "summary": "The main FastAPI application entry point defining the root endpoint."
  }
  ```
- **Description:** Uses GPT-4 to summarize the functionality and purpose of the specified file. Handles errors for missing files or API issues.

### YAML Context Export

- **Endpoint:** `/repo/{owner}/{repo}/yaml-context`
- **Method:** GET
- **Response Content-Type:** `text/yaml`
- **Response Example:**
  ```yaml
  repo_name: code-navigator
  language: Python
  modules:
    - path: app/
      description: Main application components.
      important_files:
        - file: main.py
          purpose: Application entry-point.
  entry_points:
    - app/main.py
  key_concepts:
    - FastAPI
    - REST API
    - GitHub integration
  high_level_overview: |
    This repository contains a FastAPI backend and React frontend designed to simplify codebase navigation.
  ```
- **Description:** Returns a structured YAML summary of the repository layout, modules, entry points, and metadata for AI ingestion. Handles errors gracefully. 