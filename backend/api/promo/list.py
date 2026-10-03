"""List promo codes endpoint."""
from fastapi import HTTPException
from services.discount_service import DiscountService
from . import promo_router

discount_service = DiscountService()

@promo_router.get("/promo")
def list_all_promos(active_only: bool = True):
    """
    List all promo codes.

    Query Parameters:
    - active_only (bool): If true, return only active promos (default: true)

    Returns:
    - 200: List of promo codes
    - 500: Internal server error
    """
    try:
        promos = discount_service.get_all_promos()

        if active_only:
            promos = [p for p in promos if p.get("is_active", True)]

        return {
            "count": len(promos),
            "promos": [
                {
                    "id": p.get("id"),
                    "coupon_code": p.get("coupon_code"),
                    "discount_type": p.get("discount_type", "fixed_amount"),
                    "discount_value": p.get("discount_value"),
                    "times_used": p.get("times_used", 0),
                    "usage_limit": p.get("usage_limit", 0),
                    "is_active": p.get("is_active", True),
                }
                for p in promos
            ]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving promo codes: {str(e)}"
        )
