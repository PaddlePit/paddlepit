"""Promo code API endpoints."""
from .validate import router as validate_router
from .create import router as create_router
from .list import router as list_router
from .update import router as update_router
from .delete import router as delete_router

# Combine all promo routers into a list
promo_routers = [
    validate_router,
    create_router,
    list_router,
    update_router,
    delete_router,
]

__all__ = [
    "promo_routers",
    "validate_router",
    "create_router",
    "list_router",
    "update_router",
    "delete_router",
]
