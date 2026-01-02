resource "aws_s3_bucket" "frontend" {
  bucket        = var.s3_config.bucket_name
  force_destroy = true
 
  tags = {
    Name        = "${var.s3_config.bucket_name}-${var.s3_config.environment}"
    Environment = var.s3_config.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket_website_configuration" "frontend_website" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "env_js" {
  bucket = var.s3_config.bucket_name
  key    = "env.js"
  content = templatefile("${path.module}/env.js.tmpl", {
    BACKEND_URL = var.s3_config.environment == "prod" ? "https://615915.xyz" : "https://staging.615915.xyz"
  })

  content_type = "application/javascript"
  depends_on   = [aws_s3_bucket.frontend]
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "this" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"
     filter {}
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}







# resource "local_file" "env_js" {
#   content = <<EOF
# window._env_ = {
#   BACKEND_URL: "${api-}"
# };
# EOF

#   filename = "${path.module}/dist/env.js"
# }
# resource "aws_s3_object" "env_js" {
#   bucket = aws_s3_bucket.frontend-bucket.id
#   key    = "env.js"
#   source = local_file.env_js.filename
#   content_type = "application/javascript"
#  # acl    = "public-read"
# }

