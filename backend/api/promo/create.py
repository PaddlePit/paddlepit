"""Create promo code endpoint."""
from fastapi import APIRouter, HTTPException, Request
from schema.promo import CreatePromoRequest, PromoResponse
from services.discount_service import DiscountService

router = APIRouter()
discount_service = DiscountService()


@router.post("/promo", response_model=PromoResponse)
def create_promo(request: CreatePromoRequest, _: Request):
    """
    Create a new promo code.

    Validations:
    - Coupon code must be 3-20 characters, alphanumeric with dash/underscore
    - Discount value must be > 0
    - Percentage discounts capped at 100%
    - Fixed amount discounts capped at 100,000
    - Usage limit must be 1-10,000
    - valid_until must be after valid_from

    Returns:
    - 201: Promo code created successfully
    - 400: Invalid input data
    - 409: Promo code already exists
    """
    try:
        # Check if promo already exists
        try:
            existing = discount_service.validate_promo_code(request.coupon_code)
            raise HTTPException(
                status_code=409,
                detail=f"Promo code already exists"
            )
        except ValueError:
            # Expected - code shouldn't exist
            pass

        # Create the promo code
        promo = discount_service.create_promo_code(
            coupon_code=request.coupon_code,
            discount_type=request.discount_type,
            discount_value=request.discount_value,
            valid_from=request.valid_from.isoformat(),
            valid_until=request.valid_until.isoformat(),
            usage_limit=request.usage_limit,
            is_active=request.is_active,
        )

        return {
            "id": promo["id"],
            "coupon_code": promo["coupon_code"],
            "discount_type": promo.get("discount_type", "fixed_amount"),
            "discount_value": promo["discount_value"],
            "valid_from": promo.get("valid_from", ""),
            "valid_until": promo.get("valid_until", ""),
            "usage_limit": promo.get("usage_limit", 0),
            "times_used": promo.get("times_used", 0),
            "is_active": promo.get("is_active", True),
            "created_at": promo.get("created_at", ""),
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating promo code: {str(e)}"
        )
