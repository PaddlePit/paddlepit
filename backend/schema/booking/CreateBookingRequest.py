from pydantic import BaseModel, EmailStr
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