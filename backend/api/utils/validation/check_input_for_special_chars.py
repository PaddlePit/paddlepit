"""Check for potentially malicious input characters."""


def check_input_for_special_chars(value: str, field_name: str = "input") -> None:
    """
    Check for potentially malicious special characters in input.

    Prevents injection attacks by blocking dangerous characters.

    Args:
        value: String value to check
        field_name: Name of field being validated (for error messages)

    Raises:
        ValueError: If dangerous characters are found
    """
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string")

    # Characters that could be used for injection attacks
    dangerous_chars = ["<", ">", "/", "\\", ";", "'", '"', "&", "|", "`", "$"]

    for char in dangerous_chars:
        if char in value:
            raise ValueError(f"{field_name} contains invalid character: '{char}'")
