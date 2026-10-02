from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AllBookingsResponse(BaseModel):
    id: str
    booker_name: str
    phone: str
    email: str
    courts_reserved: list[str]
    total_price: float
    updated_at: str
    created_at: str
