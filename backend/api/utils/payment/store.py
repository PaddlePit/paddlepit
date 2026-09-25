"""DEPRECATED: In-memory transaction store. Use BookingService for database operations."""

# This module is deprecated. All payment operations now use DynamoDB via BookingService.
# Kept for backwards compatibility if needed.
TRANSACTIONS = {}


def get_transaction(booking_id: str) -> dict:
    """DEPRECATED: Use BookingService.get_transaction() instead."""
    return TRANSACTIONS.get(booking_id)


def set_transaction(booking_id: str, transaction_data: dict) -> None:
    """DEPRECATED: Use BookingService.create_transaction() instead."""
    TRANSACTIONS[booking_id] = transaction_data


def transaction_exists(booking_id: str) -> bool:
    """DEPRECATED: Use BookingService.get_transaction() instead."""
    return booking_id in TRANSACTIONS
