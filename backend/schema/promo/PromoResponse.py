"""Response schemas for promo codes."""
from pydantic import BaseModel


class PromoResponse(BaseModel):
    """Response for promo code details."""
    id: str
    coupon_code: str
    discount_type: str
    discount_value: float
    valid_from: str
    valid_until: str
    usage_limit: int
    times_used: int
    is_active: bool
    created_at: str


class PromoValidationResponse(BaseModel):
    """Response when validating a promo code."""
    valid: bool
    coupon_code: str
    discount_type: str
    discount_amount: float
    times_used: int
    usage_limit: int
    remaining_uses: int
