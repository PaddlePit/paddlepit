from sqlmodel import Field, SQLModel  # type: ignore
from datetime import date, datetime
import uuid
from enum import Enum

class Discount(str, Enum):
    percentage = "percentage"
    fixed_amount = "fixed_amount"

class DiscountDetail(SQLModel, table=True):
    __tablename__ = "discount_detail"

    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    coupon_code: str
    discount_type: Discount
    valid_from: date
    valid_until: date
    usage_limit: int
    times_used: int
    is_active: bool
    created_at: datetime
