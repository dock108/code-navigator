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