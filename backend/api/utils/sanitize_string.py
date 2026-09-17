def sanitize_string(value: str) -> str:
    """Sanitize string by trimming whitespace"""
    if not isinstance(value, str):
        raise ValueError(f"Expected string, got {type(value).__name__}")
    return value.strip()