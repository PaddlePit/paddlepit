"""String sanitization utilities."""


def sanitize_string(value: str) -> str:
    """
    Sanitize string by trimming whitespace.

    Removes leading and trailing whitespace from strings.

    Args:
        value: String to sanitize

    Returns:
        Trimmed string

    Raises:
        ValueError: If input is not a string
    """
    if not isinstance(value, str):
        raise ValueError(f"Expected string, got {type(value).__name__}")
    return value.strip()
