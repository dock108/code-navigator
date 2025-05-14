from fastapi import FastAPI
from app.routers import repo

app = FastAPI()

app.include_router(repo.router)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"} 