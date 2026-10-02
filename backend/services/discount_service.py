"""Database service for discount/promo code operations."""

from db import initialize_db
from datetime import datetime
from decimal import Decimal


class DiscountService:
    def __init__(self):
        self.ddb = initialize_db()
        self.discount_table = self.ddb.Table("discount-detail")

    def get_promo_code(self, coupon_code: str) -> dict | None:
        """Retrieve a promo code by coupon code."""
        try:
            response = self.discount_table.scan(
                FilterExpression="coupon_code = :code",
                ExpressionAttributeValues={":code": coupon_code.upper()}
            )
            items = response.get("Items", [])
            if items:
                item = items[0]
                item["discount_value"] = float(item.get("discount_value", 0))
                return item
            return None
        except Exception as e:
            raise Exception(f"Failed to get promo code: {str(e)}")

    def validate_promo_code(self, coupon_code: str) -> dict:
        """
        Validate a promo code and return discount details if valid.
        Raises exception if code is invalid, expired, or limit reached.
        """
        promo = self.get_promo_code(coupon_code)

        if not promo:
            raise ValueError(f"Promo code '{coupon_code.upper()}' not found")

        # Check if promo is active
        if not promo.get("is_active", False):
            raise ValueError("Promo code is no longer active")

        # Check valid date range
        now = datetime.utcnow()
        valid_from = datetime.fromisoformat(promo.get("valid_from", "")) if isinstance(promo.get("valid_from"), str) else promo.get("valid_from")
        valid_until = datetime.fromisoformat(promo.get("valid_until", "")) if isinstance(promo.get("valid_until"), str) else promo.get("valid_until")

        if valid_from and now < valid_from:
            raise ValueError("Promo code is not yet valid")

        if valid_until and now > valid_until:
            raise ValueError("Promo code has expired")

        # Check usage limit
        times_used = promo.get("times_used", 0)
        usage_limit = promo.get("usage_limit", 0)

        if times_used >= usage_limit:
            raise ValueError("Promo code usage limit reached")

        return {
            "id": promo.get("id"),
            "coupon_code": promo.get("coupon_code"),
            "discount_type": promo.get("discount_type"),
            "discount_value": float(promo.get("discount_value", 0)),
            "valid": True
        }

    def increment_usage(self, promo_id: str) -> None:
        """Increment the usage count for a promo code."""
        try:
            self.discount_table.update_item(
                Key={"id": promo_id},
                UpdateExpression="SET times_used = times_used + :inc",
                ExpressionAttributeValues={":inc": 1}
            )
        except Exception as e:
            raise Exception(f"Failed to increment promo usage: {str(e)}")

    def create_promo_code(
        self,
        coupon_code: str,
        discount_type: str,
        discount_value: float,
        valid_from: str,
        valid_until: str,
        usage_limit: int,
        is_active: bool = True,
    ) -> dict:
        """Create a new promo code."""
        from uuid import uuid4

        try:
            promo_id = str(uuid4())

            self.discount_table.put_item(
                Item={
                    "id": promo_id,
                    "coupon_code": coupon_code.upper(),
                    "discount_type": discount_type,
                    "discount_value": Decimal(str(discount_value)),
                    "valid_from": valid_from,
                    "valid_until": valid_until,
                    "usage_limit": usage_limit,
                    "times_used": 0,
                    "is_active": is_active,
                    "created_at": datetime.utcnow().isoformat(),
                }
            )

            return {
                "id": promo_id,
                "coupon_code": coupon_code.upper(),
                "discount_type": discount_type,
                "discount_value": discount_value,
                "valid_from": valid_from,
                "valid_until": valid_until,
                "usage_limit": usage_limit,
                "times_used": 0,
                "is_active": is_active,
                "created_at": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            raise Exception(f"Failed to create promo code: {str(e)}")

    def update_promo_code(self, promo_id: str, update_data: dict) -> dict:
        """Update an existing promo code."""
        try:
            if not update_data:
                raise ValueError("No fields to update")

            # Build update expression
            update_expr = "SET "
            attr_values = {}
            attr_names = {}

            for key, value in update_data.items():
                update_expr += f"#{key} = :{key}, "
                attr_names[f"#{key}"] = key

                if key == "discount_value":
                    attr_values[f":{key}"] = Decimal(str(value))
                else:
                    attr_values[f":{key}"] = value

            update_expr = update_expr.rstrip(", ")

            response = self.discount_table.update_item(
                Key={"id": promo_id},
                UpdateExpression=update_expr,
                ExpressionAttributeNames=attr_names,
                ExpressionAttributeValues=attr_values,
                ReturnValues="ALL_NEW"
            )

            item = response.get("Attributes", {})
            item["discount_value"] = float(item.get("discount_value", 0))
            return item

        except Exception as e:
            raise Exception(f"Failed to update promo code: {str(e)}")

    def get_all_promos(self) -> list[dict]:
        """Retrieve all promo codes."""
        try:
            response = self.discount_table.scan()
            items = response.get("Items", [])

            for item in items:
                item["discount_value"] = float(item.get("discount_value", 0))

            return items
        except Exception as e:
            raise Exception(f"Failed to retrieve promo codes: {str(e)}")
