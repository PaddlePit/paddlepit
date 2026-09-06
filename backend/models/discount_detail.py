from sqlmodel import Field, SQLModel, Relationship  # type: ignore
from datetime import date, datetime
import uuid
from enum import Enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .transaction_detail import TransactionDetail

class DiscountType(str, Enum):
    percentage = "percentage"
    fixed_amount = "fixed_amount"

class DiscountDetail(SQLModel, table=True):
    __tablename__ = "discount_detail"

    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    coupon_code: str = Field(unique=True)
    discount_type: DiscountType
    discount_value: float
    valid_from: datetime
    valid_until: datetime
    usage_limit: int
    times_used: int = Field(default=0)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    transactions: list["TransactionDetail"] = Relationship(back_populates="discount")
