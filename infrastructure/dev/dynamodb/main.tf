resource "aws_dynamodb_table" "dev-admin-table" {
  name         = "admin-detail"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "google_id"
    type = "S"
  }

  global_secondary_index {
    name            = "GoogleIdIndex"
    hash_key        = "google_id"
    projection_type = "ALL"
  }

  tags = {
    Name        = "admin"
    Environment = "dev"
  }
}

resource "aws_dynamodb_table" "dev-booking-table" {
  name         = "booking-detail"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name        = "booking"
    Environment = "dev"
  }
}

resource "aws_dynamodb_table" "dev-booking-item-table" {
  name         = "booking-item"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "booking_id"
    type = "S"
  }

  attribute {
    name = "court_id"
    type = "S"
  }

  global_secondary_index {
    name            = "BookingIdIndex"
    hash_key        = "booking_id"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "CourtIdIndex"
    hash_key        = "court_id"
    projection_type = "ALL"
  }

  tags = {
    Name        = "booking item"
    Environment = "dev"
  }
}

resource "aws_dynamodb_table" "dev-cancellation-req-table" {
  name         = "cancellation-request-detail"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "transaction_id"
    type = "S"
  }

  global_secondary_index {
    name            = "TransactionIdIndex"
    hash_key        = "transaction_id"
    projection_type = "ALL"
  }

  tags = {
    Name        = "cancellation request"
    Environment = "dev"
  }
}

resource "aws_dynamodb_table" "dev-court-table" {
  name         = "court-detail"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name        = "court"
    Environment = "dev"
  }
}

resource "aws_dynamodb_table" "dev-discount-table" {
  name         = "discount-detail"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "coupon_code"
    type = "S"
  }

  global_secondary_index {
    name            = "CouponCodeIndex"
    hash_key        = "coupon_code"
    projection_type = "ALL"
  }

  tags = {
    Name        = "discount"
    Environment = "dev"
  }
}

resource "aws_dynamodb_table" "dev-transaction-table" {
  name         = "transaction-detail"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "booking_id"
    type = "S"
  }

  attribute {
    name = "discount_id"
    type = "S"
  }

  global_secondary_index {
    name            = "BookingIdIndex"
    hash_key        = "booking_id"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "DiscountIdIndex"
    hash_key        = "discount_id"
    projection_type = "ALL"
  }

  tags = {
    Name        = "transaction"
    Environment = "dev"
  }
}