output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.caam_vpc.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs (for backward compatibility)"
  value       = [for subnet in aws_subnet.public_subnet : subnet.id]  # ✅ Returns list
}

# Optional: Also output as map for other uses
output "public_subnet_ids_map" {
  description = "Map of public subnet IDs with names"
  value       = { for k, subnet in aws_subnet.public_subnet : k => subnet.id }
}


