# Vayva Platform Infrastructure
# Terraform configuration for AWS deployment

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    bucket         = "vayva-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "af-south-1"
    encrypt        = true
    dynamodb_table = "vayva-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "vayva"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Call the Vayva platform module
module "vayva_platform" {
  source = "./modules/vayva-platform"

  environment = var.environment
  region      = var.aws_region

  # VPC Configuration
  vpc_cidr = var.vpc_cidr

  # ECS Cluster Configuration
  ecs_cluster = {
    instance_type    = var.ecs_instance_type
    min_size         = var.ecs_min_size
    max_size         = var.ecs_max_size
    desired_capacity = var.ecs_desired_capacity
  }

  # RDS Configuration
  rds = {
    instance_class  = var.rds_instance_class
    multi_az        = var.rds_multi_az
    read_replicas   = var.rds_read_replicas
    allocated_storage = var.rds_allocated_storage
  }

  # ElastiCache Configuration
  elasticache = {
    node_type       = var.elasticache_node_type
    num_cache_nodes = var.elasticache_num_nodes
  }

  # CloudFront Configuration
  cloudfront = {
    enabled     = true
    price_class = var.cloudfront_price_class
  }

  # Domain Configuration
  domain_name = var.domain_name
  subdomain   = var.subdomain
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vayva_platform.vpc_id
}

output "ecs_cluster_name" {
  description = "ECS Cluster Name"
  value       = module.vayva_platform.ecs_cluster_name
}

output "rds_endpoint" {
  description = "RDS Primary Endpoint"
  value       = module.vayva_platform.rds_endpoint
  sensitive   = true
}

output "elasticache_endpoint" {
  description = "ElastiCache Endpoint"
  value       = module.vayva_platform.elasticache_endpoint
  sensitive   = true
}

output "cloudfront_domain" {
  description = "CloudFront Distribution Domain"
  value       = module.vayva_platform.cloudfront_domain
}
