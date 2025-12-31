variable "environment" {
  type = string
  validation {
    condition     = contains(["staging", "prod"], var.environment)
    error_message = "Must be staging or prod"
  }
}


variable "aws_region" {
  type = string
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


variable "load_balancer" {
  description = "Load balancer integration"
  type = object({
    target_group_arn = string
  })
}


variable "networking" {
  type = object({
    subnet_ids         = list(string)
    security_group_ids = list(string)
    assign_public_ip   = bool
  })
}
#################################
# Load balancer
#################################



