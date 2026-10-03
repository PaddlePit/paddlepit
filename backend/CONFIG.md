# Configuration Guide

This document explains how to configure PaddlePit using environment variables.

## Overview

All environment variables are defined in `config.py` using Pydantic's `BaseSettings`. This provides:
- ✅ Type validation
- ✅ Default values
- ✅ Easy access throughout the app
- ✅ Environment separation (dev/staging/prod)

## Setup

### 1. Create `.env` file

Copy `.env.example` to `.env`:

```bash
cp backend/.env.example backend/.env
```

### 2. Fill in your values

Edit `backend/.env` with your actual configuration:

```bash
# Required for all environments
DB_REGION_NAME=us-east-1
DB_ACCESS_KEY_ID=your_aws_access_key
DB_SECRET_ACCESS_KEY=your_aws_secret_key
PAYMONGO_SECRET_KEY=sk_test_xxx
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
JWT_SECRET_KEY=your_super_secret_key

# Optional (defaults provided)
DEBUG=False
ENVIRONMENT=development
```

### 3. Using in your app

```python
from config import get_settings

settings = get_settings()

# Access any setting
print(settings.DB_REGION_NAME)
print(settings.PAYMONGO_SECRET_KEY)
print(settings.JWT_SECRET_KEY)
```

## Environment-Specific Setup

### Development

```bash
# backend/.env
ENVIRONMENT=development
DEBUG=True
DYNAMODB_ENDPOINT_URL=http://localhost:8000  # If using local DynamoDB
```

### Staging

```bash
# backend/.env (or use AWS Parameter Store)
ENVIRONMENT=staging
DEBUG=False
DB_REGION_NAME=us-east-1
```

### Production

```bash
# Use AWS Secrets Manager or Parameter Store (NEVER commit secrets)
ENVIRONMENT=production
DEBUG=False
```

## Frontend Configuration

### Web App

Create `apps/web-app/.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_PAYMONGO_PUBLIC_KEY=pk_test_xxx
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Admin App

Create `apps/admin-app/.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

## Variable Categories

### Database (DynamoDB)
- `DB_REGION_NAME` — AWS region
- `DB_ACCESS_KEY_ID` — AWS access key
- `DB_SECRET_ACCESS_KEY` — AWS secret key
- `DYNAMODB_ENDPOINT_URL` — Local development only

### S3
- `S3_BUCKET_NAME` — Bucket for uploads
- `S3_UPLOADS_DIR` — Folder prefix in bucket

### Email (SES)
- `SES_SENDER_EMAIL` — From address
- `SES_REGION_NAME` — AWS region

### Payments (PayMongo)
- `PAYMONGO_SECRET_KEY` — Server-side secret
- `PAYMONGO_PUBLIC_KEY` — Client-side public key
- `PAYMONGO_WEBHOOK_SECRET` — Webhook verification

### Authentication
- `GOOGLE_CLIENT_ID` — Google OAuth
- `GOOGLE_CLIENT_SECRET` — Google OAuth secret
- `GOOGLE_REDIRECT_URI` — OAuth callback URL
- `JWT_SECRET_KEY` — JWT signing key
- `JWT_EXPIRATION_HOURS` — Token lifetime

### CORS
- `CORS_ORIGINS` — Allowed origins (list format)

### API
- `API_DOCS_ENABLED` — Enable /docs
- `API_REDOC_ENABLED` — Enable /redoc

## Security Best Practices

### ✅ DO
- Use `.env` files for **local development only**
- Add `.env` to `.gitignore` (never commit secrets)
- Use AWS Secrets Manager for production
- Rotate keys regularly
- Use strong random JWT_SECRET_KEY

### ❌ DON'T
- Commit `.env` files
- Use same secrets for dev/prod
- Hardcode secrets in code
- Share credentials in Slack/email

## Local DynamoDB (Development)

To use local DynamoDB instead of AWS:

1. Install Docker: https://docs.docker.com/get-docker/
2. Run: `docker run -p 8000:8000 amazon/dynamodb-local`
3. Set in `.env`:
   ```
   DYNAMODB_ENDPOINT_URL=http://localhost:8000
   ```

## Troubleshooting

### "ModuleNotFoundError: No module named 'pydantic_settings'"

Install the dependency:
```bash
uv add pydantic-settings
```

### Settings not loading

Check:
1. `.env` file exists in project root
2. Variables are in `KEY=VALUE` format
3. No quotes around values (unless needed)
4. Restart your app after changing `.env`

### "None" values in settings

Check if variable is set in `.env` and that the app reloaded.

## Accessing Settings

```python
# In any module
from config import get_settings

settings = get_settings()

# These are validated and type-safe
api_key = settings.PAYMONGO_SECRET_KEY  # str
debug = settings.DEBUG  # bool
origins = settings.CORS_ORIGINS  # list[str]
```

## Production Deployment

For Lambda/production:

1. **Use AWS Systems Manager Parameter Store:**
   ```python
   import boto3
   ssm = boto3.client('ssm')
   secret = ssm.get_parameter(Name='/paddlepit/prod/db-key')
   ```

2. **Or AWS Secrets Manager:**
   ```python
   import json
   import boto3
   secrets = boto3.client('secretsmanager')
   secret = secrets.get_secret_value(SecretId='paddlepit-prod-secrets')
   ```

3. **Or set Lambda environment variables** in AWS console / Terraform

See `DEPLOYMENT.md` for more details.
