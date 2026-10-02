"""Promo code API endpoints with validation and safety checks."""
from fastapi import APIRouter, HTTPException
from schema.promo.CreatePromoRequest import CreatePromoRequest
from schema.promo.UpdatePromoRequest import UpdatePromoRequest
from schema.promo.PromoResponse import PromoResponse, PromoValidationResponse
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


#  WARNING: NO AUTHORIZATION YET
@router.post("/promo", response_model=PromoResponse)
def create_promo(request: CreatePromoRequest):
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
                detail=f"Promo code '{request.coupon_code}' already exists"
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


@router.get("/promo")
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


@router.put("/promo/{code}", response_model=PromoResponse)
def update_promo(code: str, request: UpdatePromoRequest):
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


@router.delete("/promo/{code}")
def delete_promo(code: str):
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
