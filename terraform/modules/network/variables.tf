


variable "region" {
  type        = string
  description = "AWS Region"
}

variable "public_subnets" {
  description = "Map of public subnets with their CIDR and AZ"
  type = map(object({
    cidr = string
    az   = string
  }))
  
  default = {
    "public-ap-south-1a" = {
      cidr = "10.0.1.0/24"
      az   = "ap-south-1a"
    }
    "public-ap-south-1b" = {
      cidr = "10.0.2.0/24"
      az   = "ap-south-1b"
    }
  }
  
  validation {
    condition = length(var.public_subnets) >= 1
    error_message = "At least one public subnet is required."
  }
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



variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["staging", "prod"], var.environment)
    error_message = "Must be staging or prod"
  }
}

