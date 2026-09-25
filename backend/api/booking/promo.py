from fastapi import APIRouter, HTTPException

from services.discount_service import DiscountService

router = APIRouter()
discount_service = DiscountService()

@router.get("/promo/{code}")
def validate_promo(code: str):
    """
    Validate a promo code and return discount amount if valid.
    Returns 404 if code doesn't exist or is invalid.
    """
    try:
        promo = discount_service.validate_promo_code(code)
        return {
            "valid": True,
            "coupon_code": promo["coupon_code"],
            "discount_amount": promo["discount_value"]
        }

    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(
                status_code=404,
                detail=str(e)
            )
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error validating promo code: {str(e)}"
        )
