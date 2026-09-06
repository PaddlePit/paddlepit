from sqlmodel import Field, SQLModel, Relationship  # type: ignore
from typing import Optional, TYPE_CHECKING
import uuid
from enum import Enum
from datetime import datetime

if TYPE_CHECKING:
    from .booking_detail import BookingDetail
    from .cancellation_request_detail import CancellationRequestDetail
    from .discount_detail import DiscountDetail

class TransactionStatus(str, Enum):
    paid = "paid"
    refund = "refund"

class PaymentMode(str, Enum):
    card = "card"
    gcash = "gcash"
    bank_transfer = "bank_transfer"

class TransactionDetail(SQLModel, table=True):
    __tablename__ = "transaction_detail"

    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    booking_id: uuid.UUID = Field(foreign_key="booking_detail.id")
    public_transaction_id: Optional[str] = Field(default=None, unique=True)
    payment_mode: PaymentMode
    amount: float
    status: TransactionStatus
    discount_id: Optional[uuid.UUID] = Field(default=None, foreign_key="discount_detail.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    booking: Optional["BookingDetail"] = Relationship(back_populates="transactions")
    discount: Optional["DiscountDetail"] = Relationship(back_populates="transactions")
    cancellation_requests: list["CancellationRequestDetail"] = Relationship(back_populates="transaction")
