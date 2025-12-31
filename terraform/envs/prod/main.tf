


# Prevent accidental deletion


module "network" {
  source      = "../../modules/network"
  vpc         = var.vpc
  environment = var.environment
  region      = var.region


}

module "s3" {
  source    = "../../modules/s3"
  s3_config = var.s3_config
}

module "cloudfront_logs" {
  source = "../../modules/s3-logs"
  providers = {
    aws = aws.us_east_1
  }
  bucket_name = "prod-caam-cloudfront-logs-us-east-1"
  environment = var.environment
}

module "cdn" {
  source        = "../../modules/cloudfront"
  cdn_config    = var.cdn_config
  s3_bucket_id  = module.s3.bucket_id
  s3_bucket_arn = module.s3.bucket_arn
  environment   = var.environment
  alb_dns_name  = module.alb.alb_dns_name
  regional_bucket_domain_name = module.s3.s3_bucket_regional_domain_name
}

resource "aws_s3_bucket_policy" "cf_access" {
  bucket = module.s3.bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipalReadOnly"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = ["s3:GetObject"]
        Resource = "${module.s3.bucket_arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = module.cdn.cloudfront_distribution_arn
          }
        }
      }
    ]
  })
}


resource "aws_lb_listener_rule" "prod_rule" {
  listener_arn = module.alb.alb_listener_arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_prod.arn
  }

  condition {
    host_header {
      values = ["615915.xyz"]
    }
  }
}

resource "aws_lb_target_group" "backend_prod" {
  name        = "backend-${var.environment}-tg"
  port        = 5000
  protocol    = "HTTP"
  vpc_id      = module.network.vpc_id
  target_type = "ip"
  health_check {
    path = "/health"
    port = "5000"
  }

  tags = {
    Environment = "prod"
  }
}

module "security_groups" {
  source                    = "../../modules/security-groups"
  vpc_id                    = module.network.vpc_id
  environment               = var.environment
  container_port            = var.ecs_config.container.port
  cloudfront_prefix_list_id = var.cloudfront_prefix_list_id
}

module "alb" {
  source                    = "../../modules/alb"
  vpc_id                    = module.network.vpc_id
  public_subnet_ids         =  module.network.public_subnet_ids
  environment               = var.environment
  alb_acm_certificate_arn   = "arn:aws:acm:ap-south-1:289970482897:certificate/421e47f3-ec88-43fe-a58e-2d3f4bcb5f36"
  cloudfront_prefix_list_id = var.cloudfront_prefix_list_id
  alb_security_group_id     = module.security_groups.alb_security_group_id
}




module "ecs" {
  source      = "../../modules/ecs"
  environment = var.environment
  aws_region  = var.region

  ecs_config = var.ecs_config

  networking = {
    subnet_ids         = module.network.public_subnet_ids
    security_group_ids = [module.security_groups.ecs_security_group_id]
     assign_public_ip   = true
  }

  load_balancer = {
    target_group_arn = aws_lb_target_group.backend_prod.arn
  } 
  }