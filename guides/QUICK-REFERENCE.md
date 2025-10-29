# Quick Reference Card

## Complete CI/CD Pipeline Setup

### Infrastructure Overview

```
5 EC2 Instances (t3.medium):
  ├── Jenkins + K8s Master (combined) - Orchestration
  ├── K8s Worker 1 - Application pods
  ├── K8s Worker 2 - Application pods (redundancy)
  ├── Nexus + SonarQube (combined) - Artifact + Quality
  └── Prometheus + Grafana (combined) - Monitoring
```

### Service Discovery DNS (Internal)

```
jenkins-k8s-master.musicvibe-services.local
k8s-worker-1.musicvibe-services.local
k8s-worker-2.musicvibe-services.local
nexus-sonarqube.musicvibe-services.local
prometheus-grafana.musicvibe-services.local
```

---

## Service URLs & Access

After deployment, access services at:

| Service | URL | Port | Purpose |
|---------|-----|------|---------|
| Jenkins | `http://<JENKINS_IP>:8080` | 8080 | CI/CD Pipeline Orchestration |
| SonarQube | `http://<SONARQUBE_IP>:9000` | 9000 | Code Quality Analysis |
| Nexus | `http://<NEXUS_IP>:8081` | 8081 | Artifact Repository |
| Prometheus | `http://<PROMETHEUS_IP>:9090` | 9090 | Metrics Collection |
| Grafana | `http://<PROMETHEUS_IP>:3000` | 3000 | Dashboards & Alerts |
| MusicVibe App | `http://<WORKER_IP>:<NODE_PORT>` | Dynamic | Music Discovery App |

---

## Default Credentials

### AWS
- **Region:** us-east-1 (or your configured region)
- **SSH Key:** k8s-pipeline-key.pem (or your key name)
- **Key Permissions:** `chmod 400 k8s-pipeline-key.pem`

### Jenkins
- **Default User:** admin
- **Initial Password:** (from `/var/lib/jenkins/secrets/initialAdminPassword`)
- **Setup:** Configure during first login
- **Access:** http://<JENKINS_IP>:8080

### SonarQube
- **Default User:** admin
- **Default Password:** admin
- **Action:** Change password on first login
- **Access:** http://<SONARQUBE_IP>:9000

### Nexus
- **Default User:** admin
- **Initial Password:** `docker exec nexus cat /nexus-data/admin.password`
- **Recommended:** Change to admin / admin123
- **Access:** http://<NEXUS_IP>:8081
- **Repository:** `releases` and `snapshots`

### Grafana
- **Default User:** admin
- **Default Password:** admin
- **Action:** Change password on first login
- **Data Source:** Add Prometheus at `http://<PROMETHEUS_IP>:9090`
- **Access:** http://<PROMETHEUS_IP>:3000

### MusicVibe Application
- **Authentication:** None required for basic features
- **Features Available:**
  - Music search (iTunes API - free, no auth)
  - Preview playback (30 seconds)
  - Lyrics viewing
  - Favorites (stored in memory)
- **Access:** http://<WORKER_IP>:<NODE_PORT>

---

## Pipeline Overview

**11-Stage Pipeline:** Git Push → Compile → Test → SonarQube → Quality Gate → Build → Nexus → Docker Build → Trivy Scan → Push → Deploy

**Pipeline Time:**
- First run: 8-12 minutes
- Subsequent runs: 5-8 minutes (cached)

**For detailed pipeline flow with diagrams, see [PIPELINE_WORKFLOW.md](PIPELINE_WORKFLOW.md)**

---

## Jenkins Tool Names (for Jenkinsfile)

Use these exact names in your Jenkinsfile pipeline script:

```groovy
// JDK (Java compiler)
tools {
  jdk 'jdk17'
}

// Maven (build tool)
tools {
  maven 'maven3.6'
}

// Docker (container runtime)
sh 'docker build ...'

// SonarQube Scanner
environment {
  SONAR_SCANNER_HOME = tool name: 'sonar-scanner'
}
```

---

## Jenkins Credential IDs (for Jenkinsfile)

Register credentials in Jenkins at: **Manage Jenkins > Manage Credentials > System > Global credentials**

These IDs are referenced in Jenkinsfile:

| Credential ID | Type | Purpose | Example Value |
|--------------|------|---------|----------------|
| `docker-cred` | Username/Password | Docker Hub login | your-docker-username / your-token |
| `docker-hub-token` | Secret text | Docker Hub token | ghp_xxxxxxxxxxxx |
| `git-cred` | Username/Password | GitHub auth (optional) | github-user / github-token |
| `k8s-cred` | Kubeconfig | K8s cluster auth | (auto-configured) |
| `sonar-token` | Secret text | SonarQube token | squ_xxxxxxxxxxxx |
| `nexus-cred` | Username/Password | Nexus auth | admin / admin123 |

---

## Quick Commands

### Deploy Infrastructure

```bash
cd terraform/
terraform init
terraform plan
terraform apply        # Deploys 5 EC2 instances
```

### Get Infrastructure Outputs

```bash
terraform output                    # All outputs
terraform output -raw jenkins_master_ip
terraform output -raw k8s_worker_1_ip
terraform output -raw k8s_worker_2_ip
```

### SSH to Instances

```bash
ssh -i k8s-pipeline-key.pem ubuntu@<PUBLIC_IP>

# Or using terraform output:
MASTER_IP=$(terraform output -raw jenkins_master_ip)
ssh -i k8s-pipeline-key.pem ubuntu@$MASTER_IP
```

### Initialize Kubernetes (Run on Master)

```bash
/home/ubuntu/init-k8s-master.sh
```

### Check Kubernetes Cluster

```bash
kubectl get nodes                          # All nodes
kubectl get pods -n webapps                # All pods
kubectl get svc -n webapps                 # All services
kubectl get deployments -n webapps         # All deployments
```

### Monitor Pod Logs

```bash
kubectl logs -f <POD_NAME> -n webapps       # Stream logs
kubectl describe pod <POD_NAME> -n webapps  # Pod details
```

### Access Application

```bash
# Get Node Port
NODE_PORT=$(kubectl get svc -n webapps musicvibe -o jsonpath='{.spec.ports[0].nodePort}')
WORKER_IP=$(terraform output -raw k8s_worker_1_ip)

# Access
open http://$WORKER_IP:$NODE_PORT

# Or port-forward from local
kubectl port-forward svc/musicvibe 4000:4000 -n webapps
# Then: http://localhost:4000
```

### Destroy Infrastructure

```bash
terraform destroy       # Removes all EC2 instances
```

### Stop Instances (Save 90% Cost)

```bash
# Get instance IDs
terraform state show

# Stop all (keeps data)
aws ec2 stop-instances --instance-ids i-xxxx i-yyyy i-zzzz

# Start again later
aws ec2 start-instances --instance-ids i-xxxx i-yyyy i-zzzz
```

---

## Terraform Commands

```bash
terraform init                  # Initialize working directory
terraform plan                  # Preview changes
terraform apply                 # Create infrastructure
terraform destroy               # Delete infrastructure
terraform validate              # Check syntax
terraform fmt -recursive        # Format code
terraform state show            # Show current state
terraform output                # Display outputs
terraform refresh               # Update state from AWS
```

---

## Docker Commands (on Instances)

```bash
# SSH to instance first
ssh -i k8s-pipeline-key.pem ubuntu@<IP>

# List running containers
docker ps

# View container logs
docker logs -f <CONTAINER_ID>

# Execute command in container
docker exec -it <CONTAINER_ID> /bin/bash

# Restart service
docker restart <SERVICE_NAME>

# Check Docker daemon
docker ps && docker version
```

---

## SonarQube Setup in Jenkins

1. Go to **Manage Jenkins > Configure System > SonarQube servers**
2. Add SonarQube:
   - Name: `SonarQube`
   - Server URL: `http://<SONARQUBE_IP>:9000`
   - Server authentication token: (create in SonarQube)
3. Save

Generate SonarQube token:
1. Login to SonarQube: `http://<SONARQUBE_IP>:9000`
2. Account > Security > Tokens
3. Generate: "Jenkins Integration"
4. Copy token → Jenkins credentials (ID: `sonar-token`)

---

## Nexus Setup in Jenkins

1. Go to **Manage Jenkins > Configure System > Nexus Repository**
2. Add Nexus:
   - URL: `http://<NEXUS_IP>:8081`
   - Credentials: admin / admin123
3. Save

Configure Maven settings (`~/.m2/settings.xml`):

```xml
<servers>
  <server>
    <id>nexus-releases</id>
    <username>admin</username>
    <password>admin123</password>
  </server>
</servers>
```

---

## Docker Hub Credentials Setup

1. Create Docker Hub access token:
   - Hub > Account Settings > Security > New Access Token
   - Copy token
2. In Jenkins:
   - Manage Jenkins > Manage Credentials
   - Add > Jenkins > Username with password
   - Username: `your-docker-username`
   - Password: (paste token from above)
   - ID: `docker-cred`
3. Use in Jenkinsfile:

```groovy
withCredentials([usernamePassword(credentialsId: 'docker-cred', 
                                   usernameVariable: 'DOCKER_USER',
                                   passwordVariable: 'DOCKER_PASS')]) {
  sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
  sh 'docker push your-image:tag'
}
```

---

## Debugging Checklist

### Pipeline Fails
```bash
# 1. Check Jenkins console output
# 2. SSH to master
# 3. Check service status
docker ps

# 4. Test connectivity
curl http://<SONARQUBE_IP>:9000
curl http://<NEXUS_IP>:8081

# 5. Restart service if needed
docker restart sonarqube    # or nexus, jenkins, etc
```

### Can't SSH to Instances
```bash
# 1. Check key permissions
chmod 400 k8s-pipeline-key.pem

# 2. Verify your IP in security group
curl ifconfig.me

# 3. Check AWS Console: EC2 > Security Groups > Inbound Rules
```

### Pods Not Running
```bash
kubectl describe pod <POD_NAME> -n webapps
kubectl logs <POD_NAME> -n webapps

# Check node resources
kubectl top nodes
kubectl top pods -n webapps
```

---

## Cost Information

| Configuration | Instances | Monthly Cost | Use Case |
|---------------|-----------|--------------|----------|
| Full Setup | 5 × t3.medium | $200-250 | Production-like |
| Minimal Setup | 3 × t3.medium | $100-120 | Development |
| Learning Mode | Stopped | ~$0.50/day | Hourly sessions |

---

## Useful Links

| Resource | URL |
|----------|-----|
| Kubernetes Docs | https://kubernetes.io/docs |
| Docker Docs | https://docs.docker.com |
| Terraform AWS | https://registry.terraform.io/providers/hashicorp/aws |
| Jenkins Docs | https://www.jenkins.io/doc |
| SonarQube Docs | https://docs.sonarqube.org |
| Nexus Docs | https://help.sonatype.com/repomanager3 |
| MusicVibe Repo | https://github.com/temitayocharles/musicvibe-cicd-project |

---

**For step-by-step setup, see [README.md](README.md)**  
**For complete pipeline visualization, see [PIPELINE_WORKFLOW.md](PIPELINE_WORKFLOW.md)**
