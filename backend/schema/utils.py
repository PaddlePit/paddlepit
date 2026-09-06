"""Utility functions for schema formatting"""
from datetime import datetime


def format_date(dt: datetime) -> str:
    """
    Format datetime to date string format: "Saturday, August 9 2025"

    Args:
        dt: datetime object to format

    Returns:
        Formatted date string
    """
    return f"{dt.strftime('%A, %B')} {dt.day} {dt.year}"


def format_time(dt: datetime) -> str:
    """
    Format datetime to time string format: "2:30 PM"

    Args:
        dt: datetime object to format

    Returns:
        Formatted time string
    """
    time_str = dt.strftime("%I:%M %p")
    return time_str.lstrip("0").replace(" 0", " ")
