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