from sqlmodel import Field, SQLModel, Relationship  # type: ignore
from datetime import datetime
import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .booking_item import BookingItem
    from .transaction_detail import TransactionDetail

class BookingDetail(SQLModel, table=True):
    __tablename__ = "booking_detail"

    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    booker_name: str
    phone: str
    email: str
    courts_reserved: list[str] = []
    total_price: float
    created_at: datetime = Field(default_factory=datetime.timezone)

    booking_items: list["BookingItem"] = Relationship(back_populates="booking")
    transactions: list["TransactionDetail"] = Relationship(back_populates="booking")
