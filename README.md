# MusicVibe CI/CD Platform

A production-grade CI/CD infrastructure for deploying applications on AWS with Jenkins, Kubernetes, Docker, SonarQube, Nexus, Prometheus, and Grafana.

**Status:** Ready to Deploy | **Setup Time:** ~3 hours | **Estimated Cost:** $50-250/month

---

## What Is This?

**Infrastructure:** Complete AWS Kubernetes cluster (1 master + 2 workers) with all CI/CD tooling pre-configured via Terraform and cloud-init scripts.

**Application:** MusicVibe - a full-stack music discovery platform with global search (iTunes API), 30-second previews, lyrics viewer, and favorites management.

**Pipeline:** Automated 11-stage Jenkins pipeline: Git → Compile → Test → SonarQube → Build → Nexus → Docker Build → Trivy Scan → Push → Deploy to K8s.

---

## Prerequisites

- [ ] AWS Account with admin/power user IAM permissions
- [ ] AWS CLI installed and configured: `aws configure`
- [ ] Terraform >= 1.0 installed
- [ ] SSH key pair created in AWS EC2 (us-east-1 or your region)
- [ ] Git installed
- [ ] Your local IP address (for SSH security group rule)

**Get your IP:**
```bash
curl ifconfig.me
```

---

## Quick Start (5 Steps)

### Step 1: Clone & Configure

```bash
git clone https://github.com/temitayocharles/musicvibe-cicd-project
cd musicvibe-cicd-project/terraform

# Copy example config
cp terraform.auto.tfvars.example terraform.auto.tfvars

# Edit with your values
nano terraform.auto.tfvars
```

**Required values to set:**
- `aws_region` - Your AWS region (e.g., us-east-1)
- `ssh_key_name` - Your EC2 SSH key pair name
- `allowed_ssh_ip` - Your local IP (from curl above)
- `docker_hub_username` - Optional, for Docker Hub pushes

### Step 2: Deploy Infrastructure

```bash
terraform init
terraform plan      # Review what will be created
terraform apply    # Deploy (takes ~5-7 minutes)
```

**Output:** Terraform displays all service IPs and URLs. Save these.

### Step 3: Initialize Kubernetes Master

```bash
# Get master IP from terraform output
MASTER_IP=$(terraform output -raw jenkins_master_ip)

# SSH to master
ssh -i /path/to/your-key.pem ubuntu@$MASTER_IP

# Run K8s initialization (on master)
/home/ubuntu/init-k8s-master.sh

# Wait 2-3 minutes for completion
# Exit SSH when done
exit
```

### Step 4: Configure Services

```bash
# Get service IPs from terraform output
terraform output

# Access each service and complete setup:

# Jenkins: http://<JENKINS_IP>:8080
# - Get password: ssh to master, run: sudo cat /var/lib/jenkins/secrets/initialAdminPassword
# - Install suggested plugins
# - Create admin user

# SonarQube: http://<SONARQUBE_IP>:9000
# - Login: admin / admin
# - Change password on first login
# - Create project token for Jenkins

# Nexus: http://<NEXUS_IP>:8081
# - Get password: ssh to master, run: docker exec nexus cat /nexus-data/admin.password
# - Change to admin / admin123

# Grafana: http://<GRAFANA_IP>:3000
# - Login: admin / admin
# - Change password on first login
```

### Step 5: Run Pipeline & Deploy

```bash
# In Jenkins:
# 1. Create new Pipeline job
# 2. Point repository to: https://github.com/temitayocharles/musicvibe-cicd-project
# 3. Set Jenkinsfile path: ci-cd/Jenkinsfile
# 4. Configure credentials (Docker Hub, SonarQube token, Nexus)
# 5. Click "Build"

# Pipeline runs 11 stages: ~8-12 minutes (first run), ~5-8 minutes (subsequent)

# Verify deployment:
# - SSH to master
# - kubectl get pods -n webapps
# - kubectl get svc -n webapps
```

---

## Service URLs & Credentials

After `terraform apply`, run:
```bash
terraform output
```

| Service | URL | Default Credentials | Port |
|---------|-----|-------------------|------|
| Jenkins | `http://<JENKINS_IP>:8080` | Set during first login | 8080 |
| SonarQube | `http://<SONARQUBE_IP>:9000` | admin / admin → change | 9000 |
| Nexus | `http://<NEXUS_IP>:8081` | admin / (see Step 4) | 8081 |
| Prometheus | `http://<PROMETHEUS_IP>:9090` | None (no auth) | 9090 |
| Grafana | `http://<PROMETHEUS_IP>:3000` | admin / admin → change | 3000 |
| App | `http://<WORKER_IP>:<NODE_PORT>` | None | Dynamic |

---

## Infrastructure Components

| Instance | Role | Services | Cost |
|----------|------|----------|------|
| Instance 1 | Jenkins + K8s Master | Jenkins, kubectl, kubeadm | ~$40/month |
| Instance 2 | K8s Worker 1 | Application pods | ~$40/month |
| Instance 3 | K8s Worker 2 | Application pods, redundancy | ~$40/month |
| Instance 4 | Nexus + SonarQube | Artifact + code quality | ~$40/month |
| Instance 5 | Prometheus + Grafana | Monitoring | ~$40/month |

**All instances:** t3.medium | **Total (5 instances):** ~$200-250/month

**To save money:** Edit `terraform.auto.tfvars`, set `enable_monitoring_instance = false` and `enable_worker_2 = false` → reduces to ~$50-60/month.

---

## CI/CD Pipeline Stages

1. **Git Checkout** - Clone repository
2. **Compile** - Maven/npm build
3. **Unit Tests** - Run test suite
4. **SonarQube Analysis** - Code quality scan
5. **Quality Gate** - Wait for SonarQube results
6. **Build** - Create artifact (JAR/Docker image)
7. **Publish to Nexus** - Upload artifact
8. **Build Docker Image** - Create container
9. **Trivy Scan** - Security vulnerability check
10. **Push to Docker Hub** - Upload image
11. **Deploy to Kubernetes** - Deploy & verify health

---

## Troubleshooting

### Can't SSH to instances
```bash
# 1. Check key permissions
chmod 400 /path/to/your-key.pem

# 2. Verify your IP is in security group
curl ifconfig.me  # Should match terraform.auto.tfvars allowed_ssh_ip

# 3. If still failing, check AWS Console:
# EC2 > Security Groups > terraform-created-sg > Inbound Rules
```

### Terraform apply fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# If shows wrong account or error, reconfigure
aws configure

# Then retry
terraform apply
```

### Kubernetes pods not starting
```bash
# SSH to master, then:
kubectl get pods -n webapps
kubectl describe pod <pod-name> -n webapps
kubectl logs <pod-name> -n webapps
```

### Jenkins can't connect to SonarQube
- Verify both instances have same security group (or allow inbound)
- Check services running: `docker ps` on each machine
- Restart service: `docker restart sonarqube` (wait 2 min)

### Pipeline fails at Docker push
- Verify Docker Hub credentials configured in Jenkins
- Check Docker daemon is running: `docker ps`
- Verify image name matches your Docker Hub username

---

## Cleanup & Cost Control

**Stop instances (keeps data, saves ~90%):**
```bash
terraform state show | grep instance_id
aws ec2 stop-instances --instance-ids <id1> <id2> <id3>
```

**Complete destruction (removes everything):**
```bash
terraform destroy
```

**Cost optimization:**
Edit `terraform.auto.tfvars`:
```hcl
feature_flags = {
  enable_monitoring_instance = false  # Saves ~$40/month
  enable_tools_instance      = false  # Saves ~$40/month
  enable_worker_2            = false  # Saves ~$40/month
}
```

---

## Quick Commands Reference

For detailed commands, see [guides/QUICK-REFERENCE.md]

**Most Common:**
```bash
terraform init          # Initialize Terraform
terraform plan          # Preview changes
terraform apply         # Deploy infrastructure
terraform output        # Display service IPs
terraform destroy       # Delete everything

ssh -i key.pem ubuntu@IP    # SSH to instance
/home/ubuntu/init-k8s-master.sh  # Initialize K8s (run on master)

kubectl get pods -n webapps      # Check pod status
kubectl logs <pod> -n webapps    # View pod logs
```

---

## What You Get

✅ Production-grade Kubernetes cluster (3 nodes)  
✅ Automated 11-stage CI/CD pipeline  
✅ Code quality (SonarQube) + security scanning (Trivy)  
✅ Artifact management (Nexus)  
✅ Complete monitoring (Prometheus + Grafana)  
✅ Service discovery (AWS Cloud Map)  
✅ All infrastructure as code (Terraform)  
✅ All services auto-configured (cloud-init)  

---

## Next Steps

1. Complete Step 1-5 above
2. Run a test build in Jenkins
3. Monitor pipeline execution
4. Check application deployment on K8s worker nodes
5. View metrics in Grafana
6. Read [guides/QUICK-REFERENCE.md] for common tasks

---

## Support

- Check output of `terraform apply` for all URLs
- SSH to master and run `docker ps` to verify all services
- Jenkins has detailed console logs for pipeline debugging
- Each service has admin access for manual configuration

---

**Made for DevOps learning and practice**  
**Repository:** [github.com/temitayocharles/musicvibe-cicd-project](https://github.com/temitayocharles/musicvibe-cicd-project)
