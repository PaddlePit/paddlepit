I'm building PaddlePit, a 3-court local pickleball booking platform.

STACK:
- Next.js + React + TypeScript
- Tailwind CSS + shadcn/ui + Radix UI
- FastAPI + Python + Uvicorn
- AWS Lambda + API Gateway
- DynamoDB + S3
- SES for email
- PayMongo for payments
- uv for Python dependency management

FEATURES:
Customer:
- Landing page
- Courts/rates
- Gallery
- Contact/Maps
- Business hours
- Real-time availability
- Booking
- Multiple court booking
- Cancellation
- Booking history
- Online payment
- Payment tracking
- Email confirmation
- Promo codes/discounts

Admin:
- Dashboard
- Booking management
- Court management
- User management
- Payments
- Revenue
- Daily/weekly/monthly reports
- Analytics
- Court utilization

SMS notifications are intentionally excluded.

DATABASE:
Booking 1:N BookingItem N:1 Court.

BookingItem contains:
- booking_id
- court_id
- start_time
- end_time
- price

One booking can contain 1, 2, or all 3 courts.

Court utilization is calculated from BookingItem data; no separate utilization table is needed.

DEVELOPMENT PHILOSOPHY:
Build a practical, maintainable, responsive, cost-efficient system for a small local business. Avoid unnecessary enterprise complexity and overengineering.
