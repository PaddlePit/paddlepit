from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AllBookingsResponse(BaseModel):
    booking_id: UUID
    booker_name: str
    phone: str
    email: str
    courts_reserved: int
    total_price: float
    created_at: datetime
