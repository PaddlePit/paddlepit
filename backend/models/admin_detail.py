from sqlmodel import Field, SQLModel, Relationship  # type: ignore
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .cancellation_request_detail import CancellationRequestDetail

class AdminDetail(SQLModel, table=True):
    __tablename__ = "admin_detail"

    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    google_id: str = Field(unique=True)
    name: str
    email: str = Field(unique=True)
    created_at: datetime = Field(default_factory=datetime)

    cancellation_requests: list["CancellationRequestDetail"] = Relationship(back_populates="admin")
