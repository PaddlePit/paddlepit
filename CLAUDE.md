# PaddlePit — Project Context & Developer Guide

## Project Overview

Building **PaddlePit**, a booking platform for a 3-court local pickleball venue. Customers can browse courts, make real-time reservations, pay online, and receive confirmations. Admins manage bookings, courts, users, and view analytics.

- **Scale:** 3 courts, 1 location, 10–50 bookings/hour (quiet to ideal traffic)
- **Users:** End customers (booking) + business admin (operations, analytics)

---

## Tech Stack

### Frontend
- React + TypeScript
- **Tailwind CSS** + shadcn/ui + Radix UI
- Monorepo: `apps/web-app` (customer), `apps/admin-app` (business)

### Backend
- **FastAPI** + Python 3.14+ (async-first)
- **uv** for dependency management
- **Mangum** for AWS Lambda ASGI adapter
- **Pydantic** for validation/settings
- **boto3** for AWS integration

### Database & Storage
- **DynamoDB** (on-demand, fully serverless)
- **S3** for uploads (images, documents)

### Infrastructure & Deployment
- **Terraform** (IaC) — provisions DynamoDB tables, S3 buckets, IAM roles, API Gateway
- **Serverless Framework** — packages/deploys Lambda functions (integrates with Terraform-provisioned resources)
- **AWS Lambda** + **API Gateway** (serverless compute/routing)
- **SES** for transactional email

### Payments
- **PayMongo** for online transactions (client provides account/keys)

### Project Tools
- Monorepo: `packages/` for shared utilities
- `infrastructure/` for Terraform modules (currently initialized)

---

## Current Development State

### Repository Structure (Actual)
```
paddlepit/
├── apps/
│   ├── web-app/          # Customer booking interface
│   └── admin-app/        # Admin dashboard
├── backend/              # FastAPI service
│   ├── models/           # SQLModel schemas (7 core models)
│   │   ├── __init__.py
│   │   ├── admin_detail.py         # Admin (OAuth via Google)
│   │   ├── booking_detail.py       # Booking session
│   │   ├── booking_item.py         # Court reservation within booking
│   │   ├── court_detail.py         # Court info
│   │   ├── cancellation_request_detail.py
│   │   ├── discount_detail.py      # Promo codes
│   │   └── transaction_detail.py   # Payment record
│   ├── db/               # Database initialization (TBD)
│   ├── api/              # (being phased out)
│   ├── main.py           # FastAPI app entry point
│   ├── __init__.py
│   ├── pyproject.toml    # Project config, [tool.uv] package = false
│   ├── uv.lock
│   ├── requirements.txt
│   ├── README.md
│   └── venv/             # Python virtual environment
├── infrastructure/       # Terraform modules (TBD)
├── packages/             # Shared utilities (TBD)
├── README.md
├── CONTEXT.md            # Project spec (this file's source)
├── CLAUDE.md             # This file (developer guide)
└── package.json          # Monorepo root
```
---

## Features

### Customer
- Landing page, court info, rates, gallery
- Contact/Maps integration
- Business hours display
- **Real-time availability** (eventual consistency on propagation)
- Booking (single or multiple courts)
- Cancellation workflow
- Booking history
- Online payment (PayMongo)
- Payment tracking
- Email confirmations
- Promo codes/discounts

### Admin
- Dashboard (overview)
- Booking management
- Court management
- User management
- Payment history
- Revenue tracking
- Daily/weekly/monthly reports
- Analytics & court utilization

---

## Database Design

### Core Schema

**Booking** (1:N) → **BookingItem** (N:1) → **Court**

Each `Booking` represents a transaction/session. Each `BookingItem` is one court reservation within that booking.

**BookingItem** contains:
- `booking_id` (FK to Booking)
- `court_id` (FK to Court)
- `start_time`, `end_time`
- `price`

**Why:** One user can book 1, 2, or all 3 courts in a single booking. Separating into BookingItem lets us track court-specific details (price per court, duration, etc.) and calculate court utilization without a separate table.

### Models (SQLModel)

**7 Core Models:**

1. **AdminDetail** — Business admins (OAuth via Google Sign-In)
   - `id` (UUID, PK), `google_id` (unique), `name`, `email`, `created_at`
   - No passwords stored; Google OAuth only

2. **BookingDetail** — Booking session/transaction
   - `id` (UUID, PK), `booker_name`, `phone`, `email`, `courts_reserved`, `total_price`
   - `created_at`, `updated_at` (audit trail)
   - Relationships: `booking_items[]`, `transactions[]`

3. **BookingItem** — Individual court reservation within a booking
   - `id` (UUID, PK), `booking_id` (FK), `court_id` (FK)
   - `start_time`, `end_time` (datetime for time-slot accuracy)
   - `price` (per court), `version` (optimistic locking for conflict detection)
   - Relationships: `booking`, `court`

4. **CourtDetail** — Court information
   - `id` (UUID, PK), `court_name`, `hourly_rate`, `status` (available|booked|unavailable)
   - Relationships: `booking_items[]`

5. **TransactionDetail** — Payment record
   - `id` (UUID, PK), `booking_id` (FK), `public_transaction_id` (unique, nullable)
   - `payment_mode` (card|gcash|bank_transfer), `amount`, `status` (paid|refund)
   - `discount_id` (FK, nullable), `created_at`
   - Relationships: `booking`, `discount`, `cancellation_requests[]`

6. **CancellationRequestDetail** — Refund/cancellation workflow
   - `id` (UUID, PK), `transaction_id` (FK), `reason`, `status` (pending|approved|rejected)
   - `approved_by` (FK to AdminDetail, nullable), `created_at`, `updated_at`
   - Relationships: `transaction`, `admin`

7. **DiscountDetail** — Promo codes
   - `id` (UUID, PK), `coupon_code` (unique), `discount_type` (percentage|fixed_amount), `discount_value`
   - `valid_from`, `valid_until` (datetime), `usage_limit`, `times_used`, `is_active`, `created_at`
   - Relationships: `transactions[]`

**Design notes:**
- All models use UUID primary keys for scalability
- No CustomerDetail table (transient customers): booker info captured per booking, no repeat-customer profiles
- `BookingItem` pattern enables multi-court bookings (one Booking → up to 3 BookingItems)
- `version` field on BookingItem enables optimistic locking (prevents double-booking via conditional writes)

---

## INSTALLATION SETUP

### Backend

Install dependencies:
```bash
cd backend
uv sync
```

Start dev server:
```bash
uv run fastapi dev main.py
```

API: http://localhost:8000
Docs: http://localhost:8000/docs

### Frontend (TBD)
```bash
# web-app
cd apps/web-app
npm install && npm run dev

# admin-app
cd apps/admin-app
npm install && npm run dev
```

---

## Concurrency & Double-Booking Prevention

**Architecture:** Application-level optimistic locking on `BookingItem.version`.

When a user books a court time slot:
1. Read the BookingItem (or create new) with current `version` number
2. Attempt conditional write: "Update only if version == [original version]"
3. If version mismatch → write fails → conflict detected → prompt user to refresh availability

---

## Deployment 

### Local → Staging → Production

1. **Local:** `uv run fastapi dev` (hot reload, SQLite for testing)
2. **Staging (AWS Lambda):** Deploy with Serverless Framework + Terraform-provisioned DynamoDB
3. **Production:** Same Lambda setup; isolated DynamoDB tables

### Serverless Framework + Terraform

- **Terraform** (`infrastructure/`): Provisions DynamoDB tables, S3, IAM roles, API Gateway base
- **Serverless Framework** (in `backend/`): Package Lambda function, connect to Terraform-managed resources

Both read/write from same `.env` or AWS SSM Parameter Store for config (table names, API Gateway endpoint, etc.).

---