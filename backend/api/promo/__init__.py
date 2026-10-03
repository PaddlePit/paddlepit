from fastapi import APIRouter

promo_router = APIRouter()

# Import endpoint modules to register routes
from . import create, list, update, delete, validate

__all__ = ["promo_router"]