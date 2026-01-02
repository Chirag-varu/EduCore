variable "environment" {
  description = "Environment (prod|staging)"
  type        = string
  validation {
    condition     = contains(["prod", "staging"], var.environment)
    error_message = "Must be 'prod' or 'staging'."
  }
}




variable "s3_bucket_id" {
  description = "ID of the S3 bucket"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  type        = string
}

variable "regional_bucket_domain_name" {
  description = "The regional domain name of the S3 bucket"
  type        = string
}








variable "alb_dns_name" {
  description = "DNS name of the ALB"
  type        = string
}



variable "cdn_config" {
  type = object({
    domain_alias     = string
    acm_certificate_arn = string
    
    # Policies
    cache_policy_id           = optional(string, "658327ea-f89d-4fab-a63d-7e88639e58f6")
    origin_request_policy_id  = optional(string, "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf")
    api_cache_policy_id       = optional(string, "83da9c7e-98b4-4e11-a168-04f0df8e2c65")
    api_origin_request_policy_id = optional(string, "216adef6-5c7f-47e4-b989-5492eafa07d3")
    
    # Logging
    logs_bucket_domain_name = optional(string)
    
    # Behavior
    viewer_protocol_policy = optional(string, "redirect-to-https")
    price_class            = optional(string, "PriceClass_100") # or 200, All
    
    # Optional features
    enable_waf              = optional(bool, false)
    waf_web_acl_arn        = optional(string)
  })
}


