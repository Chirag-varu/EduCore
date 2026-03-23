
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
    tags = optional(map(string), {})
  })
}
