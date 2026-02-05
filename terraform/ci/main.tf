# main.tf
terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  token = var.github_token  # PAT with repo + admin:repo_hook + workflow + secrets access
  owner = "skymonil"
}
