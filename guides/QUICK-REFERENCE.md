# Quick Reference Card

Complete CI/CD Pipeline Setup

## Infrastructure Overview

```
5 EC2 Instances (t3.medium):
  Jenkins + K8s Master (combined)
  K8s Worker 1
  K8s Worker 2
  Nexus + SonarQube (combined)
  Prometheus + Grafana (combined)
```

## Service URLs

After deployment, access services at:

```
Jenkins:     http://<JENKINS_IP>:8080
SonarQube:   http://<NEXUS_SONARQUBE_IP>:9000
Nexus:       http://<NEXUS_SONARQUBE_IP>:8081
Prometheus:  http://<PROMETHEUS_IP>:9090
Grafana:     http://<PROMETHEUS_IP>:3000
MusicVibe:   http://<WORKER_IP>:<NODE_PORT> or http://localhost:4000 (local)
```

## Service Discovery DNS (Internal)

```
jenkins-k8s-master.musicvibe-services.local
k8s-worker-1.musicvibe-services.local
k8s-worker-2.musicvibe-services.local
nexus-sonarqube.musicvibe-services.local
prometheus-grafana.musicvibe-services.local
```

## Default Credentials

AWS:
- Region: us-east-1
- SSH Key: k8s-pipeline-key.pem

Jenkins:
- Username: admin
- Initial Password: (from /var/lib/jenkins/secrets/initialAdminPassword)
- Set your own during setup

SonarQube:
- Default: admin / admin
- Change on first login

Nexus:
- Initial: admin / (from docker exec nexus cat /nexus-data/admin.password)
- Set to: admin / admin123

Grafana:
- Default: admin / admin
- Change on first login

Application (MusicVibe):
- No authentication required for basic features
- Music search, preview playback, and lyrics viewing available to all users
- Favorites require no login (stored in memory)

## Quick Commands

Deploy infrastructure:
```bash
cd ~/Documents/PROJECTS/ec2-k8s
terraform init
terraform apply
```

Get outputs:
```bash
terraform output
```

SSH to instances:
```bash
ssh -i k8s-pipeline-key.pem ubuntu@<PUBLIC_IP>
```

Check K8s cluster:
```bash
kubectl get nodes
kubectl get pods -n webapps
kubectl get svc -n webapps
```

Destroy infrastructure:
```bash
terraform destroy
```

## Jenkins Tool Names (for Jenkinsfile)

JDK: jdk17
Maven: maven3.6
Docker: docker
SonarQube Scanner: sonar-scanner

## Jenkins Credential IDs (for Jenkinsfile)

Docker Hub: docker-cred
GitHub: git-cred
Kubernetes: k8-cred
SonarQube: sonar-token
