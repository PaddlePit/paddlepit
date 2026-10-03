"""Script to populate test data in DynamoDB."""

from db import initialize_db
from uuid import uuid4
from datetime import datetime, timedelta

ddb = initialize_db()

# Create courts
court_table = ddb.Table("court-detail")
courts = [
    {
        "id": "court-1",
        "court_name": "Court 1",
        "hourly_rate": 500,
        "status": "available",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": "court-2",
        "court_name": "Court 2",
        "hourly_rate": 500,
        "status": "available",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": "court-3",
        "court_name": "Court 3",
        "hourly_rate": 500,
        "status": "available",
        "created_at": datetime.utcnow().isoformat()
    }
]

print("Creating courts...")
for court in courts:
    court_table.put_item(Item=court)
    print(f"✓ Created {court['court_name']}")

# Create a test booking
booking_table = ddb.Table("booking-detail")
booking_id = str(uuid4())

booking = {
    "id": booking_id,
    "booker_name": "Test User",
    "phone": "1234567890",
    "email": "test@example.com",
    "courts_reserved": ["court-1", "court-2"],
    "total_price": 1000,
    "created_at": datetime.utcnow().isoformat(),
    "updated_at": datetime.utcnow().isoformat()
}

print("\nCreating booking...")
booking_table.put_item(Item=booking)
print(f"✓ Created booking: {booking_id}")

# Create booking items (time slots)
booking_item_table = ddb.Table("booking-item")
today = datetime.utcnow()
test_date = (today + timedelta(days=3)).date()

booking_items = [
    {
        "id": str(uuid4()),
        "booking_id": booking_id,
        "court_id": "court-1",
        "start_time": datetime.fromisoformat(f"{test_date}T09:00:00").isoformat(),
        "end_time": datetime.fromisoformat(f"{test_date}T10:30:00").isoformat(),
        "price": 750,
        "version": 1,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid4()),
        "booking_id": booking_id,
        "court_id": "court-2",
        "start_time": datetime.fromisoformat(f"{test_date}T14:00:00").isoformat(),
        "end_time": datetime.fromisoformat(f"{test_date}T15:00:00").isoformat(),
        "price": 500,
        "version": 1,
        "created_at": datetime.utcnow().isoformat()
    }
]

print("\nCreating booking items...")
for item in booking_items:
    booking_item_table.put_item(Item=item)
    print(f"✓ Created booking item: {item['court_id']} on {test_date} {item['start_time'][11:16]}-{item['end_time'][11:16]}")

print("\n✓ Test data created successfully!")
print(f"\nTest availability with:")
print(f"GET /availability?start_date={test_date}&end_date={test_date}")
