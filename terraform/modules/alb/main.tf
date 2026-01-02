resource "aws_lb" "shared_alb" {
  name               = "shared-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids


  enable_deletion_protection = false

  tags = {
    Name        = "shared-${var.environment}-alb"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}











resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.shared_alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.alb_acm_certificate_arn

  default_action {
    type             = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}