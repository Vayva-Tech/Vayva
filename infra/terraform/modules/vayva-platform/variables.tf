# Variables for Vayva Platform Module

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "region" {
  description = "AWS Region"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR Block"
  type        = string
}

variable "ecs_cluster" {
  description = "ECS Cluster configuration"
  type = object({
    instance_type    = string
    min_size         = number
    max_size         = number
    desired_capacity = number
  })
}

variable "rds" {
  description = "RDS configuration"
  type = object({
    instance_class    = string
    multi_az          = bool
    read_replicas     = number
    allocated_storage = number
  })
}

variable "elasticache" {
  description = "ElastiCache configuration"
  type = object({
    node_type       = string
    num_cache_nodes = number
  })
}

variable "cloudfront" {
  description = "CloudFront configuration"
  type = object({
    enabled     = bool
    price_class = string
  })
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
}

variable "subdomain" {
  description = "Subdomain"
  type        = string
}
