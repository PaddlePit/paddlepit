def check_input_for_special_chars(value: str, field_name: str = "input") -> None:
    """Check for potentially malicious special characters in input"""
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string")

    dangerous_chars = ["<", ">", "/", "\\", ";", "'", '"', "&", "|", "`", "$"]

    for char in dangerous_chars:
        if char in value:
            raise ValueError(f"{field_name} contains invalid character: '{char}'")
