"""
Quick test to verify DynamoDB connection is working.
Run: python test_db.py
"""

from db.base import initialize_db
from config import get_settings

settings = get_settings()

print("=" * 60)
print("Testing DynamoDB Connection")
print("=" * 60)

# Print current config
print(f"\n✓ Configuration:")
print(f"  Region: {settings.DB_REGION_NAME}")
print(f"  Endpoint: {settings.DYNAMODB_ENDPOINT_URL or 'AWS (default)'}")
print(f"  Has credentials: {bool(settings.DB_ACCESS_KEY_ID)}")

try:
    # Initialize connection
    print(f"\n⏳ Connecting to DynamoDB...")
    ddb = initialize_db()

    # Try to list tables (minimal operation)
    print(f"⏳ Listing tables...")
    response = ddb.meta.client.list_tables()

    tables = response.get('TableNames', [])
    print(f"\n✅ Connection successful!")
    print(f"\n📋 Tables found: {len(tables)}")
    if tables:
        for table in sorted(tables):
            print(f"   - {table}")
    else:
        print("   (No tables yet)")

except Exception as e:
    print(f"\n❌ Connection failed!")
    print(f"Error: {type(e).__name__}")
    print(f"Message: {str(e)}")
    print("\nTroubleshooting:")
    print("  1. Check your .env file exists and is readable")
    print("  2. Verify AWS credentials are correct")
    print("  3. Ensure AWS region is valid")
    print("  4. If using local DynamoDB, check it's running on port 8000")
    exit(1)

print("\n" + "=" * 60)
