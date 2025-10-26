# AWS Configuration
aws_config = {
  region = "us-east-1"
}

# AMI Configuration
ami_config = {
  id = "ami-0360c520857e3138f" # Ubuntu 24.04 LTS - verify this is correct for your region
}

# SSH Configuration
ssh_config = {
  key_name     = "k8s-pipeline-key"
  allowed_cidr = ["0.0.0.0/0"] # Open to all IPv4 (OK for learning with terraform destroy workflow)
}

# Instance Types - Optimized for cost while maintaining functionality
instance_types = {
  master     = "t3.medium" # 2 vCPU, 4 GB RAM - better than t2.medium, similar cost
  worker     = "t3.medium" # 2 vCPU, 4 GB RAM
  monitoring = "t3.medium" # 2 vCPU, 4 GB RAM
}

# Project Configuration
project_config = {
  name        = "ultimate-cicd-devops"
  environment = "dev"
}

# Cost Optimization - Disable instances you don't need
# Set to false to disable and save costs
feature_flags = {
  enable_monitoring_instance = true  # Prometheus & Grafana (~$25/month)
  enable_tools_instance      = true  # Nexus & SonarQube (~$25/month)
  enable_worker_2            = false # Second K8s worker (~$25/month)
}

# OIDC Configuration for GitHub Actions
# This enables passwordless authentication from GitHub Actions to AWS
oidc_config = {
  github_org         = "temitayocharles"   # Your GitHub username
  github_repo        = "ultimate-pipeline" # Your repository name
  enable_github_oidc = true                # Set to false if not using GitHub Actions yet
}

# IAM Configuration
# Enable instance profiles for EC2 instances to access AWS services (ECR, SSM, etc.)
iam_config = {
  enable_instance_profiles = true # Enables IAM roles for EC2 instances (recommended)
}

# Cost Saving Tips:
# - Set enable_worker_2 = false if you only need 1 worker node (saves ~$25/month)
# - Set enable_monitoring_instance = false if not using monitoring initially (saves ~$25/month)
# - Set enable_tools_instance = false if not using Nexus/SonarQube initially (saves ~$25/month)
# - Minimum viable setup: Just master + 1 worker = ~$50/month
# - Full setup: All 5 instances = ~$200-250/month
# - Remember to STOP instances when not in use to save costs!
