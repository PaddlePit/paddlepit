"""Update promo code endpoint."""
from fastapi import APIRouter, HTTPException, Request
from schema.promo import UpdatePromoRequest, PromoResponse
from services.discount_service import DiscountService

router = APIRouter()
discount_service = DiscountService()


@router.put("/promo/{code}", response_model=PromoResponse)
def update_promo(code: str, request: UpdatePromoRequest, _: Request):
    """
    Update an existing promo code.

    Only updates fields that are provided (partial update).

    Returns:
    - 200: Promo code updated successfully
    - 404: Promo code not found
    - 400: Invalid input data
    """
    try:
        if not code or not code.strip():
            raise HTTPException(
                status_code=400,
                detail="Promo code cannot be empty"
            )

        # Get existing promo
        promo = discount_service.validate_promo_code(code.strip().upper())

        # Build update data (only non-null fields)
        update_data = {}
        if request.discount_value is not None:
            update_data["discount_value"] = request.discount_value
        if request.valid_until is not None:
            update_data["valid_until"] = request.valid_until.isoformat()
        if request.usage_limit is not None:
            update_data["usage_limit"] = request.usage_limit
        if request.is_active is not None:
            update_data["is_active"] = request.is_active

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No fields to update"
            )

        # Update the promo code
        updated_promo = discount_service.update_promo_code(promo["id"], update_data)

        return {
            "id": updated_promo["id"],
            "coupon_code": updated_promo["coupon_code"],
            "discount_type": updated_promo.get("discount_type", "fixed_amount"),
            "discount_value": updated_promo["discount_value"],
            "valid_from": updated_promo.get("valid_from", ""),
            "valid_until": updated_promo.get("valid_until", ""),
            "usage_limit": updated_promo.get("usage_limit", 0),
            "times_used": updated_promo.get("times_used", 0),
            "is_active": updated_promo.get("is_active", True),
            "created_at": updated_promo.get("created_at", ""),
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
            detail=f"Error updating promo code: {str(e)}"
        )
