import boto3
from boto3.resources.base import ServiceResource
from config import get_settings

settings = get_settings()


def initialize_db() -> ServiceResource:
    """Initialize DynamoDB resource with configured credentials."""
    ddb = boto3.resource(
        'dynamodb',
        region_name=settings.DB_REGION_NAME,
        aws_access_key_id=settings.DB_ACCESS_KEY_ID,
        aws_secret_access_key=settings.DB_SECRET_ACCESS_KEY,
        endpoint_url=settings.DYNAMODB_ENDPOINT_URL,
    )
    return ddb