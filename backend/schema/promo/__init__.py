"""Promo/Discount schema definitions."""
from .CreatePromoRequest import CreatePromoRequest
from .UpdatePromoRequest import UpdatePromoRequest
from .PromoResponse import PromoResponse, PromoValidationResponse

__all__ = [
    "CreatePromoRequest",
    "UpdatePromoRequest",
    "PromoResponse",
    "PromoValidationResponse",
]
