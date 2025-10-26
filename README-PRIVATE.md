# My Personal Terraform Kubernetes Infrastructure

**Private Repository** - Contains my actual AWS configuration  
**AWS Account:** 940482412089  
**User:** superuser-charlie  
**Last Updated:** October 25, 2025

---

## About This Repository

This is my **private** infrastructure repository containing:
- My actual AWS account configurations
- Pre-configured S3 backend with my bucket
- My personal SSH keys and security settings
- Working Terraform state and deployments

**This repo is NOT meant to be shared publicly** - it contains my real AWS resources and credentials.

---

## Quick Start

### Prerequisites

- AWS CLI configured with my credentials (superuser-charlie)
- Terraform >= 1.0
- SSH key pair: `k8s-pipeline-key.pem`
- Access to AWS account: 940482412089

### Deploy Infrastructure

```bash
# Navigate to terraform directory
cd terraform/

# Initialize (connects to my S3 backend)
terraform init

# Review what will be created
terraform plan

# Deploy everything
terraform apply
```

The backend is already configured to use:
- S3 Bucket: `terraform-state-charlie-k8s-45207`
- DynamoDB Table: `terraform-state-lock`
- Region: `us-east-1`

---

## Infrastructure Overview

### Deployed Resources

**Compute:**
- Jenkins + K8s Master (t3.medium) - 30GB
- K8s Worker 1 (t3.medium) - 20GB
- Nexus + SonarQube (t3.medium) - 30GB
- Prometheus + Grafana (t3.small) - 20GB

**Networking:**
- VPC: Default VPC (vpc-097f625b0f8b79d28)
- Service Discovery: ultimate-cicd-devops.local
- Security Groups: Jenkins, K8s Master, K8s Workers, Tools, Monitoring

**State Management:**
- S3 Backend: terraform-state-charlie-k8s-45207
- State Locking: DynamoDB terraform-state-lock

---

## Configuration Files

### My Terraform Variables

Located in `terraform/terraform.auto.tfvars`:

```hcl
aws_config = {
  region = "us-east-1"
}

ami_config = {
  id = "ami-0c02fb55b34e5205c"  # Ubuntu 24.04 LTS
}

ssh_config = {
  key_name     = "k8s-pipeline-key"
  allowed_cidr = ["0.0.0.0/0"]  # Update with your IP for security
}

instance_types = {
  master     = "t3.medium"
  worker     = "t3.medium"
  monitoring = "t3.small"
}

project_config = {
  name        = "ultimate-cicd-devops"
  environment = "dev"
}
```

---

## Access Information

### SSH Access

```bash
# Jenkins/K8s Master
ssh -i ~/.ssh/k8s-pipeline-key.pem ubuntu@<JENKINS_PUBLIC_IP>

# K8s Worker
ssh -i ~/.ssh/k8s-pipeline-key.pem ubuntu@<WORKER_PUBLIC_IP>

# Tools Server
ssh -i ~/.ssh/k8s-pipeline-key.pem ubuntu@<TOOLS_PUBLIC_IP>

# Monitoring Server
ssh -i ~/.ssh/k8s-pipeline-key.pem ubuntu@<MONITORING_PUBLIC_IP>
```

### Web Interfaces

After deployment, get URLs from terraform output:

```bash
terraform output jenkins_url          # Jenkins
terraform output nexus_url            # Nexus Repository
terraform output sonarqube_url        # SonarQube
terraform output prometheus_url       # Prometheus
terraform output grafana_url          # Grafana
```

---

## Important Notes

### Security

- **SSH Key:** k8s-pipeline-key.pem is in ~/.ssh/
- **AWS Account:** 940482412089
- **IAM User:** superuser-charlie
- **Region:** us-east-1

### Cost Management

**Estimated Monthly Cost:**
- EC2 Instances: ~$150-200/month (if running 24/7)
- EBS Storage: ~$15-20/month
- Data Transfer: ~$5-10/month
- S3/DynamoDB: ~$0.15/month

**To Save Money:**
- Stop instances when not in use
- Use `terraform destroy` after testing
- Consider spot instances for dev

### State Management

State is stored remotely in S3. Benefits:
- Team collaboration ready
- Automatic versioning and backup
- State locking prevents conflicts
- Encrypted at rest

---

## Maintenance

### Backup State

```bash
# Download current state
aws s3 cp s3://terraform-state-charlie-k8s-45207/ec2-k8s/terraform.tfstate \
  ./backups/state-$(date +%Y%m%d).tfstate
```

### Update Infrastructure

```bash
cd terraform/
terraform plan    # Review changes
terraform apply   # Apply changes
```

### Destroy Everything

```bash
cd terraform/
terraform destroy  # Removes all AWS resources
```

Note: S3 bucket and DynamoDB table are NOT destroyed by terraform destroy.

---

## Repository Structure

```
my-terraform-k8s/
├── README.md                    # This file
├── BACKEND-SETUP.md            # Backend configuration details
├── terraform/
│   ├── backend.tf              # S3 backend (pre-configured)
│   ├── main.tf                 # EC2 instances
│   ├── sg.tf                   # Security groups
│   ├── iam.tf                  # IAM roles and policies
│   ├── service-discovery.tf    # AWS Cloud Map
│   ├── outputs.tf              # Output values
│   ├── variables.tf            # Variable definitions
│   ├── terraform.auto.tfvars   # My actual values
│   └── scripts/                # Setup scripts
├── app/                        # Java Spring Boot app
├── ci-cd/                      # Jenkins pipeline
├── kubernetes/                 # K8s manifests
├── guides/                     # Step-by-step guides
└── docs/                       # Additional documentation
```

---

## GitHub Repository

**Repo:** github.com/temitayocharles/my-terraform-k8s (PRIVATE)

### Push Changes

```bash
git add .
git commit -m "Update infrastructure"
git push origin main
```

---

## Related Repositories

- **Public Template:** github.com/temitayocharles/ultimate-pipeline
  - Template version without my personal data
  - For public sharing and collaboration
  - Users need to configure their own AWS resources

---

## Troubleshooting

### Backend Issues

If terraform init fails:

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Should show Account: 940482412089

# Check S3 bucket access
aws s3 ls s3://terraform-state-charlie-k8s-45207
```

### SSH Connection Issues

```bash
# Verify key permissions
chmod 400 ~/.ssh/k8s-pipeline-key.pem

# Get public IP
terraform output jenkins_k8s_master_public_ip

# Test connection
ssh -i ~/.ssh/k8s-pipeline-key.pem ubuntu@<IP> -v
```

---

## Next Steps After Deployment

1. Access Jenkins and complete setup
2. Configure GitHub webhooks
3. Set up Docker Hub credentials
4. Configure Nexus repositories
5. Create SonarQube project
6. Import Grafana dashboards
7. Run first pipeline

See `guides/` directory for detailed instructions.

---

**Remember:** This is my PRIVATE infrastructure. Keep this repo private and don't share AWS credentials!
