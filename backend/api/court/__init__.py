from fastapi import APIRouter

court_router = APIRouter()

# Import endpoint modules to register routes
from . import create, get, update

__all__ = ["court_router"]
