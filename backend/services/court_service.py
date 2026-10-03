"""Database service for court operations."""

from db import initialize_db
from uuid import uuid4
from datetime import datetime
from decimal import Decimal

class CourtService:
    def __init__(self):
        self.ddb = initialize_db()
        self.court_table = self.ddb.Table("court-detail")

    def get_all_courts(self) -> list[dict]:
        """Retrieve all courts from court-detail table."""
        try:
            response = self.court_table.scan()

            courts = []
            for item in response.get("Items", []):
                courts.append({
                    "court_id": item.get("id"),
                    "court_name": item.get("court_name")
                })

            # Sort by court_id for consistent ordering
            courts.sort(key=lambda x: x["court_id"])
            return courts
        except Exception as e:
            raise Exception(f"Failed to retrieve courts: {str(e)}")

    def get_court(self, court_id: str) -> dict | None:
        """Retrieve a specific court by ID."""
        try:
            response = self.court_table.get_item(Key={"id": court_id})
            if "Item" in response:
                item = response["Item"]
                return {
                    "court_id": item.get("id"),
                    "court_name": item.get("court_name"),
                    "hourly_rate": float(item.get("hourly_rate", 0)),
                    "status": item.get("status", "available")
                }
            return None
        except Exception as e:
            raise Exception(f"Failed to retrieve court: {str(e)}")

    def create_court(self, court_name: str, hourly_rate: float, status: str = "available") -> dict:
        """Create a new court in DynamoDB."""
        court_id = str(uuid4())

        try:
            self.court_table.put_item(
                Item={
                    "id": court_id,
                    "court_name": court_name,
                    "hourly_rate": Decimal(str(hourly_rate)),
                    "status": status,
                    "created_at": datetime.utcnow().isoformat()
                }
            )
            return {
                "court_id": court_id,
                "court_name": court_name,
                "hourly_rate": hourly_rate,
                "status": status
            }
        except Exception as e:
            raise Exception(f"Failed to create court: {str(e)}")

    def update_court(self, court_id: str, update_data: dict) -> dict | None:
        """Update court details."""
        try:
            # First check if court exists
            court = self.get_court(court_id)
            if not court:
                return None

            # Build update expression and values
            update_expr_parts = []
            expr_attr_values = {}

            for key, value in update_data.items():
                # Convert hourly_rate to Decimal for DynamoDB
                if key == "hourly_rate":
                    value = Decimal(str(value))
                update_expr_parts.append(f"{key} = :{key}")
                expr_attr_values[f":{key}"] = value

            # Add updated_at timestamp
            update_expr_parts.append("updated_at = :updated_at")
            expr_attr_values[":updated_at"] = datetime.utcnow().isoformat()

            update_expr = "SET " + ", ".join(update_expr_parts)

            # Update the item
            self.court_table.update_item(
                Key={"id": court_id},
                UpdateExpression=update_expr,
                ExpressionAttributeValues=expr_attr_values
            )

            # Return updated court
            return self.get_court(court_id)
        except Exception as e:
            raise Exception(f"Failed to update court: {str(e)}")
