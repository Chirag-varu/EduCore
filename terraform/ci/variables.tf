# variables.tf
variable "github_token" {
  description = "GitHub Personal Access Token"
  sensitive   = true
}

variable "repo_name" {
  default = "my-aws-ecs-app"
}

variable "aws_access_key_id"{
 description = "AWS ACCESS KEY ID"
  sensitive   = true
}

variable "aws_secret_access_key"{
 description = "aws_secret_access_key"
  sensitive   = true
}