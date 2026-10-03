from fastapi import APIRouter

booking_router = APIRouter()

# Import endpoint modules to register routes
from . import create, get

__all__ = ["booking_router"]
