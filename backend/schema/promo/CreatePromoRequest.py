"""Request schema for creating promo codes."""
from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Literal


class CreatePromoRequest(BaseModel):
    """Request to create a new promo code."""
    coupon_code: str
    discount_type: Literal["percentage", "fixed_amount"]
    discount_value: float
    valid_from: datetime
    valid_until: datetime
    usage_limit: int
    is_active: bool = True

    @field_validator("coupon_code")
    @classmethod
    def validate_coupon_code(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Coupon code cannot be empty")
        v = v.strip().upper()
        if len(v) < 3:
            raise ValueError("Coupon code must be at least 3 characters")
        if len(v) > 20:
            raise ValueError("Coupon code cannot exceed 20 characters")
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Coupon code can only contain alphanumeric, dash, and underscore")
        return v

    @field_validator("discount_value")
    @classmethod
    def validate_discount_value(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Discount value must be greater than 0")
        if v > 100000:  # Max 100,000 pesos or 100%
            raise ValueError("Discount value cannot exceed 100,000")
        return v

    @field_validator("usage_limit")
    @classmethod
    def validate_usage_limit(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Usage limit must be at least 1")
        if v > 10000:
            raise ValueError("Usage limit cannot exceed 10,000")
        return v

    def model_post_init(self, __context):
        # Ensure valid_until is after valid_from
        if self.valid_until <= self.valid_from:
            raise ValueError("valid_until must be after valid_from")

        # Ensure discount_type matches discount_value constraints
        if self.discount_type == "percentage":
            if self.discount_value > 100:
                raise ValueError("Percentage discount cannot exceed 100%")
