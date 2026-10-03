"""Delete promo code endpoint."""
from fastapi import APIRouter, HTTPException, Request
from services.discount_service import DiscountService

router = APIRouter()
discount_service = DiscountService()


@router.delete("/promo/{code}")
def delete_promo(code: str, _: Request):
    """
    Delete a promo code (soft delete - marks as inactive).

    Returns:
    - 200: Promo code deleted successfully
    - 404: Promo code not found
    - 500: Internal server error
    """
    try:
        if not code or not code.strip():
            raise HTTPException(
                status_code=400,
                detail="Promo code cannot be empty"
            )

        # Verify promo exists
        promo = discount_service.validate_promo_code(code.strip().upper())

        # Soft delete by marking as inactive
        discount_service.update_promo_code(promo["id"], {"is_active": False})

        return {
            "message": f"Promo code '{code}' has been deleted",
            "coupon_code": promo["coupon_code"]
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
            detail=f"Error deleting promo code: {str(e)}"
        )
