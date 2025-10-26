# Terraform Backend Configuration - PRIVATE REPOSITORY

**Status:** CONFIGURED AND ACTIVE  
**AWS Account:** 940482412089  
**User:** superuser-charlie  
**Date:** October 25, 2025

---

## Your AWS Resources

### S3 Bucket for State Storage
- **Bucket Name:** `terraform-state-charlie-k8s-45207`
- **Region:** `us-east-1`
- **Versioning:** Enabled
- **Encryption:** AES-256 (Server-Side)
- **Created:** October 25, 2025 22:20:30
- **Purpose:** Stores Terraform state files remotely

### DynamoDB Table for State Locking
- **Table Name:** `terraform-state-lock`
- **Region:** `us-east-1`
- **Billing Mode:** Pay-per-request
- **Status:** ACTIVE
- **Purpose:** Prevents concurrent Terraform operations

---

## Backend Configuration

Your backend is configured in `terraform/backend.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "terraform-state-charlie-k8s-45207"
    key            = "ec2-k8s/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

---

## Usage

### Initialize Terraform

```bash
cd terraform/
terraform init
```

The backend is already configured. Terraform will:
- Connect to your S3 bucket
- Check for existing state
- Enable state locking via DynamoDB

### Working with State

```bash
# View current state
terraform show

# List all resources
terraform state list

# View state in S3
aws s3 ls s3://terraform-state-charlie-k8s-45207/ec2-k8s/

# Download state locally (backup)
aws s3 cp s3://terraform-state-charlie-k8s-45207/ec2-k8s/terraform.tfstate ./backup-state.tfstate
```

---

## Verification Commands

### Verify S3 Bucket

```bash
# Check bucket exists
aws s3 ls s3://terraform-state-charlie-k8s-45207

# Check versioning status
aws s3api get-bucket-versioning --bucket terraform-state-charlie-k8s-45207

# Check encryption
aws s3api get-bucket-encryption --bucket terraform-state-charlie-k8s-45207

# List state file versions
aws s3api list-object-versions \
  --bucket terraform-state-charlie-k8s-45207 \
  --prefix ec2-k8s/terraform.tfstate
```

### Verify DynamoDB Table

```bash
# Check table status
aws dynamodb describe-table --table-name terraform-state-lock \
  --query 'Table.[TableName,TableStatus,BillingModeSummary.BillingMode]' \
  --output table

# Check for any locks (should be empty when no operations running)
aws dynamodb scan --table-name terraform-state-lock
```

---

## State Management

### Backup State

```bash
# Manual backup
aws s3 cp s3://terraform-state-charlie-k8s-45207/ec2-k8s/terraform.tfstate \
  ./backups/terraform.tfstate.$(date +%Y%m%d-%H%M%S)

# S3 versioning provides automatic backups
# List all versions:
aws s3api list-object-versions \
  --bucket terraform-state-charlie-k8s-45207 \
  --prefix ec2-k8s/
```

### Restore State from Version

```bash
# Get version ID from list-object-versions command
aws s3api get-object \
  --bucket terraform-state-charlie-k8s-45207 \
  --key ec2-k8s/terraform.tfstate \
  --version-id <VERSION_ID> \
  restored-state.tfstate
```

---

## Security

### Current IAM User
- **User:** superuser-charlie
- **Account:** 940482412089
- **Permissions:** Full access to S3 and DynamoDB

### Bucket Permissions

```bash
# View bucket policy (if any)
aws s3api get-bucket-policy --bucket terraform-state-charlie-k8s-45207

# View bucket ACL
aws s3api get-bucket-acl --bucket terraform-state-charlie-k8s-45207
```

### Recommended: Enable MFA Delete

```bash
# Enable MFA delete for extra protection
aws s3api put-bucket-versioning \
  --bucket terraform-state-charlie-k8s-45207 \
  --versioning-configuration Status=Enabled,MFADelete=Enabled \
  --mfa "arn:aws:iam::940482412089:mfa/device-name serial-token"
```

---

## Cost Information

### Current Monthly Costs

**S3 Storage:**
- State file size: ~100 KB - 10 MB typical
- Cost: $0.023 per GB/month
- Estimated: < $0.01/month

**S3 Requests:**
- terraform plan/apply operations: ~10-50 requests/day
- Cost: $0.0004 per 1,000 GET requests
- Estimated: < $0.01/month

**DynamoDB:**
- Billing: Pay-per-request
- Reads: $0.25 per million requests
- Writes: $1.25 per million requests
- Typical usage: 20-100 requests/day
- Estimated: < $0.05/month

**Total: ~$0.10-0.15/month**

---

## Troubleshooting

### Cannot Initialize Backend

**Error:** "Failed to get existing workspaces"

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Should show:
# Account: 940482412089
# Arn: arn:aws:iam::940482412089:user/superuser-charlie

# Verify bucket access
aws s3 ls s3://terraform-state-charlie-k8s-45207
```

### State Lock Stuck

**Error:** "Error locking state"

```bash
# Check for existing locks
aws dynamodb scan --table-name terraform-state-lock

# If stuck, force unlock (use with caution!)
terraform force-unlock <LOCK_ID>
```

### Different State Than Expected

```bash
# Pull latest state
terraform refresh

# Or reinitialize
terraform init -reconfigure
```

---

## Maintenance

### Regular Tasks

1. **Monitor Costs** - Check AWS billing dashboard monthly
2. **Review State Versions** - Clean old versions if needed (optional)
3. **Backup Important States** - Before major changes
4. **Review Access** - Ensure only authorized users have access

### Cleaning Old State Versions

```bash
# S3 versioning keeps all versions indefinitely
# To reduce storage costs, set lifecycle policy:

aws s3api put-bucket-lifecycle-configuration \
  --bucket terraform-state-charlie-k8s-45207 \
  --lifecycle-configuration file://lifecycle-policy.json
```

Example `lifecycle-policy.json`:
```json
{
  "Rules": [{
    "Id": "DeleteOldVersions",
    "Status": "Enabled",
    "NoncurrentVersionExpiration": {
      "NoncurrentDays": 90
    }
  }]
}
```

---

## Summary

**Backend:** Fully configured and operational  
**S3 Bucket:** terraform-state-charlie-k8s-45207  
**DynamoDB Table:** terraform-state-lock  
**AWS Account:** 940482412089  
**User:** superuser-charlie  
**Status:** Ready to use  
**Cost:** ~$0.15/month

Just run `terraform init` in the terraform/ directory to start using it!
