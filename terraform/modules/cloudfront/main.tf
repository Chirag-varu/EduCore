resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "${var.environment}-oac"
  description                       = "OAC for ${var.environment} S3 access"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
  
}


resource "aws_cloudfront_distribution" "cdn" {
  price_class = var.cdn_config.price_class # US + Europe + India
  is_ipv6_enabled                    = true
  origin {
    domain_name = var.alb_dns_name
    origin_id   = "alb-origin"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
    custom_header {
    name  = "X-From-CloudFront"
    value = "true"
  }
    
  }

  logging_config {
  bucket          = var.cdn_config.logs_bucket_domain_name
  prefix          = "cloudfront/${var.environment}"
  include_cookies = false
}


  origin {

    domain_name = var.regional_bucket_domain_name
    origin_id   = "s3-origin"

    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id

  }



  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }


  enabled             = true
  aliases             = [var.cdn_config.domain_alias]
  default_root_object = "index.html"






  default_cache_behavior {

    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-origin"

    origin_request_policy_id = var.cdn_config.origin_request_policy_id
    cache_policy_id          = var.cdn_config.cache_policy_id

    viewer_protocol_policy = var.cdn_config.viewer_protocol_policy
    min_ttl                = 0
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    default_ttl = 86400
    max_ttl     = 31536000

  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.cdn_config.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  ordered_cache_behavior {
    path_pattern = "/api/*"
    target_origin_id = "alb-origin"
    compress = true
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    viewer_protocol_policy = "redirect-to-https"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    cache_policy_id = var.cdn_config.api_cache_policy_id
    origin_request_policy_id = var.cdn_config.api_origin_request_policy_id

  
  }
  
}

resource "aws_cloudfront_response_headers_policy" "security" {
  name = "${var.environment}-security-headers"

  security_headers_config {
    content_security_policy {
  content_security_policy = join("; ", [
        "default-src 'self'",
        "script-src 'self' https://accounts.google.com https://www.google.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com",
        "img-src 'self' data: https://www.google.com https://*.googleusercontent.com",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://accounts.google.com https://*.googleapis.com",
        "frame-src 'self' https://accounts.google.com"
      ])
      override = true
    }

    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    xss_protection {
      protection = true
      mode_block = true
      override   = true
    }
  }
}

# Update S3 bucket policy to allow only CloudFront access
resource "aws_s3_bucket_policy" "cdn_access" {
  bucket = var.s3_bucket_id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipalReadOnly"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = ["s3:GetObject"]
        Resource = "${var.s3_bucket_arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.cdn.arn
          }
        }
      }
    ]
  })
}
