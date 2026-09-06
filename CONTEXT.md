I'm building PaddlePit, a 3-court local pickleball booking platform.

STACK:
- Next.js + React + TypeScript
- Tailwind CSS + shadcn/ui + Radix UI
- FastAPI + Python + Uvicorn
- AWS Lambda + API Gateway
- DynamoDB + S3
- Terraform
- SES for email
- PayMongo for payments
- uv for Python dependency management

REPO:
paddlepit/
├── apps/
│   ├── web-app/
│   └── admin-app/
├── api/
├── packages/
├── infrastructure/
├── package.json
├── package-lock.json
└── README.md

One centralized FastAPI backend serves both web-app and admin-app.

BACKEND:
api/
├── .venv/
├── src/
│   └── paddlepit/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       ├── presentation/
│       └── main.py
├── tests/
├── pyproject.toml
└── uv.lock

Use Clean Architecture. Imports use `paddlepit.domain...`, not `src.paddlepit...`.
Run backend with `uv run fastapi dev`.

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

WIRE FRAME:
Initial wireframes exist for desktop and mobile. They are NOT final designs.
Branding, logo, content, images, pricing, and business info are currently mock/pending client assets.
Client PDF presentation includes:
- Project overview
- Tech stack
- Customer/admin user flow
- Wireframe disclaimer
- Desktop wireframes
- Mobile wireframes
- Admin wireframes

CLIENT CONTRACT:
Total = ₱28,000.
- ₱8,000 downpayment upon signing
- ₱20,000 final payment upon completion of agreed scope + production deployment
- Up to ₱2,000 of the ₱28,000 is reserved for project expenses such as domain/minor third-party/deployment costs
- Expenses above ₱2,000 require client approval
- Project officially starts after signing + ₱8,000 payment
- Wireframe/proposal work before signing does not count as development start
- Client pays recurring AWS, domain, email, PayMongo transaction fees, etc.
- Client provides branding, logos, content, pricing, business information, policies, payment accounts, etc.
- Client receives source code/repository and project access after full payment
- Developers retain appropriate technical access for maintenance/bug fixing
- 2-month free bug-fix warranty after production deployment
- New features/change requests are not covered by warranty and may incur additional fees
- SMS is not included
- Deadline is still being finalized with the client

DEVELOPMENT PHILOSOPHY:
Build a practical, maintainable, responsive, cost-efficient system for a small local business. Avoid unnecessary enterprise complexity and overengineering.
