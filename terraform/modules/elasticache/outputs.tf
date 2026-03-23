output "endpoint" {
  value = aws_elasticache_cluster.this.cache_nodes[0].address
}

output "port" {
  value = aws_elasticache_cluster.this.port
}

output "redis_url_ssm_arn" {
  value = aws_ssm_parameter.redis_url.arn
}