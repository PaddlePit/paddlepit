module "dynamodb" {
  source = "./dynamodb"
}

module "s3" {
  source = "./s3"
}

module "ses" {
  source = "./ses"
}
