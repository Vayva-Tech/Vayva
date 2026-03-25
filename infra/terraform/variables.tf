# Variables for Vayva Infrastructure

variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "af-south-1"  # Cape Town for Africa
}

variable "environment" {
  description = "Environment (production, staging, development)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "VPC CIDR Block"
  type        = string
  default     = "10.0.0.0/16"
}

# ECS Variables
variable "ecs_instance_type" {
  description = "ECS Container Instance Type"
  type        = string
  default     = "c6g.2xlarge"
}

variable "ecs_min_size" {
  description = "ECS Cluster Minimum Size"
  type        = number
  default     = 3
}

variable "ecs_max_size" {
  description = "ECS Cluster Maximum Size"
  type        = number
  default     = 20
}

variable "ecs_desired_capacity" {
  description = "ECS Cluster Desired Capacity"
  type        = number
  default     = 5
}

# RDS Variables
variable "rds_instance_class" {
  description = "RDS Instance Class"
  type        = string
  default     = "db.r6g.xlarge"
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ for RDS"
  type        = bool
  default     = true
}

variable "rds_read_replicas" {
  description = "Number of RDS Read Replicas"
  type        = number
  default     = 2
}

variable "rds_allocated_storage" {
  description = "RDS Allocated Storage (GB)"
  type        = number
  default     = 100
}

# ElastiCache Variables
variable "elasticache_node_type" {
  description = "ElastiCache Node Type"
  type        = string
  default     = "cache.r6g.large"
}

variable "elasticache_num_nodes" {
  description = "Number of ElastiCache Nodes"
  type        = number
  default     = 3
}

# CloudFront Variables
variable "cloudfront_price_class" {
  description = "CloudFront Price Class"
  type        = string
  default     = "PriceClass_All"
}

# Domain Variables
variable "domain_name" {
  description = "Root Domain Name"
  type        = string
  default     = "vayva.ng"
}

variable "subdomain" {
  description = "Subdomain for this environment"
  type        = string
  default     = "api"
}
