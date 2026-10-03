"""Validate promo code endpoint."""
from fastapi import APIRouter, HTTPException
from schema.promo import PromoValidationResponse
from services.discount_service import DiscountService

router = APIRouter()
discount_service = DiscountService()


@router.get("/promo/{code}", response_model=PromoValidationResponse)
def validate_promo(code: str):
    """
    Validate a promo code and return discount details if valid.

    Returns:
    - 200: Promo code is valid with discount details
    - 404: Promo code not found or expired
    - 400: Promo code is inactive or usage limit reached
    """
    try:
        if not code or not code.strip():
            raise HTTPException(
                status_code=400,
                detail="Promo code cannot be empty"
            )

        promo = discount_service.validate_promo_code(code.strip().upper())

        # Calculate remaining uses
        times_used = promo.get("times_used", 0)
        usage_limit = promo.get("usage_limit", 0)
        remaining_uses = max(0, usage_limit - times_used)

        return {
            "valid": True,
            "coupon_code": promo["coupon_code"],
            "discount_type": promo.get("discount_type", "fixed_amount"),
            "discount_amount": promo["discount_value"],
            "times_used": times_used,
            "usage_limit": usage_limit,
            "remaining_uses": remaining_uses,
        }

    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(status_code=404, detail=error_msg)
        raise HTTPException(status_code=400, detail=error_msg)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error validating promo code: {str(e)}"
        )
