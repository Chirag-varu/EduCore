resource "aws_elasticache_subnet_group" "this" {
    name       = "${var.redis_cluster_name}-${var.environment}-subnet-group"
    subnet_ids = var.networking.subnet_ids
}

resource "aws_elasticache_cluster" "this" {
  cluster_id           = "${var.redis_cluster_name}-${var.environment}"
  engine               = "redis"
  engine_version       = var.redis.engine_version
  node_type            = var.redis.node_type
  num_cache_nodes      = var.redis.num_nodes
  port                 = var.redis.port

  subnet_group_name    = aws_elasticache_subnet_group.this.name
  security_group_ids   = var.networking.security_group_ids

  tags = {
    Name        = var.redis_cluster_name
    Environment = var.environment
    ManagedBy  = "Terraform"
  }
}