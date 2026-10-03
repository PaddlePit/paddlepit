"""Request schema for updating promo codes."""
from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class UpdatePromoRequest(BaseModel):
    """Request to update an existing promo code."""
    discount_value: Optional[float] = None
    valid_until: Optional[datetime] = None
    usage_limit: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("discount_value")
    @classmethod
    def validate_discount_value(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            if v <= 0:
                raise ValueError("Discount value must be greater than 0")
            if v > 100000:
                raise ValueError("Discount value cannot exceed 100,000")
        return v

    @field_validator("usage_limit")
    @classmethod
    def validate_usage_limit(cls, v: Optional[int]) -> Optional[int]:
        if v is not None:
            if v < 1:
                raise ValueError("Usage limit must be at least 1")
            if v > 10000:
                raise ValueError("Usage limit cannot exceed 10,000")
        return v
