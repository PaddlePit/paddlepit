from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime

class BookingItem(BaseModel):
    court_id: str
    start_time: datetime
    end_time: datetime

class CreateBookingRequest(BaseModel):
    booker_name: str
    email: EmailStr
    phone: str
    booking_items: list[BookingItem]
    promo_code: Optional[str] = None

    @field_validator("booker_name")
    @classmethod
    def validate_booker_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Booker name cannot be empty")
        if len(v.strip()) < 2:
            raise ValueError("Booker name must be at least 2 characters")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Phone number cannot be empty")
        if len(v.strip()) < 7:
            raise ValueError("Phone number must be at least 7 characters")
        return v.strip()