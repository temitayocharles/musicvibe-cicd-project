# THE MUSICVIBE CI/CD DEVOPS PIPELINE PROJECT

## Complete Infrastructure Overview

```
 MusicVibe Application Architecture 

                    MUSICVIBE CI/CD PIPELINE                     

                                    
          
                                                               
                        
     GitHub     Jenkins  SonarQube   Nexus   
    Developer        CI/CD        Code Scan           Repository
    Code Push       Pipeline      Security            Artifacts 
                        
                                                                   
                                                                   
                                                  
                        Trivy                                 Docker  
                      Security    Build   
                      Container                               Image   
                         Scan                                         
                                                  
                                                                   
                                                                   
                                                  
                      KubernetesDocker Hub
                      Deployment                            Push Image
                      2 Workers                             Registry  
                                                  
                            
                            
            
                     MUSICVIBE APPLICATION          
                                                         
                   
                Frontend          Backend API        
                React 19      Fastify + TS       
                TypeScript        iTunes API         
               Vite Build         Lyrics API         
                   
                                                         
                  Features: Music Search, Preview,   
                    Lyrics, Playlists, Favorites        
            
                            
                            
                  
                     Prometheus    
                     + Grafana     
                     Monitoring    
                     Dashboards    
                  
```

## Infrastructure: 5 AWS EC2 Instances

| Instance | Role | Services | Cost/Month |
|----------|------|----------|------------|
| **Master** | Jenkins + K8s Master | Jenkins CI/CD + Kubernetes Control Plane | ~$40 |
| **Worker-1** | Kubernetes Worker | MusicVibe App Pods | ~$40 |
| **Worker-2** | Kubernetes Worker | MusicVibe App Pods (HA) | ~$40 |
| **Tools** | Nexus + SonarQube | Code Quality + Artifact Storage | ~$40 |
| **Monitor** | Prometheus + Grafana | Metrics Collection + Visualization | ~$40 |

**Total Cost: ~$200/month** (All instances) | **Minimum: ~$120/month** (3 instances)

---

# PHASE-1 | Setup Infrastructure

##  **Deployment Methodology**

This guide uses **Infrastructure as Code (IaC)** with **Terraform automation**:

| Component | Deployment Method |
|-----------|------------------|
| ** Infrastructure** | Terraform creates EC2 instances, security groups, networking |
| ** Software Installation** | Automated via user_data scripts (Jenkins, Docker, K8s, etc.) |
| ** Configuration** | Manual step-by-step (learning + customization) |

** Benefits:**
-  **Production-ready** IaC patterns
-  **Consistent** deployments across environments  
-  **Fast** infrastructure provisioning (~5 min)
-  **Repeatable** and version-controlled
-  **Educational** configuration steps

** Learning Modes Available:**
-  **Quick Deploy**: Use automated scripts (recommended)
-  **Learning Mode**: Manual installation steps (available in Phase 2)

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **AWS Account** with admin/power user permissions
- [ ] **AWS CLI** installed and configured (`aws configure`)
- [ ] **Terraform** >= 1.0 installed
- [ ] **Git** installed
- [ ] **SSH Key Pair** created in AWS EC2 (your region)
- [ ] **Your Public IP** (`curl ifconfig.me`)

## Step 1: Create AWS EC2 Key Pair

1. **Login to AWS Console**: Go to [AWS Management Console](https://aws.amazon.com/console/)

2. **Navigate to EC2**: 
   - Search "EC2" in the services search bar
   - Click on "EC2"

3. **Create Key Pair**:
   - In the left sidebar, click "Key Pairs"
   - Click "Create key pair"
   - **Name**: `musicvibe-pipeline-key`
   - **Type**: RSA
   - **Format**: .pem (for Linux/macOS) or .ppk (for Windows)
   - Click "Create key pair"
   - **Download and save** the key file securely

4. **Set Permissions** (Linux/macOS):
   ```bash
   chmod 400 ~/Downloads/musicvibe-pipeline-key.pem
   ```

## Step 2: Clone MusicVibe Project

```bash
# Clone the repository
git clone https://github.com/temitayocharles/musicvibe-cicd-project.git
cd musicvibe-cicd-project
```

## Step 3: Configure Terraform Variables

1. **Navigate to terraform directory**:
   ```bash
   cd terraform
   ```

2. **Copy the example configuration**:
   ```bash
   cp terraform.auto.tfvars.example terraform.auto.tfvars
   ```

3. **Edit the configuration file**:
   ```bash
   nano terraform.auto.tfvars
   ```

4. **Fill in YOUR values**:
   ```hcl
   # ============================================================================
   # AWS Configuration
   # ============================================================================
   
   aws_config = {
     region = "us-east-1"  # Change to your preferred AWS region
   }
   
   # ============================================================================
   # AMI Configuration (Ubuntu 24.04 LTS)
   # ============================================================================
   
   ami_config = {
     id = "ami-0c02fb55956c7d316"  # Ubuntu 24.04 LTS us-east-1 (change for other regions)
   }
   
   # ============================================================================
   # SSH Configuration
   # ============================================================================
   
   ssh_config = {
     key_name     = "musicvibe-pipeline-key"           # Your EC2 key pair name
     allowed_cidr = ["YOUR_PUBLIC_IP/32"]              # Your public IP (get with: curl ifconfig.me)
   }
   
   # ============================================================================
   # EC2 Instance Types
   # ============================================================================
   
   instance_types = {
     master     = "t3.medium"    # Jenkins + K8s Master
     worker     = "t3.medium"    # K8s Worker nodes  
     monitoring = "t3.medium"    # Prometheus + Grafana
   }
   
   # ============================================================================
   # Project Configuration
   # ============================================================================
   
   project_config = {
     name        = "musicvibe"
     environment = "production"
   }
   
   # ============================================================================
   # Feature Flags - Toggle Optional Components
   # ============================================================================
   
   feature_flags = {
     enable_monitoring_instance = true   # Prometheus + Grafana (~$40/month)
     enable_tools_instance      = true   # Nexus + SonarQube (~$40/month)
     enable_worker_2            = true   # Second K8s worker (~$40/month)
   }
   
   # ============================================================================
   # IAM Configuration
   # ============================================================================
   
   iam_config = {
     enable_instance_profiles = true     # Enable IAM roles for EC2 instances
   }
   
   # ============================================================================
   # OIDC Configuration (for GitHub Actions - Optional)
   # ============================================================================
   
   oidc_config = {
     enable_github_oidc = false          # Set true to enable GitHub OIDC
     github_org        = "your-org"      # Your GitHub organization
     github_repo       = "your-repo"     # Your GitHub repository
   }
   ```

   **Replace these values**:
   - `YOUR_PUBLIC_IP` with your IP from `curl ifconfig.me`
   - `musicvibe-pipeline-key` with your actual key pair name
   - `us-east-1` with your preferred AWS region
   - `ami-0c02fb55956c7d316` with correct AMI for your region (see comments in file)
   - `your-org` and `your-repo` with your GitHub details (if using GitHub Actions)

## Step 4: Deploy Infrastructure with Terraform

 **IMPORTANT**: If you're using a region other than `us-east-1`, update the AMI ID in your `terraform.auto.tfvars`:

| Region | Ubuntu 24.04 LTS AMI ID |
|--------|-------------------------|
| us-east-1 | ami-0c02fb55956c7d316 |
| us-west-2 | ami-0aff18ec83b712f05 |
| eu-west-1 | ami-0c7217cdde317cfec |
| ap-southeast-1 | ami-0497a974f8d5dcef8 |

1. **Initialize Terraform**:
   ```bash
   terraform init
   ```

2. **Review the deployment plan**:
   ```bash
   terraform plan
   ```
   
   You should see output showing 5 EC2 instances, security groups, and other resources.

3. **Deploy the infrastructure**:
   ```bash
   terraform apply
   ```
   
   - Type `yes` when prompted
   - Wait 5-7 minutes for deployment to complete

4. **Save the output** (copy to notepad):
   ```bash
   terraform output
   ```
   
   You'll see output like:
   ```
   jenkins_url = "http://54.123.45.67:8080"
   nexus_url = "http://54.123.45.68:8081"
   sonarqube_url = "http://54.123.45.68:9000"
   grafana_url = "http://54.123.45.69:3000"
   prometheus_url = "http://54.123.45.69:9090"
   
   ssh_commands = {
     jenkins_master = "ssh -i musicvibe-pipeline-key.pem ubuntu@54.123.45.67"
     worker_1 = "ssh -i musicvibe-pipeline-key.pem ubuntu@54.123.45.70"
     worker_2 = "ssh -i musicvibe-pipeline-key.pem ubuntu@54.123.45.71"
     tools = "ssh -i musicvibe-pipeline-key.pem ubuntu@54.123.45.68" 
     monitoring = "ssh -i musicvibe-pipeline-key.pem ubuntu@54.123.45.69"
   }
   ```

## Step 5: Initialize Kubernetes Cluster

 **Terraform automated the K8s installation** - now just initialize the cluster:

1. **SSH to the Jenkins/Master instance**:
   ```bash
   ssh -i musicvibe-pipeline-key.pem ubuntu@<JENKINS_MASTER_IP>
   ```

2. **Run the pre-installed initialization script**:
   ```bash
   #  Script created by Terraform automation
   /home/ubuntu/init-k8s-master.sh
   ```

3. **Wait for completion** (2-3 minutes), then verify:
   ```bash
   kubectl get nodes
   ```
   
   You should see:
   ```
   NAME                STATUS   ROLES           AGE   VERSION
   jenkins-master      Ready    control-plane   2m    v1.28.1
   k8s-worker-1        Ready    <none>          1m    v1.28.1
   k8s-worker-2        Ready    <none>          1m    v1.28.1
   ```

4. **Create the MusicVibe namespace**:
   ```bash
   kubectl create namespace musicvibe
   ```

5. **Exit SSH**:
   ```bash
   exit
   ```

** PHASE-1 COMPLETE**: Infrastructure is ready!

###  **What Terraform Just Automated:**

| Server | Auto-Installed Software | Status |
|--------|------------------------|--------|
| **Jenkins-Master** |  Jenkins + Java + Docker + Kubernetes + init script | Ready for config |
| **K8s-Worker-1** |  Docker + Kubernetes worker components | Ready to join cluster |
| **K8s-Worker-2** |  Docker + Kubernetes worker components | Ready to join cluster |
| **Tools Server** |  Docker + Nexus + SonarQube (via compose) | Services running |
| **Monitoring** |  Docker + Prometheus + Grafana (via compose) | Dashboards ready |

** Next**: Phase 2 focuses on **configuration** (not installation)

---

# PHASE-2 | Setup Jenkins & Tools

 **Choose Your Deployment Mode** 

| Mode | Description | Time | Learning Value |
|------|-------------|------|----------------|
|  **Quick Deploy** | **Terraform scripts automate everything** | ~5 min | **Production-ready IaC** |
|  **Learning Mode** | **Manual step-by-step installation** | ~30 min | **Deep understanding** |

---

##  **QUICK DEPLOY MODE** (Recommended for Production)

** Everything is already automated!** The Terraform user_data scripts have:
-  Installed Jenkins + configured plugins
-  Installed Docker + Kubernetes (master ready to init)
-  Installed Nexus + SonarQube via Docker Compose
-  Installed Prometheus + Grafana via Docker Compose
-  Configured all system dependencies

** Jump to Configuration Steps:**
1. **Access Jenkins**: `http://<JENKINS_IP>:8080`
2. **Get initial password**: `ssh -i musicvibe-pipeline-key.pem ubuntu@<JENKINS_IP> && sudo cat /var/lib/jenkins/secrets/initialAdminPassword`
3. **Continue to Step 6b: Jenkins Initial Setup** 

---

##  **LEARNING MODE** (Skip if using Quick Deploy)

<details>
<summary><b> Click to expand manual installation steps</b></summary>

### Manual Jenkins Installation
```bash
# SSH to master instance
ssh -i musicvibe-pipeline-key.pem ubuntu@<JENKINS_IP>

# Install Java
sudo apt-get update && sudo apt-get install -y fontconfig openjdk-17-jre

# Install Jenkins
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update && sudo apt-get install -y jenkins
sudo systemctl enable jenkins && sudo systemctl start jenkins
```

### Manual Docker Installation
```bash
# Install Docker
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable docker && sudo systemctl start docker
sudo usermod -aG docker ubuntu
```

### Manual Kubernetes Installation
```bash
# Install Kubernetes tools
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update && sudo apt-get install -y kubeadm kubelet kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# Configure containerd
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml
sudo systemctl restart containerd
```

### Manual Tools Server Setup
```bash
# SSH to tools instance
ssh -i musicvibe-pipeline-key.pem ubuntu@<TOOLS_IP>

# Install Docker (same commands as above)
# Create Docker Compose for tools
sudo mkdir -p /opt/devops-tools && cd /opt/devops-tools
sudo tee docker-compose.yml << EOF
version: '3.8'
services:
  nexus:
    image: sonatype/nexus3:latest
    container_name: nexus
    ports: ["8081:8081"]
    volumes: ["nexus-data:/nexus-data"]
  sonarqube:
    image: sonarqube:community
    container_name: sonarqube
    ports: ["9000:9000"]
    environment:
      - SONAR_JDBC_URL=jdbc:h2:tcp://localhost/sonar
volumes:
  nexus-data:
EOF

# Start services
sudo docker-compose up -d
```

</details>

---

## Step 6b: Jenkins Initial Setup (Both Modes)

** Quick Deploy users continue here** | ** Learning Mode users continue here**

1. **Access Jenkins** in your browser:
   ```
   http://<JENKINS_IP>:8080
   ```

2. **Get the initial password**:
   ```bash
   ssh -i musicvibe-pipeline-key.pem ubuntu@<JENKINS_IP>
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```

3. **Complete Jenkins setup**:
   - Paste the password
   - Click "Install suggested plugins"
   - Wait for plugins to install
   - Create admin user:
     - **Username**: admin
     - **Password**: admin123 (or your choice)
     - **Full name**: MusicVibe Admin
     - **Email**: your-email@example.com

4. **Install additional plugins**:
   - Go to "Manage Jenkins" → "Plugins" → "Available plugins"
   - Search and install:
     - [ ] **SonarQube Scanner**
     - [ ] **Kubernetes CLI**
     - [ ] **Docker Pipeline**
     - [ ] **Trivy**
   - Click "Install without restart"

## Step 7: Configure Jenkins Tools

1. **Go to "Manage Jenkins" → "Tools"**

2. **Configure JDK**:
   - Click "Add JDK"
   - **Name**: `jdk17`
   - **Install automatically**: 
   - **Version**: OpenJDK 17

3. **Configure Docker**:
   - Click "Add Docker" 
   - **Name**: `docker`
   - **Install automatically**: 
   - **Version**: latest

4. **Configure SonarQube Scanner**:
   - Click "Add SonarQube Scanner"
   - **Name**: `sonar-scanner`
   - **Install automatically**: 
   - **Version**: Latest

5. **Click "Save"**

## Step 8: Setup SonarQube

1. **Access SonarQube**:
   ```
   http://<TOOLS_IP>:9000
   ```

2. **Login with default credentials**:
   - **Username**: admin
   - **Password**: admin

3. **Change password** when prompted (e.g., `admin123`)

4. **Create a project**:
   - Click "Create Project" → "Manually"
   - **Project key**: MusicVibe
   - **Display name**: MusicVibe
   - Click "Set up"

5. **Generate authentication token**:
   - Choose "Use existing token" or "Generate new token"
   - **Token name**: jenkins-token
   - **Type**: Global Analysis Token
   - **Expires**: No expiration
   - Click "Generate"
   - **Copy the token** (save it securely)

## Step 9: Setup Nexus Repository

1. **Access Nexus**:
   ```
   http://<TOOLS_IP>:8081
   ```

2. **Get initial password**:
   ```bash
   ssh -i musicvibe-pipeline-key.pem ubuntu@<TOOLS_IP>
   sudo docker exec -it nexus cat /nexus-data/admin.password
   ```

3. **Complete setup**:
   - **Username**: admin
   - **Password**: (from step 2)
   - **New password**: admin123
   - **Enable anonymous access**: Yes
   - Click "Finish"

## Step 10: Configure Jenkins Credentials

1. **Go to "Manage Jenkins" → "Credentials" → "System" → "Global credentials"**

2. **Add GitHub credentials**:
   - Click "Add Credentials"
   - **Kind**: Username with password
   - **Username**: your-github-username
   - **Password**: your-github-token
   - **ID**: `git-cred`
   - **Description**: GitHub Access
   - Click "OK"

3. **Add Docker Hub credentials**:
   - Click "Add Credentials"
   - **Kind**: Username with password
   - **Username**: your-dockerhub-username
   - **Password**: your-dockerhub-password
   - **ID**: `docker-cred`
   - **Description**: Docker Hub
   - Click "OK"

4. **Add SonarQube token**:
   - Click "Add Credentials"
   - **Kind**: Secret text
   - **Secret**: (paste SonarQube token from Step 8)
   - **ID**: `sonar-token`
   - **Description**: SonarQube Token
   - Click "OK"

5. **Add Kubernetes credentials**:
   ```bash
   # SSH to Jenkins master
   ssh -i musicvibe-pipeline-key.pem ubuntu@<JENKINS_IP>
   
   # Get kubeconfig content
   cat ~/.kube/config
   ```
   - Click "Add Credentials"
   - **Kind**: Secret file
   - **File**: Upload or paste kubeconfig content
   - **ID**: `k8-cred`
   - **Description**: Kubernetes Config
   - Click "OK"

## Step 11: Configure Email Notifications (SMTP)

1. **Go to "Manage Jenkins" → "System"**

2. **Find "Extended E-mail Notification" section**:
   - **SMTP server**: `smtp.gmail.com` (or your email provider)
   - **SMTP Port**: `587` (TLS) or `465` (SSL)
   - **Click "Advanced"**:
     -  **Use SMTP Authentication**
     - **User Name**: your-email@gmail.com
     - **Password**: your-app-password (not regular password)
     -  **Use SSL/TLS**
   - **Default user e-mail suffix**: @gmail.com
   - **Test**: Send test email to verify

3. **Configure Email Notification (classic)**:
   - Scroll to "E-mail Notification" section
   - **SMTP server**: `smtp.gmail.com`
   - **Click "Advanced"**:
     -  **Use SMTP Authentication**
     - **User Name**: your-email@gmail.com
     - **Password**: your-app-password
     -  **Use SSL**
     - **SMTP Port**: `465`
   - **Test configuration**: Enter test email and click "Test"

> **Note**: For Gmail, create an App Password:
> 1. Go to Google Account → Security → 2-Step Verification
> 2. Scroll to "App passwords"
> 3. Generate new app password for "Mail"
> 4. Use this password in Jenkins (not your regular Gmail password)

4. **Click "Save"**

## Step 12: Configure SonarQube Server in Jenkins

1. **Go to "Manage Jenkins" → "System"**

2. **Find "SonarQube servers" section**:
   - Click "Add SonarQube"
   - **Name**: `sonar-server`
   - **Server URL**: `http://<TOOLS_IP>:9000`
   - **Server authentication token**: Select `sonar-token`
   - Click "Save"

** PHASE-2 COMPLETE**: All tools configured!

---

# PHASE-3 | Create CI/CD Pipeline

## Step 13: Create Jenkins Pipeline Job

1. **In Jenkins, click "New Item"**

2. **Configure the job**:
   - **Name**: `musicvibe-pipeline`
   - **Type**: Pipeline
   - Click "OK"

3. **Configure pipeline**:
   - **Pipeline section**:
     - **Definition**: Pipeline script from SCM
     - **SCM**: Git
     - **Repository URL**: `https://github.com/temitayocharles/musicvibe-cicd-project.git`
     - **Credentials**: Select `git-cred`
     - **Branch**: `*/main`
     - **Script Path**: `ci-cd/Jenkinsfile`
   - Click "Save"

## Step 14: Create Jenkinsfile

1. **In your local project, create the pipeline file**:
   ```bash
   mkdir -p ci-cd
   nano ci-cd/Jenkinsfile
   ```

2. **Paste the pipeline script**:
   ```groovy
   pipeline {
       agent any
       
       environment {
           APP_NAME = "musicvibe"
           DOCKER_IMAGE = "your-dockerhub-username/musicvibe"
           DOCKER_TAG = "${BUILD_NUMBER}"
           SONAR_URL = "http://<TOOLS_IP>:9000"
       }
       
       stages {
           stage('Git Checkout') {
               steps {
                   git branch: 'main', 
                       credentialsId: 'git-cred',
                       url: 'https://github.com/your-username/musicvibe-cicd-project.git'
               }
           }
           
           stage('File System Scan') {
               steps {
                   sh "trivy fs --format table -o trivy-fs-report.html ."
               }
           }
           
           stage('SonarQube Analysis') {
               steps {
                   script {
                       def scannerHome = tool 'sonar-scanner'
                       withSonarQubeEnv('sonar-server') {
                           sh """
                               ${scannerHome}/bin/sonar-scanner \
                               -Dsonar.projectKey=MusicVibe \
                               -Dsonar.projectName=MusicVibe \
                               -Dsonar.sources=apps/api/src,apps/frontend/src \
                               -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/**
                           """
                       }
                   }
               }
           }
           
           stage('Quality Gate') {
               steps {
                   timeout(time: 5, unit: 'MINUTES') {
                       waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
                   }
               }
           }
           
           stage('Build Docker Image') {
               steps {
                   script {
                       withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
                           sh """
                               docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} \
                                            -t ${DOCKER_IMAGE}:latest .
                           """
                       }
                   }
               }
           }
           
           stage('Docker Image Scan') {
               steps {
                   sh """
                       trivy image --format table \
                            -o trivy-image-report.html \
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                   """
               }
           }
           
           stage('Push Docker Image') {
               steps {
                   script {
                       withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
                           sh """
                               docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                               docker push ${DOCKER_IMAGE}:latest
                           """
                       }
                   }
               }
           }
           
           stage('Deploy to Kubernetes') {
               steps {
                   withKubeConfig(
                       credentialsId: 'k8-cred', 
                       namespace: 'musicvibe'
                   ) {
                       sh """
                           kubectl apply -f kubernetes/musicvibe-deployment.yaml
                           kubectl set image deployment/musicvibe \
                               musicvibe=${DOCKER_IMAGE}:${DOCKER_TAG} \
                               -n musicvibe
                           kubectl rollout status deployment/musicvibe -n musicvibe
                       """
                   }
               }
           }
           
           stage('Verify Deployment') {
               steps {
                   withKubeConfig(
                       credentialsId: 'k8-cred', 
                       namespace: 'musicvibe'
                   ) {
                       sh """
                           kubectl get pods -n musicvibe
                           kubectl get svc -n musicvibe
                       """
                   }
               }
           }
       }
       
       post {
           always {
               cleanWs()
           }
       }
   }
   ```

3. **Update the variables in Jenkinsfile**:
   - Replace `your-dockerhub-username` with your Docker Hub username
   - Replace `<TOOLS_IP>` with your actual tools server IP
   - Replace repository URL with your forked repository

## Step 15: Create Kubernetes Deployment

1. **Create the Kubernetes deployment file**:
   ```bash
   mkdir -p kubernetes
   nano kubernetes/musicvibe-deployment.yaml
   ```

2. **Paste the deployment configuration**:
   ```yaml
   ---
   apiVersion: v1
   kind: Namespace
   metadata:
     name: musicvibe

   ---
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: musicvibe
     namespace: musicvibe
     labels:
       app: musicvibe
   spec:
     replicas: 2
     selector:
       matchLabels:
         app: musicvibe
     template:
       metadata:
         labels:
           app: musicvibe
       spec:
         containers:
         - name: musicvibe
           image: your-dockerhub-username/musicvibe:latest
           imagePullPolicy: Always
           ports:
           - containerPort: 4000
             name: http
           env:
           - name: NODE_ENV
             value: "production"
           - name: PORT
             value: "4000"
           resources:
             requests:
               memory: "256Mi"
               cpu: "100m"
             limits:
               memory: "512Mi"
               cpu: "250m"
           livenessProbe:
             httpGet:
               path: /health
               port: 4000
             initialDelaySeconds: 10
             periodSeconds: 10
           readinessProbe:
             httpGet:
               path: /health
               port: 4000
             initialDelaySeconds: 5
             periodSeconds: 5

   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: musicvibe-service
     namespace: musicvibe
     labels:
       app: musicvibe
   spec:
     type: LoadBalancer
     selector:
       app: musicvibe
     ports:
     - name: http
       protocol: TCP
       port: 80
       targetPort: 4000
       nodePort: 30080
   ```

3. **Update the image name** with your Docker Hub username

## Step 16: Commit and Push Changes

1. **Add files to git**:
   ```bash
   git add ci-cd/Jenkinsfile kubernetes/musicvibe-deployment.yaml
   git commit -m "Add CI/CD pipeline and Kubernetes deployment"
   git push origin main
   ```

## Step 17: Run the Pipeline

1. **Go to Jenkins → musicvibe-pipeline → "Build Now"**

2. **Monitor the pipeline**:
   - Click on the build number (e.g., #1)
   - Click "Console Output" to see logs
   - Watch each stage complete

3. **Expected pipeline stages**:
   -  Git Checkout
   -  File System Scan (Trivy)
   -  SonarQube Analysis
   -  Quality Gate
   -  Build Docker Image
   -  Docker Image Scan
   -  Push Docker Image
   -  Deploy to Kubernetes
   -  Verify Deployment

** PHASE-3 COMPLETE**: CI/CD Pipeline is working!

---

# PHASE-4 | Setup Monitoring

 **Terraform automated the monitoring stack!**

** Already installed via IaC:**
-  Prometheus (metrics collection)
-  Grafana (visualization)
-  Node Exporter (system metrics)
-  Docker Compose orchestration

## Step 18: Verify Prometheus (Pre-configured)

1. **Access Prometheus** (already running):
   ```
   http://<MONITORING_IP>:9090
   ```

2. **Verify auto-discovered targets**:
   - Go to "Status" → "Targets"
   -  **node-exporter**: localhost:9100 (system metrics)
   -  **prometheus**: localhost:9090 (self-monitoring)

3. **Test a query**:
   - Query: `up`
   - You should see all targets with value `1` (up)

## Step 19: Configure Grafana (Pre-installed)

1. **Access Grafana** (already running):
   ```
   http://<MONITORING_IP>:3000
   ```

2. **Login with defaults**:
   - **Username**: admin
   - **Password**: admin
   - Change password when prompted (e.g., `admin123`)

3. **Add Prometheus data source**:
   - Click "+" → "Data source"
   - Select "Prometheus"
   - **URL**: `http://localhost:9090` (auto-configured network)
   - Click "Save & test" 

4. **Import pre-built dashboard**:
   - Click "+" → "Import"
   - **Dashboard ID**: 1860 (Node Exporter Full)
   - Click "Load"
   - Select Prometheus data source
   - Click "Import"

## Step 20: Verify MusicVibe Application

1. **Check application pods**:
   ```bash
   ssh -i musicvibe-pipeline-key.pem ubuntu@<JENKINS_IP>
   kubectl get pods -n musicvibe
   kubectl get svc -n musicvibe
   ```

2. **Get application URL**:
   ```bash
   kubectl get svc musicvibe-service -n musicvibe -o wide
   ```

3. **Access MusicVibe**:
   ```
   http://<WORKER_NODE_IP>:30080
   ```

4. **Test the application**:
   - Search for music
   - Play 30-second previews
   - View lyrics
   - Add songs to favorites

** PHASE-4 COMPLETE**: Full monitoring setup!

---

#  FINAL VERIFICATION

## Infrastructure Status Check

Run these commands to verify everything is working:

```bash
# Check all infrastructure
terraform output

# Check Kubernetes cluster
ssh -i musicvibe-pipeline-key.pem ubuntu@<JENKINS_IP>
kubectl get nodes
kubectl get pods -A
kubectl get svc -n musicvibe

# Check application health
curl http://<WORKER_IP>:30080/health
```

## Service URLs Summary

| Service | URL | Purpose |
|---------|-----|---------|
| **Jenkins** | `http://<JENKINS_IP>:8080` | CI/CD Pipeline |
| **SonarQube** | `http://<TOOLS_IP>:9000` | Code Quality |
| **Nexus** | `http://<TOOLS_IP>:8081` | Artifact Repository |
| **Prometheus** | `http://<MONITORING_IP>:9090` | Metrics Collection |
| **Grafana** | `http://<MONITORING_IP>:3000` | Monitoring Dashboards |
| **MusicVibe** | `http://<WORKER_IP>:30080` | Live Application |

## Success Indicators

-  **5 EC2 instances** running and accessible
-  **Kubernetes cluster** with 3 nodes (1 master + 2 workers)
-  **Jenkins pipeline** executing all 8 stages successfully
-  **SonarQube** analyzing code quality
-  **Docker images** built and pushed to Docker Hub
-  **MusicVibe app** running on Kubernetes
-  **Monitoring** dashboards showing metrics

## Troubleshooting

**Terraform variable errors?**
- Ensure you're using object syntax (e.g., `aws_config = { region = "us-east-1" }`)
- NOT simple variables (e.g., `aws_region = "us-east-1"`)
- Copy from `terraform.auto.tfvars.example` to avoid syntax errors

**Software not installed after Terraform apply?**
- Check user_data script logs: `sudo journalctl -u cloud-final`
- Scripts location: `terraform/scripts/*.sh`
- Rerun manually if needed: `sudo /var/lib/cloud/instance/scripts/part-001`

**Need manual installation instead of automation?**
- Refer to **Learning Mode** details in Phase 2
- All automation scripts are in `terraform/scripts/` folder
- You can disable automation by commenting out `user_data` lines in `main.tf`

**Pipeline fails?**
- Check Jenkins console logs
- Verify all credentials are configured
- Ensure Docker Hub username is correct in Jenkinsfile

**Kubernetes pods not starting?**
```bash
kubectl describe pod <pod-name> -n musicvibe
kubectl logs <pod-name> -n musicvibe
```

**Application not accessible?**
- Check security groups allow inbound traffic
- Verify NodePort service is created
- Test from worker node: `curl localhost:30080/health`

## Cost Management

**To save money when not using:**
```bash
# Stop all instances (keeps data)
aws ec2 stop-instances --instance-ids <instance-ids>

# Or destroy everything
terraform destroy
```

**Next time:**
```bash
# Start instances
aws ec2 start-instances --instance-ids <instance-ids>

# Or redeploy
terraform apply
```

---

##  Congratulations! 

You have successfully deployed a **production-grade CI/CD pipeline** for the **MusicVibe application**!

##  **What You've Accomplished**

### **Infrastructure as Code Mastery:**
-  Deployed **5 EC2 instances** with Terraform automation
-  Used **user_data scripts** for consistent software installation  
-  Implemented **feature flags** for cost optimization
-  Applied **security groups** and **service discovery**

### **Production CI/CD Pipeline:**
-  Configured **Jenkins** with automated builds
-  Integrated **SonarQube** for code quality analysis
-  Set up **Nexus** for artifact management
-  Deployed a **Node.js/React application** on Kubernetes
-  Implemented **monitoring** with Prometheus + Grafana

### **DevOps Best Practices:**
-  **Infrastructure as Code** (Terraform)
-  **Containerization** (Docker)
-  **Orchestration** (Kubernetes)
-  **Automated Testing** (SonarQube integration)
-  **Monitoring & Observability** (Prometheus/Grafana)

---

# OPTIONAL | Setup GitHub Actions (Alternative CI/CD)

> **Note**: This is OPTIONAL if you prefer cloud-based CI/CD over Jenkins.

## Step 21: Configure GitHub Actions Workflow

The repository includes a GitHub Actions workflow (`.github/workflows/ci-cd-pipeline.yml`) that provides an alternative to Jenkins.

### Features:
-  **AWS OIDC** - No stored credentials needed
-  **Parallel execution** - Faster builds
-  **Security scans** - Non-blocking Trivy scans
-  **Conditional deployment** - Only on main branch
-  **Manual trigger** - workflow_dispatch support

### Required GitHub Secrets:

Go to: **Repository Settings → Secrets and Variables → Actions → New repository secret**

| Secret Name | Description | Where to Get |
|------------|-------------|--------------|
| `DOCKER_USERNAME` | Docker Hub username | Your Docker Hub account |
| `DOCKER_PASSWORD` | Docker Hub token | Docker Hub → Account Settings → Security |
| `AWS_ROLE_ARN` | AWS IAM Role ARN | From Terraform outputs: `github_actions_role_arn` |
| `AWS_REGION` | AWS region | Same as your Terraform `region` (e.g., `us-east-1`) |
| `EKS_CLUSTER_NAME` | Cluster name | Use `local-k8s` (or your cluster name) |

### Setup Steps:

1. **Get AWS Role ARN** (if OIDC configured in Terraform):
   ```bash
   cd terraform
   terraform output github_actions_role_arn
   ```

2. **Add secrets to GitHub**:
   - Go to your GitHub repository
   - Settings → Secrets and Variables → Actions
   - Click "New repository secret" for each

3. **Verify workflow file**:
   ```bash
   cat .github/workflows/ci-cd-pipeline.yml
   ```

4. **Push to trigger**:
   ```bash
   git add .
   git commit -m "feat: enable GitHub Actions CI/CD"
   git push origin main
   ```

5. **Monitor workflow**:
   - Go to GitHub → Actions tab
   - Watch the pipeline execute
   - Security scans are non-blocking (warnings only)

### Workflow Stages:

```
Setup → Lint → Security Scan → Build → Docker → Push → Deploy → Health Check → Notify
  ↓       ↓          ↓             ↓       ↓       ↓       ↓           ↓          ↓
Version  TS    Trivy (warn)    Compile  Build   DockerHub  K8s     HTTP 200    Status
```

### Benefits vs Jenkins:

| Feature | Jenkins | GitHub Actions |
|---------|---------|----------------|
| **Infrastructure** | Self-hosted (AWS EC2) | GitHub cloud (free for public repos) |
| **Setup** | Manual configuration | Automated with YAML |
| **Scaling** | Fixed resources | Auto-scales |
| **Cost** | ~$40/month (EC2) | Free (public repos) / Minutes-based |
| **Maintenance** | You manage updates | Managed by GitHub |

**Recommendation**: Use both! GitHub Actions for quick feedback, Jenkins for enterprise features.

---

##  **Next Steps for Production**

1. **Secure the setup**: Implement HTTPS, restrict security groups
2. **Scale horizontally**: Add more worker nodes as needed
3. **Backup strategy**: Configure automated backups  
4. **Cost optimization**: Use feature flags to disable unused services
5. **Learning deep-dive**: Try **Learning Mode** for manual installation experience

##  **Learning Mode Reference**

For **educational purposes**, all automation scripts are available:
- **Scripts location**: `terraform/scripts/*.sh`
- **Manual steps**: Expand "Learning Mode" sections in each phase
- **Deep learning**: Comment out `user_data` in `main.tf` and follow manual steps

**Your pipeline now automatically:**
1.  Scans code for security vulnerabilities
2.  Analyzes code quality with SonarQube
3.  Builds Docker containers
4.  Scans containers for security issues
5.  Publishes to Docker Hub
6.  Deploys to Kubernetes cluster
7.  Verifies deployment health
8.  Monitors with Prometheus & Grafana

**Ready for production deployment! **

---

*Made with  for DevOps learning and practice*
