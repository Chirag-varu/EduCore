variable "environment" {
  description = "Environment (staging|prod)"
  type        = string
  validation {
    condition     = contains(["staging", "prod"], var.environment)
    error_message = "Must be 'staging' or 'prod'."
  }
}

variable "vpc_id" {
  description = "VPC ID where ALB will be deployed"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for ALB"
  type        = list(string)
}



variable "alb_acm_certificate_arn" {
  description = "ARN of ACM certificate for HTTPS (must cover both staging/prod domains)"
  type        = string
}

variable "cloudfront_prefix_list_id" {
  type = string
}

variable "alb_security_group_id" {
  description = "Security Group ID for the ALB"
  type        = string
}