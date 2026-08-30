from fastapi import FastAPI

app = FastAPI(
    title="PaddlePit API",
    version="0.1.0",
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Root API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
