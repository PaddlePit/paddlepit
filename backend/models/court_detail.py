from sqlmodel import Field, SQLModel, Relationship  # type: ignore
import uuid
from enum import Enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .booking_item import BookingItem

class CourtStatus(str, Enum):
    available = "available"
    booked = "booked"
    unavailable = "unavailable"

class CourtDetail(SQLModel, table=True):
    __tablename__ = "court_detail"

    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    court_name: str
    hourly_rate: float
    status: CourtStatus = Field(default=CourtStatus.available)

    booking_items: list["BookingItem"] = Relationship(back_populates="court")
