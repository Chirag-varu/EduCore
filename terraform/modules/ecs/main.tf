resource "aws_ecs_cluster" "ecs_cluster" {
  name = var.ecs_config.cluster_name
  # The setting block within the aws_ecs_cluster resource in Terraform is used to configure specific cluster-wide settings for an Amazon ECS (Elastic Container Service) cluster.
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  tags = {
    Environment = var.environment
  }
}

# Create the IAM role that the ECS task will assume
resource "aws_iam_role" "ecs_task_role" {
  name = "ecs-task-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}




# Create the IAM role that the ECS task will assume
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs-task-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Attach the standard AWS managed policy for ECS task execution
resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy_attach" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Define a custom policy for additional permissions
resource "aws_iam_role_policy" "custom_ecs_policy" {
  name = "custom-ecs-policy"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "ECRReadAccess",
        Effect = "Allow",
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ],
        Resource = "*"
      },
      {
        Sid    = "CloudWatchWriteAccess",
        Effect = "Allow",
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*" # Best practice is to limit this to a specific log group ARN
      },
      {
        Sid    = "SSMReadAccess",
        Effect = "Allow",
        Action = "ssm:GetParameters",
        Resource = "*"
      }
    ]
  })
}

# ====================
# MONGODB CONFIGURATION
# ====================
resource "aws_ssm_parameter" "mongodb_uri" {
  name  = "/${var.environment}/app/mongodb_uri"
  type  = "SecureString"
  value = var.ecs_config.secrets.mongodb_uri
}

# ====================
# JWT & SESSION SECRETS
# ====================
resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.environment}/app/jwt_secret"
  type  = "SecureString"
  value = var.ecs_config.secrets.jwt_secret
}

resource "aws_ssm_parameter" "session_secret" {
  name  = "/${var.environment}/app/session_secret"
  type  = "SecureString"
  value = var.ecs_config.secrets.session_secret
}

# ====================
# CLOUDINARY CONFIGURATION
# ====================
resource "aws_ssm_parameter" "cloudinary_cloud_name" {
  name  = "/${var.environment}/app/cloudinary_cloud_name"
  type  = "SecureString"
  value = var.ecs_config.secrets.cloudinary_cloud_name
}

resource "aws_ssm_parameter" "cloudinary_api_key" {
  name  = "/${var.environment}/app/cloudinary_api_key"
  type  = "SecureString"
  value = var.ecs_config.secrets.cloudinary_api_key
}

resource "aws_ssm_parameter" "cloudinary_api_secret" {
  name  = "/${var.environment}/app/cloudinary_api_secret"
  type  = "SecureString"
  value = var.ecs_config.secrets.cloudinary_api_secret
}

# ====================
# STRIPE CONFIGURATION
# ====================
resource "aws_ssm_parameter" "stripe_secret_key" {
  name  = "/${var.environment}/app/stripe_secret_key"
  type  = "SecureString"
  value = var.ecs_config.secrets.stripe_secret_key
}

resource "aws_ssm_parameter" "stripe_webhook_secret" {
  name  = "/${var.environment}/app/stripe_webhook_secret"
  type  = "SecureString"
  value = var.ecs_config.secrets.stripe_webhook_secret
}

# ====================
# GOOGLE OAUTH CONFIGURATION
# ====================
resource "aws_ssm_parameter" "google_client_id" {
  name  = "/${var.environment}/app/google_client_id"
  type  = "SecureString"
  value = var.ecs_config.secrets.google_client_id
}

resource "aws_ssm_parameter" "google_client_secret" {
  name  = "/${var.environment}/app/google_client_secret"
  type  = "SecureString"
  value = var.ecs_config.secrets.google_client_secret
}

# ====================
# EMAIL CONFIGURATION
# ====================
resource "aws_ssm_parameter" "email_address" {
  name  = "/${var.environment}/app/email_address"
  type  = "SecureString"
  value = var.ecs_config.secrets.email_address
}

resource "aws_ssm_parameter" "email_password" {
  name  = "/${var.environment}/app/email_password"
  type  = "SecureString"
  value = var.ecs_config.secrets.email_password
}

resource "aws_ssm_parameter" "email_service" {
  name  = "/${var.environment}/app/email_service"
  type  = "String"  # Not sensitive
  value = var.ecs_config.secrets.email_service
}

# ====================
# PAYPAL CONFIGURATION
# ====================
resource "aws_ssm_parameter" "paypal_client_id" {
  name  = "/${var.environment}/app/paypal_client_id"
  type  = "SecureString"
  value = var.ecs_config.secrets.paypal_client_id
}

resource "aws_ssm_parameter" "paypal_secret_id" {
  name  = "/${var.environment}/app/paypal_secret_id"
  type  = "SecureString"
  value = var.ecs_config.secrets.paypal_secret_id
}

# ====================
# APP CONFIGURATION (Non-sensitive)
# ====================
resource "aws_ssm_parameter" "node_env" {
  name  = "/${var.environment}/app/node_env"
  type  = "String"
  value = var.ecs_config.environment
}

resource "aws_ssm_parameter" "port" {
  name  = "/${var.environment}/app/port"
  type  = "String"
  value = var.ecs_config.port
}

resource "aws_ssm_parameter" "api_url" {
  name  = "/${var.environment}/app/api_url"
  type  = "String"
  value = var.ecs_config.api_url
}

resource "aws_ssm_parameter" "client_url" {
  name  = "/${var.environment}/app/client_url"
  type  = "String"
  value = var.ecs_config.client_url
}



resource "aws_cloudwatch_log_group" "ecs_app_logs" {
  name              = var.ecs_config.logging.log_group
  retention_in_days = 7

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}


resource "aws_ecs_task_definition" "this" {
  family                   = var.ecs_config.task.family
  cpu                      = var.ecs_config.task.cpu
  memory                   = var.ecs_config.task.memory
  network_mode             = var.ecs_config.task.network_mode
  requires_compatibilities = var.ecs_config.task.compatibilities

  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = var.ecs_config.container.name
    image     = var.ecs_config.container.image
    cpu       = var.ecs_config.container.cpu
    memory    = var.ecs_config.container.memory
    essential = true

    portMappings = [{
      containerPort = var.ecs_config.container.port
      protocol      = "tcp"
    }]

    # 1. Added closing parenthesis for concat
    # 2. Corrected list comprehension syntax for external_secrets
    secrets = concat(
      [
        { name = "PORT", valueFrom = aws_ssm_parameter.port.arn },
        { name = "NODE_ENV", valueFrom = aws_ssm_parameter.node_env.arn },
        { name = "MONGO_URI", valueFrom = aws_ssm_parameter.mongodb_uri.arn },
        { name = "JWT_SECRET", valueFrom = aws_ssm_parameter.jwt_secret.arn },
        { name = "SESSION_SECRET", valueFrom = aws_ssm_parameter.session_secret.arn },
        { name = "CLOUDINARY_CLOUD_NAME", valueFrom = aws_ssm_parameter.cloudinary_cloud_name.arn },
        { name = "CLOUDINARY_API_KEY", valueFrom = aws_ssm_parameter.cloudinary_api_key.arn },
        { name = "CLOUDINARY_API_SECRET", valueFrom = aws_ssm_parameter.cloudinary_api_secret.arn },
        { name = "STRIPE_SECRET_KEY", valueFrom = aws_ssm_parameter.stripe_secret_key.arn },
        { name = "WEBHOOK_ENDPOINT_SECRET", valueFrom = aws_ssm_parameter.stripe_webhook_secret.arn },
        { name = "API_URL", valueFrom = aws_ssm_parameter.api_url.arn },
        { name = "CLIENT_URL", valueFrom = aws_ssm_parameter.client_url.arn },
        { name = "GOOGLE_CLIENT_ID", valueFrom = aws_ssm_parameter.google_client_id.arn },
        { name = "GOOGLE_CLIENT_SECRET", valueFrom = aws_ssm_parameter.google_client_secret.arn },
        { name = "EMAIL", valueFrom = aws_ssm_parameter.email_address.arn },
        { name = "EMAIL_PASSWORD", valueFrom = aws_ssm_parameter.email_password.arn },
        { name = "EMAIL_SERVICE", valueFrom = aws_ssm_parameter.email_service.arn },
        { name = "PAYPAL_CLIENT_ID", valueFrom = aws_ssm_parameter.paypal_client_id.arn },
        { name = "PAYPAL_SECRET_ID", valueFrom = aws_ssm_parameter.paypal_secret_id.arn },
       
      ],
      [for name, arn in var.external_secrets : { name = name, valueFrom = arn }]
    )

    # 3. Added missing environment list structure
    environment = [
      {
        name  = "SECRET_KEY"
        value = var.ecs_config.secrets.jwt_secret
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.ecs_app_logs.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = var.ecs_config.container.name
      }
    }
  }])
}



resource "aws_appautoscaling_target" "ecs" {
  count = var.ecs_config.autoscaling.enabled ? 1 : 0

  max_capacity       = var.ecs_config.autoscaling.max
  min_capacity       = var.ecs_config.autoscaling.min
  resource_id        = "service/${aws_ecs_cluster.ecs_cluster.name}/${aws_ecs_service.this.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  count = var.ecs_config.autoscaling.enabled ? 1 : 0

  name               = "${var.ecs_config.service_name}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs[0].service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = var.ecs_config.autoscaling.cpu_target

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_policy" "memory" {
  count = var.ecs_config.autoscaling.enabled ? 1 : 0

  name               = "${var.ecs_config.service_name}-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs[0].service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = var.ecs_config.autoscaling.memory_target

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
  }
}


resource "aws_ecs_service" "this" {
  name            = var.ecs_config.service_name
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.this.id
  desired_count   = var.ecs_config.autoscaling.min
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.networking.subnet_ids
    security_groups  = var.networking.security_group_ids
    assign_public_ip = var.networking.assign_public_ip
  }

  load_balancer {
    target_group_arn = var.load_balancer.target_group_arn
    container_name   = var.ecs_config.container.name
    container_port   = var.ecs_config.container.port
  }
}
