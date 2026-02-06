variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "redis_cluster_name" {
  description = "Logical name for the Redis cluster"
  type        = string
}

variable "redis" {
  description = "ElastiCache Redis configuration"
  type = object({
    node_type        = string
    port             = optional(number, 6379)
    engine_version   = optional(string, "7.0")
    num_nodes        = optional(number, 1)

    # HA / scaling (future-proof)
    automatic_failover = optional(bool, false)
    multi_az           = optional(bool, false)

    # Security
    at_rest_encryption = optional(bool, true)
    transit_encryption = optional(bool, true)

    # Maintenance
    maintenance_window = optional(string)
  })
}

variable "external_secrets" {
  description = "SSM ARNs for external dependencies"
  type        = map(string)
  default     = {}
}

variable "networking" {
  description = "Networking configuration"
  type = object({
    subnet_ids         = list(string)
    security_group_ids = list(string)
  })
}

variable "ssm" {
  description = "SSM parameter configuration"
  type = object({
    base_path = string
  })
}
