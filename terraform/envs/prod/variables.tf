variable "region" {
  type    = string
  default = ""
}

variable "environment" {
  type    = string
  default = "prod"
}







variable "vpc" {
  type = object({
    name       = string
    cidr_block = string

    public_subnets = optional(map(object({
      cidr = string
      az   = string
      tags = optional(map(string), {})
    })), {})

  })
}

variable "s3_config" {
  description = "S3 bucket configuration"
  type = object({
    versioning = bool
    logging = optional(object({
      target_bucket = string
      target_prefix = string
    }))
    bucket_name = string
    backend_url = string
    environment = string
    tags        = optional(map(string), {})
  })
}

variable "cloudfront_prefix_list_id" {
  description = "The prefix list ID for CloudFront"
  type        = string
}



variable "cdn_config" {
  type = object({
    domain_alias        = string
    acm_certificate_arn = string

    # Policies
    cache_policy_id              = optional(string, "658327ea-f89d-4fab-a63d-7e88639e58f6")
    origin_request_policy_id     = optional(string, "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf")
    api_cache_policy_id          = optional(string, "83da9c7e-98b4-4e11-a168-04f0df8e2c65")
    api_origin_request_policy_id = optional(string, "216adef6-5c7f-47e4-b989-5492eafa07d3")

    # Logging
    logs_bucket_domain_name = optional(string)

    # Behavior
    viewer_protocol_policy = optional(string, "redirect-to-https")
    price_class            = optional(string, "PriceClass_100") # or 200, All

    # Optional features
    enable_waf      = optional(bool, false)
    waf_web_acl_arn = optional(string)
  })
}



variable "ecs_config" {
  description = "ECS application configuration"
  type = object({
    cluster_name = string
    service_name = string

    task = object({
      family          = string
      cpu             = number
      memory          = number
      # Setting defaults means you don't HAVE to put them in .tfvars
      network_mode    = optional(string, "awsvpc")           
      compatibilities = optional(list(string), ["FARGATE"])
    })

    container = object({
      name   = string
      image  = string
      port   = number
      cpu    = number
      memory = number
    })

    logging = object({
      log_group = string
    })

    autoscaling = optional(object({
      enabled       = bool
      min           = number
      max           = number
      cpu_target    = number
      memory_target = number
    }), {
      enabled = false
      min     = 1
      max     = 3
      cpu_target = 70
      memory_target = 75
    })

    # Make secrets optional with defaults
    secrets = optional(object({
      mongodb_uri            = optional(string, "")
      jwt_secret             = optional(string, "")
      session_secret         = optional(string, "")
      cloudinary_cloud_name  = optional(string, "")
      cloudinary_api_key     = optional(string, "")
      cloudinary_api_secret  = optional(string, "")
      stripe_secret_key      = optional(string, "")
      stripe_webhook_secret  = optional(string, "")
      google_client_id       = optional(string, "")
      google_client_secret   = optional(string, "")
      email_address          = optional(string, "")
      email_password         = optional(string, "")
      email_service          = optional(string, "gmail")
      paypal_client_id       = optional(string, "")
      paypal_secret_id       = optional(string, "")
    }), {})

    # App configuration with defaults
    environment = optional(string, "production")
    port        = optional(number, 5000)
    api_url     = optional(string, "")
    client_url  = optional(string, "")
  })
  
  # This marks the entire variable as sensitive
  sensitive = true
}


# Networking
variable "assign_public_ip" {
  description = "Whether to assign a public IP to the ECS task."
  type        = bool
  default     = true
}

# Launch type (you can remove this if always using FARGATE)
variable "service_launch_type" {
  description = "The launch type for the ECS service (e.g., FARGATE or EC2)."
  type        = string
  default     = "FARGATE"
}

variable "log_group" {
  description = "The CloudWatch log group for the ECS task."
  type        = string
}








variable "enable_autoscaling" {
  description = "Enable ECS service autoscaling"
  type        = bool
  default     = false
}

variable "cpu_target_value" {
  description = "Target CPU utilization percentage"
  type        = number
  default     = 70
}

variable "memory_target_value" {
  description = "Target memory utilization percentage"
  type        = number
  default     = 75
}





