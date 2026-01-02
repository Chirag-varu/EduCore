variable "vpc_id" {
  description = "VPC ID where security groups will be created"
  type        = string
}

variable "environment" {
  description = "Deployment environment (staging|prod)"
  type        = string

  validation {
    condition     = contains(["staging", "prod"], var.environment)
    error_message = "Environment must be staging or prod"
  }
}

variable "container_port" {
  description = "Port on which ECS container listens"
  type        = number
}

variable "cloudfront_prefix_list_id" {
  description = "AWS-managed prefix list ID for CloudFront"
  type        = string
}