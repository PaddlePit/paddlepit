# PaddlePit 🏓

A modern pickleball court booking platform that simplifies court reservations, payments, and business management for players and administrators.

---

## Features

### Public Website

* Landing page
* Court information & rates
* Gallery
* Contact page
* Google Maps integration
* Business hours

### Booking System

* View available schedules
* Real-time booking calendar
* Court reservations
* Booking cancellations
* Booking history
* Multiple court support

### Admin Dashboard

* Admin dashboard
* Court management
* Booking management
* User management

### Payments

* Online payments
* Payment tracking

### Reports & Analytics

* Revenue tracking
* Daily, weekly, and monthly reports
* Analytics dashboard

### Additional Features

* Email confirmations
* Promo codes & discounts
* SMS notifications

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Radix UI

### Backend

* FastAPI
* Python
* AWS Serverless
* AWS Lambda

### Database & Storage

* Amazon DynamoDB
* Amazon S3

### Cloud Infrastructure

* AWS API Gateway
* AWS Serverless Framework
* Amazon SES
* Amazon SNS

### Payments

* PayMongo

---

## Project Structure

```text
paddlepit/
│
├── apps/
│   ├── web-app/              # Customer booking platform
│   └── admin-app/            # Business management dashboard
│
├── backend/                  # FastAPI backend service
│
├── packages/                 # Shared components and utilities
│
├── infrastructure/           # AWS deployment configuration
│
└── README.md
```

---

## Architecture

PaddlePit follows a modern full-stack architecture:

* **Web App** - Customer-facing booking experience
* **Admin App** - Business operations and analytics
* **API** - Centralized backend handling authentication, bookings, payments, and business logic
* **AWS Infrastructure** - Serverless and scalable cloud deployment

---

## Goals

* Provide a seamless court booking experience
* Enable real-time court availability
* Simplify business operations
* Support secure online payments
* Build a scalable and maintainable platform
