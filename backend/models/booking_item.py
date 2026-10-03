from sqlmodel import Field, SQLModel, Relationship  # type: ignore
import uuid
from datetime import date, time
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .booking_detail import BookingDetail
    from .court_detail import CourtDetail

class BookingItem(SQLModel, table=True):
    __tablename__ = "booking_item"

    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    booking_id: uuid.UUID = Field(foreign_key="booking_detail.id")
    court_id: uuid.UUID = Field(foreign_key="court_detail.id")
    start_time: time
    end_time: time
    date: date
    price: float
    version: int = Field(default=1)

    booking: Optional["BookingDetail"] = Relationship(back_populates="booking_items")
    court: Optional["CourtDetail"] = Relationship(back_populates="booking_items")
