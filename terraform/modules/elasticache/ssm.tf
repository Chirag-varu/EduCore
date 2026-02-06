resource "aws_ssm_parameter" "redis_endpoint" {
  name  = "${var.ssm.base_path}/endpoint"
  type  = "String"
  value = aws_elasticache_cluster.this.cache_nodes[0].address
}

resource "aws_ssm_parameter" "redis_port" {
  name  = "${var.ssm.base_path}/port"
  type  = "String"
  value = tostring(aws_elasticache_cluster.this.port)
}

resource "aws_ssm_parameter" "redis_url" {
  name  = "${var.ssm.base_path}/redis_url"
  type  = "String"
  # Format: redis://host:port
  value = "redis://${aws_elasticache_cluster.this.cache_nodes[0].address}:${aws_elasticache_cluster.this.port}"
}