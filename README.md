#  MusicVibe CI/CD Platform

**Complete DevOps Pipeline for Music Discovery Application**

Build a production-grade CI/CD infrastructure on AWS with Jenkins, Kubernetes, SonarQube, Nexus, and monitoring - all automated with Terraform.

---

##  What You'll Build

- ** MusicVibe Application**: Full-stack music platform (Node.js + React)
  - Global music search via iTunes API
  - 30-second song previews
  - Real-time lyrics viewer
  - Playlist and favorites management

- ** Complete CI/CD Pipeline**: 8-stage automated deployment
  - Security scanning (Trivy)
  - Code quality analysis (SonarQube)
  - Container security scanning
  - Automated Kubernetes deployment

- ** Production Infrastructure**: 5 AWS EC2 instances
  - Jenkins + Kubernetes Master
  - 2 Kubernetes Worker nodes
  - Tools server (Nexus + SonarQube)
  - Monitoring server (Prometheus + Grafana)

---

##  Prerequisites

Before starting, you need:

- [ ] **AWS Account** with admin/IAM permissions
- [ ] **AWS CLI** installed and configured
- [ ] **Terraform** >= 1.0 installed
- [ ] **Git** installed
- [ ] **Docker Hub account** (free)

**Total Setup Time:** 4-6 hours | **Cost:** ~$200/month (all features) or ~$120/month (minimal)

---

##  Complete Setup Guide

 **[Follow the Complete Step-by-Step Guide](./MUSICVIBE-CICD-GUIDE.md)** 

This guide includes:
-  **Phase 1**: AWS Infrastructure Setup (Terraform)
-  **Phase 2**: Jenkins & Tools Configuration  
-  **Phase 3**: CI/CD Pipeline Creation
-  **Phase 4**: Monitoring & Verification

**Everything explained with screenshots and copy-paste commands!**


---

##  Quick Start (For Experienced Users)

If you prefer the condensed version:

1. **Clone and configure**:
   ```bash
   git clone https://github.com/temitayocharles/musicvibe-cicd-project.git
   cd musicvibe-cicd-project/terraform
   cp terraform.auto.tfvars.example terraform.auto.tfvars
   # Edit terraform.auto.tfvars with your AWS settings
   ```

2. **Deploy infrastructure**:
   ```bash
   terraform init
   terraform apply
   ```

3. **Initialize Kubernetes**:
   ```bash
   ssh -i your-key.pem ubuntu@<JENKINS_IP>
   /home/ubuntu/init-k8s-master.sh
   ```

4. **Configure services** using the IPs from `terraform output`

5. **Create Jenkins pipeline** pointing to this repository

---

##  Infrastructure Overview

```
        
   Jenkins           Tools         Monitoring  
 + K8s Master     Nexus +          Prometheus  
                  SonarQube        + Grafana   
        
                                             
       
                           
              
                                         
                         
         K8s Worker                K8s Worker
             #1                        #2    
                         
```

**5 EC2 Instances (t3.medium)**: Jenkins+Master, 2×Workers, Tools, Monitoring

---

##  Technologies Used

- **Infrastructure**: Terraform, AWS EC2, VPC, Security Groups
- **Container Orchestration**: Kubernetes (kubeadm)
- **CI/CD**: Jenkins Pipeline, Git webhooks
- **Code Quality**: SonarQube analysis, Trivy security scanning
- **Artifact Management**: Nexus Repository
- **Containerization**: Docker, Docker Hub
- **Monitoring**: Prometheus metrics, Grafana dashboards
- **Application**: Node.js 20, TypeScript, React 19, Fastify

---

##  Pipeline Stages

1. **Git Checkout** - Clone source code
2. **File System Scan** - Trivy security scan
3. **SonarQube Analysis** - Code quality check
4. **Quality Gate** - Pass/fail on quality metrics
5. **Build Docker Image** - Create container
6. **Docker Image Scan** - Container security scan
7. **Push Docker Image** - Upload to Docker Hub
8. **Deploy to Kubernetes** - Rolling deployment
9. **Verify Deployment** - Health checks

---

##  Cost Optimization

**All features enabled**: ~$200/month (5 instances)  
**Minimal setup**: ~$120/month (3 instances)

```hcl
# In terraform.auto.tfvars - set to false to save money
feature_flags = {
  enable_monitoring_instance = false  # Saves ~$40/month
  enable_tools_instance      = true   # Keep for CI/CD
  enable_worker_2            = false  # Saves ~$40/month
}
```

**When not in use**:
```bash
# Stop instances (keep data, pay ~$5/month for storage)
terraform state list | grep aws_instance
aws ec2 stop-instances --instance-ids <id1> <id2> <id3>

# Restart when needed
aws ec2 start-instances --instance-ids <id1> <id2> <id3>

# Destroy everything
terraform destroy
```

---

##  Support & Troubleshooting

**Common Issues:**
- **SSH fails**: Check security group allows your IP
- **Jenkins inaccessible**: Verify instance is running and port 8080 is open
- **Pipeline fails**: Check Jenkins console logs and credentials
- **K8s pods pending**: Ensure nodes are ready with `kubectl get nodes`

**Get Help:**
1. Check the [Complete Guide](./MUSICVIBE-CICD-GUIDE.md) first
2. Verify `terraform output` shows correct IPs
3. SSH to master and run `docker ps` to check services
4. Look at Jenkins build console output for errors

---

##  What You'll Learn

- Infrastructure as Code with Terraform
- Kubernetes cluster management
- Jenkins pipeline creation
- Docker containerization
- Security scanning integration
- Code quality analysis
- Container orchestration
- Monitoring and observability
- AWS cloud best practices

---

##  Contributing

Feel free to fork this project and submit pull requests for improvements!

---

##  License

This project is open source and available under the [MIT License](LICENSE).

---

** Ready to build your DevOps skills? [Start with the Complete Guide!](./MUSICVIBE-CICD-GUIDE.md) **
