"""Initialize DynamoDB tables for local development."""

from db import initialize_db
from config import get_settings

settings = get_settings()

def create_tables():
    """Create DynamoDB tables if they don't exist."""
    ddb = initialize_db()
    client = ddb.meta.client

    tables_to_create = [
        {
            "name": "booking-detail",
            "key_schema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "attributes": [{"AttributeName": "id", "AttributeType": "S"}],
        },
        {
            "name": "booking-item",
            "key_schema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "attributes": [{"AttributeName": "id", "AttributeType": "S"}],
        },
        {
            "name": "court-detail",
            "key_schema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "attributes": [{"AttributeName": "id", "AttributeType": "S"}],
        },
        {
            "name": "transaction-detail",
            "key_schema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "attributes": [
                {"AttributeName": "id", "AttributeType": "S"},
                {"AttributeName": "public_transaction_id", "AttributeType": "S"},
            ],
            "gsi": [
                {
                    "IndexName": "PublicTransactionIdIndex",
                    "KeySchema": [
                        {"AttributeName": "public_transaction_id", "KeyType": "HASH"}
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                }
            ],
        },
        {
            "name": "discount-detail",
            "key_schema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "attributes": [{"AttributeName": "id", "AttributeType": "S"}],
        },
        {
            "name": "admin-detail",
            "key_schema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "attributes": [{"AttributeName": "id", "AttributeType": "S"}],
        },
        {
            "name": "cancellation-request-detail",
            "key_schema": [{"AttributeName": "id", "KeyType": "HASH"}],
            "attributes": [{"AttributeName": "id", "AttributeType": "S"}],
        },
    ]

    # Get existing tables
    response = client.list_tables()
    existing_tables = set(response.get("TableNames", []))

    for table_config in tables_to_create:
        table_name = table_config["name"]

        if table_name in existing_tables:
            print(f"✓ Table '{table_name}' already exists")
            continue

        try:
            params = {
                "TableName": table_name,
                "KeySchema": table_config["key_schema"],
                "AttributeDefinitions": table_config["attributes"],
                "BillingMode": "PAY_PER_REQUEST",
            }

            # Add GSI if defined
            if "gsi" in table_config:
                params["GlobalSecondaryIndexes"] = table_config["gsi"]

            client.create_table(**params)
            print(f"✓ Created table '{table_name}'")
        except Exception as e:
            print(f"✗ Failed to create table '{table_name}': {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("Initializing DynamoDB Tables")
    print("=" * 60)
    print(f"\nEndpoint: {settings.DYNAMODB_ENDPOINT_URL or 'AWS (default)'}")
    print(f"Region: {settings.DB_REGION_NAME}\n")

    create_tables()

    print("\n" + "=" * 60)
    print("Database initialization complete!")
    print("=" * 60)
