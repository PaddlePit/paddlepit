---
name: documenting-api-endpoints
description: Use when creating any new FastAPI endpoint before marking the task complete
---

# Documenting API Endpoints

## Overview

Every FastAPI endpoint must be documented in `API.md` at project root **before the endpoint is considered complete.** This ensures the entire team has a single source of truth for all available APIs.

**Core principle:** No endpoint is done until it's documented.

## When to Use

- Creating a new endpoint (POST, GET, PUT, DELETE, PATCH)
- Modifying an existing endpoint's signature, parameters, or response shape
- Adding query parameters or optional fields
- Before marking a PR as ready for review

## The Template

Add your endpoint to `API.md` using this exact format:

```markdown
## METHOD /endpoint-path
**Purpose:** One-sentence description of what this endpoint does.  
**Required Data:**
- `field_name` (type): Description
- `another_field` (type): Description

**Response Data:**
- `response_field` (type): Description
- `another_response_field` (type): Description
```

### Format Rules

1. **Heading:** `## METHOD /path` (e.g., `## GET /booking`, `## POST /courts`)
2. **Purpose:** Exactly one sentence. Answer: "What does this endpoint do?"
3. **Required Data:** Only include if the endpoint accepts a request body or query parameters
   - Format: `field_name` (type): description
   - Types: Use Python type hints (str, int, float, bool, UUID, datetime, list[T], dict)
4. **Response Data:** Fields in the response object with their types
   - Format: `field_name` (type): description

### Example

```markdown
## GET /booking/{transaction_id}
**Purpose:** Retrieve a specific booking with formatted dates and times.  
**Required Data:**
- `transaction_id` (str): Public transaction ID for the booking

**Response Data:**
- `public_transaction_id` (str): Public-facing transaction identifier
- `email` (str): Booker's email address
- `status` (str): Booking status (confirmed, cancelled, pending)
- `bookings` (list[dict]): Array of booking details with court, date, and time slots
```

## The Checklist

When you create an endpoint, complete these steps **before opening a PR:**

- [ ] Endpoint is fully implemented and tested
- [ ] Open `API.md` in your editor
- [ ] Find or create the section for your endpoint's method + path
- [ ] Write the one-sentence purpose
- [ ] List all required fields with types
- [ ] List all response fields with types
- [ ] Verify no fields are missing or incorrectly typed
- [ ] If modifying existing endpoint, update its entry

## Common Mistakes

**❌ Forgetting the types:**
```
- `booking_id`: ID of the booking
```

**✅ Include types:**
```
- `booking_id` (UUID): ID of the booking
```

---

**❌ Multi-sentence purpose:**
```
Purpose: This endpoint retrieves a specific booking by transaction ID. It validates the ID and formats all dates. It also sanitizes email addresses.
```

**✅ One sentence only:**
```
Purpose: Retrieve a specific booking with formatted dates and times.
```

---

**❌ Vague field descriptions:**
```
- `bookings` (list): The bookings
```

**✅ Clear descriptions:**
```
- `bookings` (list[dict]): Array of booking objects with court name, date, start time, and end time
```

## Red Flags — STOP and Document

If you catch yourself thinking any of these, stop and add the documentation now:

- "I'll document it later" ← Document it now
- "It's a small endpoint" ← All endpoints get documented
- "The code is self-explanatory" ← Code isn't visible in API.md; document it
- "I'll add it when I update the README" ← Add it now; don't batch
- "This is just a fix" ← If the signature changed, update the entry

## See Also

- [API.md template](../../API.md) — Living document with all endpoints
- PaddlePit CLAUDE.md — Project conventions
