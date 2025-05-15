import app.config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import repo
from app.routers import ai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repo.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"} 