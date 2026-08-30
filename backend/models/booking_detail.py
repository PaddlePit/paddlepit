from sqlmodel import Field, SQLModel, Relationship  # type: ignore
from datetime import date
import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .transaction_detail import TransactionDetail

class BookingDetail(SQLModel, table=True):
    __tablename__ = "booking_detail"

    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    date: date
    courts_reserved: int
    booker_name: str
    phone: str
    email: str

    transactions: list["TransactionDetail"] = Relationship(back_populates="booking")
