# Vayva Platform Module
# Core infrastructure components

# ============================================================================
# VPC and Networking
# ============================================================================

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "vayva-${var.environment}"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = 3
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "vayva-${var.environment}-public-${count.index + 1}"
    Type = "public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "vayva-${var.environment}-private-${count.index + 1}"
    Type = "private"
  }
}

# Database Subnets
resource "aws_subnet" "database" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 20)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "vayva-${var.environment}-database-${count.index + 1}"
    Type = "database"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "vayva-${var.environment}"
  }
}

# NAT Gateways
resource "aws_eip" "nat" {
  count  = 3
  domain = "vpc"

  tags = {
    Name = "vayva-${var.environment}-nat-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "main" {
  count         = 3
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "vayva-${var.environment}-${count.index + 1}"
  }
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "vayva-${var.environment}-public"
  }
}

resource "aws_route_table" "private" {
  count  = 3
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "vayva-${var.environment}-private-${count.index + 1}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count          = 3
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 3
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# ============================================================================
# Security Groups
# ============================================================================

resource "aws_security_group" "alb" {
  name_prefix = "vayva-alb-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vayva-${var.environment}-alb"
  }
}

resource "aws_security_group" "ecs" {
  name_prefix = "vayva-ecs-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vayva-${var.environment}-ecs"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "vayva-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "vayva-${var.environment}-rds"
  }
}

resource "aws_security_group" "elasticache" {
  name_prefix = "vayva-elasticache-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "vayva-${var.environment}-elasticache"
  }
}

# ============================================================================
# Application Load Balancer
# ============================================================================

resource "aws_lb" "main" {
  name               = "vayva-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "production"

  tags = {
    Name = "vayva-${var.environment}"
  }
}

resource "aws_lb_target_group" "blue" {
  name     = "vayva-${var.environment}-blue"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health/live"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  tags = {
    Name = "vayva-${var.environment}-blue"
  }
}

resource "aws_lb_target_group" "green" {
  name     = "vayva-${var.environment}-green"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health/live"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  tags = {
    Name = "vayva-${var.environment}-green"
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.blue.arn
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ============================================================================
# ECS Cluster
# ============================================================================

resource "aws_ecs_cluster" "main" {
  name = "vayva-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "vayva-${var.environment}"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 1
    capacity_provider = "FARGATE"
  }
}

# ============================================================================
# RDS PostgreSQL
# ============================================================================

resource "aws_db_subnet_group" "main" {
  name       = "vayva-${var.environment}"
  subnet_ids = aws_subnet.database[*].id

  tags = {
    Name = "vayva-${var.environment}"
  }
}

resource "aws_db_parameter_group" "main" {
  family = "postgres16"
  name   = "vayva-${var.environment}"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_duration"
    value = "1"
  }
}

resource "aws_db_instance" "main" {
  identifier = "vayva-${var.environment}"

  engine         = "postgres"
  engine_version = "16.1"
  instance_class = var.rds.instance_class

  allocated_storage     = var.rds.allocated_storage
  max_allocated_storage = var.rds.allocated_storage * 2
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "vayva"
  username = "vayva_admin"
  password = random_password.db_password.result

  multi_az               = var.rds.multi_az
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.main.name

  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  deletion_protection = var.environment == "production"
  skip_final_snapshot = var.environment != "production"

  tags = {
    Name = "vayva-${var.environment}"
  }
}

# Read Replicas
resource "aws_db_instance" "replica" {
  count = var.rds.read_replicas

  identifier = "vayva-${var.environment}-replica-${count.index + 1}"

  replicate_source_db = aws_db_instance.main.arn

  instance_class = var.rds.instance_class

  storage_encrypted = true

  vpc_security_group_ids = [aws_security_group.rds.id]

  tags = {
    Name = "vayva-${var.environment}-replica-${count.index + 1}"
  }
}

# ============================================================================
# ElastiCache Redis
# ============================================================================

resource "aws_elasticache_subnet_group" "main" {
  name       = "vayva-${var.environment}"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_parameter_group" "main" {
  family = "redis7"
  name   = "vayva-${var.environment}"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "vayva-${var.environment}"
  description          = "Vayva Redis Cluster"

  node_type            = var.elasticache.node_type
  num_cache_clusters   = var.elasticache.num_cache_nodes
  port                 = 6379
  parameter_group_name = aws_elasticache_parameter_group.main.name

  automatic_failover_enabled = true
  multi_az_enabled          = true

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.elasticache.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  snapshot_retention_limit = 7
  snapshot_window         = "05:00-06:00"

  tags = {
    Name = "vayva-${var.environment}"
  }
}

# ============================================================================
# CloudFront CDN
# ============================================================================

resource "aws_cloudfront_distribution" "main" {
  count = var.cloudfront.enabled ? 1 : 0

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Vayva ${var.environment} CDN"
  default_root_object = "index.html"
  price_class         = var.cloudfront.price_class

  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALB-${var.environment}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB-${var.environment}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn            = aws_acm_certificate.cloudfront.arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  tags = {
    Name = "vayva-${var.environment}"
  }
}

# ============================================================================
# Data Sources
# ============================================================================

data "aws_availability_zones" "available" {
  state = "available"
}

# ============================================================================
# Random Passwords
# ============================================================================

resource "random_password" "db_password" {
  length  = 32
  special = false
}
