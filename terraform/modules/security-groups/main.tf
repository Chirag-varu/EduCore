
resource "aws_security_group" "alb_sg"{
name = "alb-sg"
description = "ALB Security Group"
vpc_id = var.vpc_id

 ingress {
    description      = "Allow HTTP/HTTPS from CloudFront"
    from_port        = 80
    to_port          = 443  # Range from 80 to 443
    protocol         = "tcp"
    prefix_list_ids  = [var.cloudfront_prefix_list_id]
  }

 egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

 tags = local.common_tags
}

#################################
# ECS Security Group
#################################

resource "aws_security_group" "ecs_sg" {
  name        = "ecs-sg"
  description = "ECS Security Group"
  vpc_id      = var.vpc_id

  ingress {
    description = "Allow traffic from ALB"
    from_port   = var.container_port
    to_port     = var.container_port
    protocol    = "tcp"
    security_groups = [aws_security_group.alb_sg.id] # ✅ Accept traffic only from ALB SG
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
    tags = local.common_tags
}

#################################
# Locals
#################################
locals {
  common_tags = {
    Environment = var.environment
    ManagedBy  = "Terraform"
    Component  = "security"
  }
}