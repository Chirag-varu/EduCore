variable "bucket_name" {
  description = "Name of the S3 log bucket"
  type        = string
}

variable "environment" {
  description = "Environment (prod|staging)"
  type        = string
}

variable "retention_days" {
  description = "How long to retain logs before deletion"
  type        = number
  default     = 365
}

variable "glacier_transition_days" {
  description = "Days after which logs move to Glacier"
  type        = number
  default     = 30
}
