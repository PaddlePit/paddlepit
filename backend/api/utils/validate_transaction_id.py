from .check_input_for_special_chars import check_input_for_special_chars

def validate_transaction_id(transaction_id: str) -> None:
    """Validate transaction ID for security and format"""
    if not isinstance(transaction_id, str):
        raise ValueError("Transaction ID is invalid.")

    if not transaction_id:
        raise ValueError("Transaction ID cannot be empty.")

    # Check for special characters
    check_input_for_special_chars(transaction_id, "transaction_id")

    # Validate format (alphanumeric only)
    if not transaction_id.replace("-", "").replace("_", "").isalnum():
        raise ValueError("Transaction ID must contain only alphanumeric characters, hyphens, and underscores")

    if len(transaction_id) > 50:
        raise ValueError("Transaction ID is too long (max 50 characters)")