from sqlmodel import Field, SQLModel, Relationship  # type: ignore
import uuid
from enum import Enum
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .transaction_detail import TransactionDetail
    from .admin_detail import AdminDetail

class RequestStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class CancellationRequestDetail(SQLModel, table=True):
    __tablename__ = "cancellation_request_detail"

    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    transaction_id: uuid.UUID = Field(foreign_key="transaction_detail.id")
    reason: str
    status: RequestStatus = Field(default=RequestStatus.pending)
    approved_by: Optional[uuid.UUID] = Field(default=None, foreign_key="admin_detail.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    transaction: Optional["TransactionDetail"] = Relationship(back_populates="cancellation_requests")
    admin: Optional["AdminDetail"] = Relationship(back_populates="cancellation_requests")
