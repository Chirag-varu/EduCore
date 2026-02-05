# environments.tf
resource "github_repository_environment" "staging" {
  repository  = var.repo_name
  environment = "staging"
}

resource "github_repository_environment" "prod" {
  repository  = var.repo_name
  environment = "prod"
}
