"""Database service for booking operations."""

from db.base import initialize_db
from uuid import uuid4
from datetime import datetime
from decimal import Decimal


class BookingService:
    def __init__(self):
        self.ddb = initialize_db()
        self.booking_table = self.ddb.Table("booking-detail")
        self.booking_item_table = self.ddb.Table("booking-item")
        self.transaction_table = self.ddb.Table("transaction-detail")

    def create_booking(self, booker_name: str, phone: str, email: str, courts_reserved: list[str], total_price: float) -> dict:
        """Create a new booking in DynamoDB."""
        booking_id = str(uuid4())

        try:
            self.booking_table.put_item(
                Item={
                    "id": booking_id,
                    "booker_name": booker_name,
                    "phone": phone,
                    "email": email,
                    "courts_reserved": courts_reserved,
                    "total_price": Decimal(str(total_price)),
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                }
            )
            return {
                "id": booking_id,
                "booker_name": booker_name,
                "phone": phone,
                "email": email,
                "courts_reserved": courts_reserved,
                "total_price": total_price,
                "created_at": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            raise Exception(f"Failed to create booking: {str(e)}")

    def get_booking(self, booking_id: str) -> dict | None:
        """Retrieve a booking by ID."""
        try:
            response = self.booking_table.get_item(Key={"id": booking_id})
            if "Item" in response:
                item = response["Item"]
                item["total_price"] = float(item.get("total_price", 0))
                return item
            return None
        except Exception as e:
            raise Exception(f"Failed to get booking: {str(e)}")

    def get_all_bookings(self) -> list[dict]:
        """Retrieve all bookings."""
        try:
            response = self.booking_table.scan()
            items = response.get("Items", [])
            for item in items:
                item["total_price"] = float(item.get("total_price", 0))
            return items
        except Exception as e:
            raise Exception(f"Failed to retrieve bookings: {str(e)}")

    def create_booking_item(self, booking_id: str, court_id: str, start_time: str, end_time: str, price: float) -> dict:
        """Create a booking item (court reservation within a booking)."""
        booking_item_id = str(uuid4())

        try:
            self.booking_item_table.put_item(
                Item={
                    "id": booking_item_id,
                    "booking_id": booking_id,
                    "court_id": court_id,
                    "start_time": start_time,
                    "end_time": end_time,
                    "price": Decimal(str(price)),
                    "version": 1,
                    "created_at": datetime.utcnow().isoformat(),
                }
            )
            return {
                "id": booking_item_id,
                "booking_id": booking_id,
                "court_id": court_id,
                "start_time": start_time,
                "end_time": end_time,
                "price": price,
                "version": 1,
            }
        except Exception as e:
            raise Exception(f"Failed to create booking item: {str(e)}")

    def create_transaction(self, booking_id: str, public_transaction_id: str, amount: float, payment_mode: str = "card", discount_id: str | None = None) -> dict:
        """Create a transaction record."""
        transaction_id = str(uuid4())

        try:
            item = {
                "id": transaction_id,
                "booking_id": booking_id,
                "public_transaction_id": public_transaction_id,
                "amount": Decimal(str(amount)),
                "status": "pending",
                "payment_mode": payment_mode,
                "created_at": datetime.utcnow().isoformat(),
            }

            if discount_id:
                item["discount_id"] = discount_id

            self.transaction_table.put_item(Item=item)

            result = {
                "id": transaction_id,
                "booking_id": booking_id,
                "public_transaction_id": public_transaction_id,
                "amount": amount,
                "status": "pending",
                "payment_mode": payment_mode,
                "created_at": datetime.utcnow().isoformat(),
            }

            if discount_id:
                result["discount_id"] = discount_id

            return result
        except Exception as e:
            raise Exception(f"Failed to create transaction: {str(e)}")

    def get_transaction_by_booking_id(self, booking_id: str) -> dict | None:
        """Retrieve a transaction by booking ID."""
        try:
            response = self.transaction_table.scan(
                FilterExpression="booking_id = :bid",
                ExpressionAttributeValues={":bid": booking_id}
            )
            items = response.get("Items", [])
            if items:
                item = items[0]
                item["amount"] = float(item.get("amount", 0))
                return item
            return None
        except Exception as e:
            raise Exception(f"Failed to get transaction: {str(e)}")

    def get_transaction(self, transaction_id: str) -> dict | None:
        """Retrieve a transaction by ID."""
        try:
            response = self.transaction_table.scan(
                FilterExpression="id = :tid",
                ExpressionAttributeValues={":tid": transaction_id}
            )
            items = response.get("Items", [])
            if items:
                item = items[0]
                item["amount"] = float(item.get("amount", 0))
                return item
            return None
        except Exception as e:
            raise Exception(f"Failed to get transaction: {str(e)}")

    def get_transaction_by_public_id(self, public_transaction_id: str) -> dict | None:
        """Retrieve a transaction by public transaction ID."""
        try:
            response = self.transaction_table.scan(
                FilterExpression="public_transaction_id = :pid",
                ExpressionAttributeValues={":pid": public_transaction_id}
            )
            items = response.get("Items", [])
            if items:
                item = items[0]
                item["amount"] = float(item.get("amount", 0))
                return item
            return None
        except Exception as e:
            raise Exception(f"Failed to get transaction: {str(e)}")
