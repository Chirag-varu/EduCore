output "alb_dns_name" {
  description = "DNS name of the ALB"
  value       = aws_lb.shared_alb.dns_name
}




output "alb_arn" {
  description = "ARN of the ALB"
  value       = aws_lb.shared_alb.arn
}

output "alb_zone_id" {
  description = "Route 53 zone ID of the ALB"
  value       = aws_lb.shared_alb.zone_id
}



output "alb_listener_arn" {
  value = aws_lb_listener.https.arn
}




