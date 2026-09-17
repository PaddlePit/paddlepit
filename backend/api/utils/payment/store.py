"""In-memory transaction store for payment status tracking."""

# In-memory transaction store
# TODO: Replace with database (TransactionDetail table) in production
TRANSACTIONS = {}


def get_transaction(booking_id: str) -> dict:
    """Get transaction details for a booking."""
    return TRANSACTIONS.get(booking_id)


def set_transaction(booking_id: str, transaction_data: dict) -> None:
    """Store transaction details for a booking."""
    TRANSACTIONS[booking_id] = transaction_data


def transaction_exists(booking_id: str) -> bool:
    """Check if transaction exists for a booking."""
    return booking_id in TRANSACTIONS
