resource "aws_vpc" "caam_vpc" {
  cidr_block       = var.vpc.cidr_block
  instance_tenancy = "default"

  tags = {
    Name      = var.vpc.name
    ManagedBy = "Terraform"
     Environment = var.environment
  }
}

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.caam_vpc.id

  tags = {
    Name = "internet-gateway-${var.environment}"
  }
}

resource "aws_subnet" "public_subnet" {
  for_each = var.vpc.public_subnets

  vpc_id                  = aws_vpc.caam_vpc.id
  cidr_block              = each.value.cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = true

   tags = {
    Name      = each.key
    Environment = var.environment
    ManagedBy = "Terraform"
  }
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.caam_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }

  tags = {
    Name      = "public-rt-${var.environment}"
    ManagedBy = "Terraform"
  }
}

resource "aws_route_table_association" "public_route_table_associations" {
   for_each = aws_subnet.public_subnet
  
  subnet_id      = each.value.id
  route_table_id = aws_route_table.public_route_table.id
}


