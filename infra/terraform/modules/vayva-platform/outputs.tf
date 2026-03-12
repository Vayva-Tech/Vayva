# Outputs for Vayva Platform Module

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR Block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "Public Subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private Subnet IDs"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "Database Subnet IDs"
  value       = aws_subnet.database[*].id
}

output "ecs_cluster_name" {
  description = "ECS Cluster Name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS Cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "alb_dns_name" {
  description = "ALB DNS Name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB Zone ID"
  value       = aws_lb.main.zone_id
}

output "blue_target_group_arn" {
  description = "Blue Target Group ARN"
  value       = aws_lb_target_group.blue.arn
}

output "green_target_group_arn" {
  description = "Green Target Group ARN"
  value       = aws_lb_target_group.green.arn
}

output "rds_endpoint" {
  description = "RDS Primary Endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_read_replica_endpoints" {
  description = "RDS Read Replica Endpoints"
  value       = aws_db_instance.replica[*].endpoint
  sensitive   = true
}

output "elasticache_endpoint" {
  description = "ElastiCache Primary Endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "elasticache_reader_endpoint" {
  description = "ElastiCache Reader Endpoint"
  value       = aws_elasticache_replication_group.main.reader_endpoint_address
  sensitive   = true
}

output "cloudfront_domain" {
  description = "CloudFront Distribution Domain"
  value       = var.cloudfront.enabled ? aws_cloudfront_distribution.main[0].domain_name : null
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = var.cloudfront.enabled ? aws_cloudfront_distribution.main[0].id : null
}

output "security_group_ecs" {
  description = "ECS Security Group ID"
  value       = aws_security_group.ecs.id
}

output "security_group_rds" {
  description = "RDS Security Group ID"
  value       = aws_security_group.rds.id
}

output "security_group_elasticache" {
  description = "ElastiCache Security Group ID"
  value       = aws_security_group.elasticache.id
}
