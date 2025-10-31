# Command Reference Card

**Quick commands and references for MusicVibe CI/CD Platform**

>  **For complete setup instructions, see [MUSICVIBE-CICD-GUIDE.md](../MUSICVIBE-CICD-GUIDE.md)**

---

## Infrastructure Overview

```
5 EC2 Instances (t3.medium):
 Jenkins + K8s Master (combined)
 K8s Worker 1
 K8s Worker 2  
 Nexus + SonarQube (combined)
 Prometheus + Grafana (combined)
```

---

## Quick Commands

**Deploy infrastructure:**
```bash
cd musicvibe-cicd-project/terraform
terraform init
terraform apply
```

**Get outputs:**
```bash
terraform output
terraform output > infrastructure-details.txt  # Save for reference
```

**SSH to instances:**
```bash
ssh -i musicvibe-pipeline-key.pem ubuntu@<PUBLIC_IP>
```

**Check K8s cluster:**
```bash
kubectl get nodes
kubectl get pods -n musicvibe
kubectl get svc -n musicvibe
```

**Destroy infrastructure:**
```bash
terraform destroy
```

---

## Service Discovery DNS (Internal)

```
jenkins-k8s-master.musicvibe.local
k8s-worker-1.musicvibe.local
k8s-worker-2.musicvibe.local
tools.musicvibe.local (nexus-sonarqube)
monitoring.musicvibe.local (prometheus-grafana)
```

---

## Default Credentials Reference

**Jenkins:**
- Username: admin
- Initial Password: `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`

**SonarQube:**
- Default: admin / admin (change on first login)

**Nexus:**
- Initial: admin / `sudo docker exec -it nexus cat /nexus-data/admin.password`

**Grafana:**
- Default: admin / admin (change on first login)

---

## Jenkins Configuration IDs

**Tool Names (for Jenkinsfile):**
```
Docker: docker
SonarQube Scanner: sonar-scanner
```

**Credential IDs (for Jenkinsfile):**
```
Docker Hub: docker-cred
GitHub: git-cred
Kubernetes: k8-cred
SonarQube: sonar-token
```

---

## Cost Optimization

**Running costs:**
- All 5 instances: ~$0.50-0.60/hour (~$12-15/day)
- Terraform feature flags can disable optional instances

**Save money:**
```bash
# Daily shutdown:
terraform destroy

# Restart next session:
terraform apply
```

**Feature flags in terraform.auto.tfvars:**
```hcl
feature_flags = {
  enable_monitoring_instance = false  # Saves ~$40/month
  enable_tools_instance      = true   # Keep for CI/CD
  enable_worker_2            = false  # Saves ~$40/month
}
```

---

## Troubleshooting Commands

**Service status:**
```bash
sudo systemctl status <service>
docker ps
sudo journalctl -u cloud-final  # Check user_data scripts
```

**Kubernetes debugging:**
```bash
kubectl get pods -n musicvibe
kubectl describe pod <pod-name> -n musicvibe
kubectl logs <pod-name> -n musicvibe
```

**DNS testing:**
```bash
ping <service>.musicvibe.local
nslookup <service>.musicvibe.local
```

---

## Quick File Locations

**Generate your infrastructure details:**
```bash
terraform output > infrastructure-details.txt
```

**Key application files:**
- `apps/api/package.json` - Node.js backend
- `apps/frontend/package.json` - React frontend  
- `ci-cd/Jenkinsfile` - Pipeline definition
- `terraform.auto.tfvars` - Your infrastructure config

---

** For detailed setup instructions: [MUSICVIBE-CICD-GUIDE.md](../MUSICVIBE-CICD-GUIDE.md)**