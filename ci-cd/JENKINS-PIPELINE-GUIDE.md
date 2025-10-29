# Jenkins Pipeline Configuration for MusicVibe

## Overview

This guide explains how to configure the Jenkins pipeline for the MusicVibe Node.js/TypeScript application. Unlike traditional Java/Maven projects, MusicVibe uses a Docker-first approach with simplified CI/CD stages.

## Key Differences from Java/Maven Pipelines

### What's Different?

| Aspect | Java/Maven (Traditional) | Node.js/Docker (MusicVibe) |
|--------|--------------------------|----------------------------|
| **Build Tool** | Maven 3.x | Docker multi-stage build |
| **Compilation** | `mvn compile` | TypeScript compiled in Docker |
| **Testing** | `mvn test` (JUnit) | Optional npm test (skipped in pipeline) |
| **Artifact Storage** | Nexus Repository | Docker Hub (container images only) |
| **Code Quality** | SonarQube (Java analyzer) | SonarQube (TypeScript/JavaScript analyzer) |
| **Security Scanning** | Trivy (filesystem + image) | Trivy (filesystem + image) |
| **Deployment** | JAR file to Kubernetes | Docker image to Kubernetes |

### What's Removed?

1. **Maven Build Stages** - No compile/test/package stages
2. **Nexus Artifact Publishing** - Docker images go directly to Docker Hub
3. **JDK Configuration** - No Java tools needed
4. **Maven Settings** - No pom.xml or Maven repositories

### What's Added?

1. **Simplified Build** - Single Docker build command
2. **Frontend Integration** - React frontend built into Docker image
3. **Health Checks** - Application health verification after deployment
4. **Multi-stage Docker** - Efficient image building

## Pipeline Stages Explained

### Stage 1: Git Checkout
```groovy
stage('Git Checkout') {
    steps {
        git branch: 'main', 
            credentialsId: 'git-cred',
            url: 'https://github.com/temitayocharles/musicvibe-cicd-project.git'
    }
}
```

**What it does:**
- Clones the repository from GitHub
- Uses credentials stored in Jenkins

**You must update:**
- `url`: Your GitHub repository URL
- Ensure `git-cred` credential exists in Jenkins

---

### Stage 2: Filesystem Scan
```groovy
stage('File System Scan') {
    steps {
        sh "trivy fs --format table -o trivy-fs-report.html ."
    }
}
```

**What it does:**
- Scans source code for vulnerabilities
- Checks dependencies (package.json, package-lock.json)
- Generates HTML report

**Output:** `trivy-fs-report.html` (attached to email)

---

### Stage 3: SonarQube Analysis
```groovy
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
                    -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/*.test.ts \
                    -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
                """
            }
        }
    }
}
```

**What it does:**
- Analyzes TypeScript and JavaScript code quality
- Scans both API and frontend source code
- Excludes node_modules and build artifacts

**Requirements:**
- SonarQube Scanner configured in Jenkins Tools
- SonarQube server configured in Jenkins System
- `sonar-server` credential exists

---

### Stage 4: Quality Gate
```groovy
stage('Quality Gate') {
    steps {
        script {
            timeout(time: 5, unit: 'MINUTES') {
                waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
            }
        }
    }
}
```

**What it does:**
- Waits for SonarQube to finish analysis
- Checks if code meets quality standards
- Does NOT abort pipeline on failure (set to `false`)

**Note:** Change `abortPipeline: true` to fail builds with poor code quality

---

### Stage 5: Build Docker Image
```groovy
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
```

**What it does:**
- Builds Docker image using root Dockerfile
- Multi-stage build: compiles TypeScript + bundles frontend
- Tags with build number and 'latest'

**Important:**
- Dockerfile is at repository root
- Contains both API and frontend build steps
- No manual npm install needed

---

### Stage 6: Docker Image Scan
```groovy
stage('Docker Image Scan') {
    steps {
        sh """
            trivy image --format table \
                 -o trivy-image-report.html \
                 ${DOCKER_IMAGE}:${DOCKER_TAG}
        """
    }
}
```

**What it does:**
- Scans Docker image for vulnerabilities
- Checks base image and dependencies
- Generates HTML report

---

### Stage 7: Push Docker Image
```groovy
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
```

**What it does:**
- Pushes image to Docker Hub
- Pushes both tagged and latest versions

**You must update:**
- `DOCKER_IMAGE` environment variable to your Docker Hub username

---

### Stage 8: Deploy to Kubernetes
```groovy
stage('Deploy to Kubernetes') {
    steps {
        withKubeConfig(
            credentialsId: 'k8-cred', 
            namespace: 'musicvibe',
            serverUrl: 'https://172.31.8.146:6443'
        ) {
            sh """
                kubectl apply -f kubernetes/musicvibe-deployment.yaml
                kubectl set image deployment/musicvibe \
                    musicvibe=${DOCKER_IMAGE}:${DOCKER_TAG} -n musicvibe
                kubectl rollout status deployment/musicvibe -n musicvibe
            """
        }
    }
}
```

**What it does:**
- Applies Kubernetes manifests
- Updates deployment with new image
- Waits for rollout to complete

**You must update:**
- `serverUrl`: Your Kubernetes master private IP and port
- Ensure `k8-cred` contains valid kubeconfig

---

### Stage 9: Verify Deployment
```groovy
stage('Verify Deployment') {
    steps {
        withKubeConfig(...) {
            sh """
                kubectl get pods -n musicvibe
                kubectl get svc -n musicvibe
                # Health check
                POD_NAME=\$(kubectl get pods -n musicvibe -l app=musicvibe -o jsonpath='{.items[0].metadata.name}')
                kubectl exec -n musicvibe \$POD_NAME -- curl -s http://localhost:4000/health
            """
        }
    }
}
```

**What it does:**
- Shows pod and service status
- Tests health endpoint inside pod
- Confirms application is running

---

## Environment Variables

Set these at the top of Jenkinsfile:

```groovy
environment {
    APP_NAME = "musicvibe"
    DOCKER_IMAGE = "temitayocharles/musicvibe"  // Change to your Docker Hub username
    DOCKER_TAG = "${BUILD_NUMBER}"
    SCANNER_HOME = tool 'sonar-scanner'
}
```

**You must change:**
- `DOCKER_IMAGE` - Replace `temitayocharles` with YOUR Docker Hub username

---

## Required Jenkins Credentials

Create these in Jenkins → Manage Jenkins → Credentials:

| ID | Type | Purpose | How to Get |
|----|------|---------|------------|
| `git-cred` | Username/Password | GitHub access | GitHub username + Personal Access Token |
| `docker-cred` | Username/Password | Docker Hub | Docker Hub username + password |
| `sonar-token` | Secret Text | SonarQube | SonarQube → My Account → Security → Generate Token |
| `k8-cred` | Secret File | Kubernetes | Copy content of `~/.kube/config` from K8s master |

---

## Required Jenkins Tools

Configure in Jenkins → Manage Jenkins → Tools:

### Docker
- **Name:** `docker`
- **Install automatically:** ✓
- **Version:** latest

### SonarQube Scanner
- **Name:** `sonar-scanner`
- **Install automatically:** ✓
- **Version:** Latest

---

## Required Jenkins Plugins

Install from Manage Jenkins → Plugins:

1. **Docker** - Docker integration
2. **Docker Pipeline** - Docker commands in pipeline
3. **SonarQube Scanner** - Code quality analysis
4. **Kubernetes CLI** - kubectl commands
5. **Kubernetes** - Kubernetes integration
6. **Email Extension** - Email notifications
7. **Git** - Git repository integration

---

## Post-Build Actions

### Email Notifications

```groovy
post {
    always {
        emailext (
            subject: "${jobName} - Build ${buildNumber} - ${pipelineStatus}",
            body: body,  // HTML formatted
            to: 'your-email@example.com',  // CHANGE THIS
            attachmentsPattern: 'trivy-image-report.html'
        )
        cleanWs()
    }
}
```

**You must update:**
- `to: 'your-email@example.com'` - Your actual email

**Configure SMTP:**
- Manage Jenkins → System → Extended E-mail Notification
- Set SMTP server, port, credentials

---

## Testing the Pipeline

### Before Running:

1. **Verify credentials exist:**
   ```bash
   # In Jenkins → Credentials → System → Global credentials
   - git-cred
   - docker-cred
   - sonar-token
   - k8-cred
   ```

2. **Update Jenkinsfile variables:**
   - DOCKER_IMAGE (your Docker Hub username)
   - Email address
   - Kubernetes serverUrl

3. **Ensure Kubernetes namespace exists:**
   ```bash
   kubectl create namespace musicvibe
   ```

### First Build:

1. Click "Build Now" in Jenkins
2. Watch console output
3. Each stage should turn green
4. Build time: ~5-8 minutes (first build)
5. Subsequent builds: ~3-5 minutes

### Common Issues:

| Error | Solution |
|-------|----------|
| Docker not found | Configure Docker tool in Jenkins |
| Permission denied (docker) | Add jenkins user to docker group: `sudo usermod -aG docker jenkins` |
| Kubectl not found | Install kubectl on Jenkins server |
| Can't connect to K8s | Check serverUrl, verify kubeconfig, check firewall |
| SonarQube timeout | Increase timeout or skip quality gate |

---

## Accessing the Application

After successful deployment:

1. **Get NodePort:**
   ```bash
   kubectl get svc musicvibe-service -n musicvibe
   ```

2. **Access application:**
   ```
   http://<K8s-Worker-Public-IP>:<NodePort>
   ```

3. **Health check:**
   ```bash
   curl http://<K8s-Worker-Public-IP>:<NodePort>/health
   ```

4. **API test:**
   ```bash
   curl http://<K8s-Worker-Public-IP>:<NodePort>/api/v1/songs
   ```

---

## Comparison: Full Pipeline vs Simplified Pipeline

### If You Want Full Node.js Testing (Optional)

Add these stages BEFORE Docker build:

```groovy
stage('Install Dependencies') {
    steps {
        sh """
            cd apps/api && npm ci
            cd ../frontend && npm ci
        """
    }
}

stage('Run Tests') {
    steps {
        sh """
            cd apps/api && npm test
            cd ../frontend && npm test
        """
    }
}

stage('Generate Coverage') {
    steps {
        sh """
            cd apps/api && npm run test:coverage
            cd ../frontend && npm run test:coverage
        """
    }
}
```

**Pros:**
- Catches bugs before Docker build
- Coverage reports for SonarQube
- Faster feedback

**Cons:**
- Requires Node.js on Jenkins server
- Longer build time
- More complex setup

**Current approach (Docker-only):**
- Simpler setup
- No Node.js needed on Jenkins
- Dockerfile handles all building
- Slightly longer builds (compile happens in Docker)

---

## Next Steps

1. **Customize the pipeline** - Add your own stages
2. **Set up monitoring** - Add Prometheus metrics
3. **Enable auto-deploy** - Use webhooks for automatic builds
4. **Add slack notifications** - Install Slack plugin
5. **Implement blue-green deployment** - Zero-downtime updates

---

## Resources

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Plugin Documentation](https://plugins.jenkins.io/docker-plugin/)
- [Kubernetes Plugin Documentation](https://plugins.jenkins.io/kubernetes/)
- [SonarQube Scanner Documentation](https://docs.sonarqube.org/latest/analyzing-source-code/scanners/jenkins-extension-sonarqube/)

---

**Created for:** MusicVibe CI/CD Project  
**Last Updated:** October 29, 2025  
**Author:** Temitayo Charles Akinniranye
