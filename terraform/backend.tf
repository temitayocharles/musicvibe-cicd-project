# Terraform Backend Configuration - PRIVATE REPOSITORY
# 
# This is configured with your actual AWS resources.
# AWS Account: 940482412089
# User: superuser-charlie
# S3 Bucket: terraform-state-charlie-k8s-45207
# DynamoDB Table: terraform-state-lock
#
# Created: October 25, 2025
# Status: ACTIVE and CONFIGURED

terraform {
  backend "s3" {
    bucket         = "terraform-state-charlie-k8s-45207"  # Your personal S3 bucket
    key            = "ec2-k8s/terraform.tfstate"         # Path within bucket
    region         = "us-east-1"                          # AWS region
    encrypt        = true                                 # AES-256 encryption enabled
    dynamodb_table = "terraform-state-lock"              # State locking enabled
  }
}
