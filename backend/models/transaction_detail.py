from sqlmodel import Field, SQLModel, Relationship  # type: ignore
from typing import Optional, TYPE_CHECKING
import uuid
from enum import Enum

if TYPE_CHECKING:
    from .booking_detail import BookingDetail
    from .cancellation_request_detail import CancellationRequestDetail

class TransactionStatus(str, Enum):
    paid = "paid"
    refund = "refund"

class TransactionDetail(SQLModel, table=True):
    __tablename__ = "transaction_detail"

    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    booking_id: uuid.UUID = Field(foreign_key="booking_detail.id")
    public_transaction_id: Optional[int] = Field(default=None, unique=True)
    status: TransactionStatus

    booking: Optional["BookingDetail"] = Relationship(back_populates="transactions")
    cancellation_requests: list["CancellationRequestDetail"] = Relationship(back_populates="transaction")
