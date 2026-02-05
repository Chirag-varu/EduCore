######################################
# STAGING ENVIRONMENT SECRETS
######################################

resource "github_actions_environment_secret" "staging_aws_region" {
  repository      = var.repo_name
  environment     = github_repository_environment.staging.environment
  secret_name     = "AWS_REGION"
  plaintext_value = "ap-south-1"
}

resource "github_actions_environment_secret" "staging_account_id" {
  repository      = var.repo_name
  environment     = github_repository_environment.staging.environment
  secret_name     = "AWS_ACCOUNT_ID"
  plaintext_value = "289970482897"
}

resource "github_actions_environment_secret" "staging_ecr_repo" {
  repository      = var.repo_name
  environment     = github_repository_environment.staging.environment
  secret_name     = "ECR_REPOSITORY"
  plaintext_value = "educore"
}

resource "github_actions_environment_secret" "staging_access_key" {
  repository      = var.repo_name
  environment     = github_repository_environment.staging.environment
  secret_name     = "AWS_ACCESS_KEY_ID"
  plaintext_value = var.aws_access_key_id
}

resource "github_actions_environment_secret" "staging_secret_key" {
  repository      = var.repo_name
  environment     = github_repository_environment.staging.environment
  secret_name     = "AWS_SECRET_ACCESS_KEY"
  plaintext_value = var.aws_secret_access_key
}

resource "github_actions_environment_secret" "staging_ecs_cluster" {
  repository      = var.repo_name
  environment     = github_repository_environment.staging.environment
  secret_name     = "ECS_CLUSTER_STAGING"
  plaintext_value = "caam-staging-cluster"
}

resource "github_actions_environment_secret" "staging_ecs_service" {
  repository      = var.repo_name
  environment     = github_repository_environment.staging.environment
  secret_name     = "ECS_SERVICE_STAGING"
  plaintext_value = "caam-staging-service"
}

resource "github_actions_environment_secret" "staging_task_def_family" {
  repository      = var.repo_name
  environment     = github_repository_environment.staging.environment
  secret_name     = "TASK_DEF_FAMILY"
  plaintext_value = "caam-staging-task"
}

resource "github_actions_environment_secret" "staging_container_name" {
  repository      = var.repo_name
  environment     = github_repository_environment.staging.environment
  secret_name     = "CONTAINER_NAME"
  plaintext_value = "caam-staging-container"
}

resource "github_actions_environment_secret" "staging_bucket" {
  repository      = var.repo_name
  environment     = github_repository_environment.staging.environment
  secret_name     = "S3_BUCKET_NAME_STAGING"
  plaintext_value = "caam512"
}

resource "github_actions_environment_secret" "staging_cloudfront" {
  repository      = var.repo_name
  environment     = github_repository_environment.staging.environment
  secret_name     = "CLOUDFRONT_DISTRIBUTION_ID_STAGING"
  plaintext_value = "E2GXYZ04SHOWAH"
}


######################################
# PROD ENVIRONMENT SECRETS
######################################

resource "github_actions_environment_secret" "prod_aws_region" {
  repository      = var.repo_name
  environment     = github_repository_environment.prod.environment
  secret_name     = "AWS_REGION"
  plaintext_value = "ap-south-1"
}

resource "github_actions_environment_secret" "prod_account_id" {
  repository      = var.repo_name
  environment     = github_repository_environment.prod.environment
  secret_name     = "AWS_ACCOUNT_ID"
  plaintext_value = "289970482897"
}

resource "github_actions_environment_secret" "prod_ecr_repo" {
  repository      = var.repo_name
  environment     = github_repository_environment.prod.environment
  secret_name     = "ECR_REPOSITORY"
  plaintext_value = "caam"
}

resource "github_actions_environment_secret" "prod_access_key" {
  repository      = var.repo_name
  environment     = github_repository_environment.prod.environment
  secret_name     = "AWS_ACCESS_KEY_ID"
  plaintext_value = var.aws_access_key_id
}

resource "github_actions_environment_secret" "prod_secret_key" {
  repository      = var.repo_name
  environment     = github_repository_environment.prod.environment
  secret_name     = "AWS_SECRET_ACCESS_KEY"
  plaintext_value = var.aws_secret_access_key
}

resource "github_actions_environment_secret" "prod_ecs_cluster" {
  repository      = var.repo_name
  environment     = github_repository_environment.prod.environment
  secret_name     = "ECS_CLUSTER_PROD"
  plaintext_value = "educore-cluster"
}

resource "github_actions_environment_secret" "prod_ecs_service" {
  repository      = var.repo_name
  environment     = github_repository_environment.prod.environment
  secret_name     = "ECS_SERVICE_PROD"
  plaintext_value = "educore-service"
}

resource "github_actions_environment_secret" "prod_task_def_family" {
  repository      = var.repo_name
  environment     = github_repository_environment.prod.environment
  secret_name     = "TASK_DEF_FAMILY"
  plaintext_value = "educore-task"
}

resource "github_actions_environment_secret" "prod_container_name" {
  repository      = var.repo_name
  environment     = github_repository_environment.prod.environment
  secret_name     = "CONTAINER_NAME"
  plaintext_value = "educore-container"
}

resource "github_actions_environment_secret" "prod_bucket" {
  repository      = var.repo_name
  environment     = github_repository_environment.prod.environment
  secret_name     = "S3_BUCKET_PROD"
  plaintext_value = "lms67 "
}

resource "github_actions_environment_secret" "prod_cloudfront" {
  repository      = var.repo_name
  environment     = github_repository_environment.prod.environment
  secret_name     = "CLOUDFRONT_DISTRIBUTION_ID_PROD"
  plaintext_value = "E1YIM7KZO4EV0Y"
}
