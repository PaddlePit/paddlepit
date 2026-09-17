"""PayMongo webhook signature verification."""
import hmac
import hashlib
import os

PAYMONGO_SECRET_KEY = os.getenv("PAYMONGO_SECRET_KEY")


def verify_paymongo_signature(request_body: bytes, signature: str) -> bool:
    """
    Verify PayMongo webhook signature for security.

    PayMongo signs webhooks with HMAC-SHA256 using the secret key.
    This ensures the webhook is from PayMongo and hasn't been tampered with.

    Args:
        request_body: Raw request body bytes
        signature: Signature from X-Paymongo-Signature header

    Returns:
        True if signature is valid, False otherwise
    """
    try:
        # Create HMAC signature
        expected_signature = hmac.new(
            key=PAYMONGO_SECRET_KEY.encode(),
            msg=request_body,
            digestmod=hashlib.sha256
        ).hexdigest()

        # Compare signatures (constant-time comparison to prevent timing attacks)
        return hmac.compare_digest(expected_signature, signature)
    except Exception as e:
        print(f"Signature verification error: {str(e)}")
        return False
