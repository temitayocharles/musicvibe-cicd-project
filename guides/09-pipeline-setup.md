# Step 9: Create and Run CI/CD Pipeline

**Duration:** 25-30 minutes

**Goal:** Create Jenkins pipeline job and execute complete CI/CD workflow


---

<br>



## What You Will Do

<br>

<br>

* Create a new Pipeline job in Jenkins
* Configure GitHub repository connection
* Set up Jenkinsfile from repository
* Run the first build
* Watch all 11 stages execute
* Verify successful deployment


---

<br>



## Task 1: Create New Pipeline Job

<br>

<br>

Set up a new Jenkins pipeline project.


<br>

<br>

### Instructions

**1.1** Open Jenkins in your browser:

```
http://<JENKINS_MASTER_PUBLIC_IP>:8080
```


**1.2** Log in with your admin credentials.


**1.3** From the Dashboard, click "New Item" (left sidebar).


**1.4** Fill in the form:

```
Enter an item name: musicvibe-cicd
```


**1.5** Select "Pipeline" (scroll down to find it).


**1.6** Click "OK" at the bottom.


<br>

<br>

### Verification

**You should see:** Pipeline configuration page with multiple tabs (General, Build Triggers, Pipeline, etc.).


---

<br>



## Task 2: Configure Pipeline Description

<br>

<br>

Add a description for the pipeline.


<br>

<br>

### Instructions

**2.1** In the "General" section, check "Description" box if not already visible.


**2.2** Enter description:

```
Complete CI/CD pipeline for MusicVibe application.
Includes: build, test, code analysis, security scan, artifact storage, Docker build, and Kubernetes deployment.
```


**2.3** Do NOT click Save yet (we have more to configure).


<br>

<br>

### Verification

**You see:** Description field filled in.


---

<br>



## Task 3: Configure GitHub Project (Optional)

<br>

<br>

Link the pipeline to your GitHub repository.


<br>

<br>

### Instructions

**3.1** In "General" section, check "GitHub project" checkbox.


**3.2** Enter Project URL:

```
https://github.com/temitayocharles/musicvibe-cicd-project/
```


**Make sure the URL ends with a slash (/).**


**3.3** Do NOT click Save yet.


<br>

<br>

### Verification

**You see:** GitHub project URL configured.


---

<br>



## Task 4: Configure Build Triggers

<br>

<br>

Set up automatic builds on code changes.


<br>

<br>

### Instructions

**4.1** Scroll to "Build Triggers" section.


**4.2** Check "Poll SCM" checkbox.


**What this does:** Jenkins will check GitHub for changes every few minutes.


**4.3** In the "Schedule" field, enter:

```
H/5 * * * *
```


**What this means:** Check for changes every 5 minutes.


**Syntax explanation:**
* H/5: Every 5 minutes (H = hash to distribute load)
* *: Every hour
* *: Every day
* *: Every month
* *: Every day of week


**For manual builds only (alternative):**

If you prefer to trigger builds manually only, leave all checkboxes unchecked.


**4.4** Do NOT click Save yet.


<br>

<br>

### Verification

**You see:** "Poll SCM" configured with schedule `H/5 * * * *`.


---

<br>



## Task 5: Verify Jenkinsfile in Repository (Or Create If Building From Scratch)

<br>

<br>

The Jenkinsfile defines all pipeline stages. If you cloned the MusicVibe repository, it already exists. If building from scratch, create it now.


<br>

<br>

### Option A: Repository Already Has Jenkinsfile (Most Users)

**5A.1** If you cloned `https://github.com/temitayocharles/musicvibe-cicd-project.git`:

The Jenkinsfile already exists at `ci-cd/Jenkinsfile`. **Skip to Task 6.**


<br>

<br>

### Option B: Creating Jenkinsfile From Scratch (Advanced)

**Follow these steps only if you're building your own repository from scratch.**


**5B.1** On your local machine, navigate to your project directory:

```bash
cd ~/path/to/your-music-project
```


**5B.2** Create the `ci-cd` directory if it doesn't exist:

```bash
mkdir -p ci-cd
```


**5B.3** Create the Jenkinsfile:

```bash
vi ci-cd/Jenkinsfile
```


**5B.4** Press `i` to enter insert mode.


**5B.5** Paste this complete Jenkins pipeline configuration:

<details>
<summary>Click to expand complete Jenkinsfile (177 lines)</summary>

```groovy
pipeline {
    agent any
    
    tools {
        // Docker tool configured in Jenkins
    }
    
    environment {
        APP_NAME = "musicvibe"
        DOCKER_IMAGE = "YOUR_DOCKERHUB_USERNAME/musicvibe"
        DOCKER_TAG = "${BUILD_NUMBER}"
        SONAR_URL = "http://nexus-sonarqube.musicvibe-services.local:9000"
    }
    
    stages {
        
        stage('Git Checkout') {
            steps {
                git branch: 'main', 
                    credentialsId: 'git-cred',
                    url: 'https://github.com/YOUR_USERNAME/YOUR_REPO.git'
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
                            -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/*.test.ts,**/*.spec.ts
                        """
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
                    }
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
                    caCertificate: '', 
                    clusterName: 'kubernetes', 
                    contextName: '',
                    credentialsId: 'k8-cred', 
                    namespace: 'musicvibe', 
                    restrictKubeConfigAccess: false, 
                    serverUrl: 'https://YOUR_MASTER_IP:6443'
                ) {
                    sh """
                        kubectl apply -f kubernetes/musicvibe-deployment.yaml
                        kubectl set image deployment/musicvibe \
                            musicvibe=${DOCKER_IMAGE}:${DOCKER_TAG} \
                            -n musicvibe
                        kubectl rollout status deployment/musicvibe -n musicvibe --timeout=5m
                    """
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                withKubeConfig(
                    caCertificate: '', 
                    clusterName: 'kubernetes', 
                    contextName: '',
                    credentialsId: 'k8-cred', 
                    namespace: 'musicvibe', 
                    restrictKubeConfigAccess: false, 
                    serverUrl: 'https://YOUR_MASTER_IP:6443'
                ) {
                    sh """
                        echo '=== Deployment Status ==='
                        kubectl get deployment musicvibe -n musicvibe
                        
                        echo '=== Pod Status ==='
                        kubectl get pods -n musicvibe -l app=musicvibe
                        
                        echo '=== Service Status ==='
                        kubectl get svc musicvibe-service -n musicvibe
                    """
                }
            }
        }
    }
    
    post {
        always {
            script {
                def jobName = env.JOB_NAME
                def buildNumber = env.BUILD_NUMBER
                def pipelineStatus = currentBuild.result ?: 'UNKNOWN'
                def bannerColor = pipelineStatus.toUpperCase() == 'SUCCESS' ? 'green' : 'red'
                
                def body = """
                <html>
                <body>
                    <div>
                        <h2>${jobName} - Build ${buildNumber}</h2>
                        <div>
                            <h3>Pipeline Status: ${pipelineStatus.toUpperCase()}</h3>
                        </div>
                        <p>Check the <a href="${BUILD_URL}">console output</a>.</p>
                    </div>
                </body>
                </html>
                """
                
                emailext (
                    subject: "${jobName} - Build ${buildNumber} - ${pipelineStatus.toUpperCase()}",
                    body: body,
                    to: 'your-email@example.com',
                    from: 'jenkins@example.com',
                    replyTo: 'jenkins@example.com',
                    mimeType: 'text/html',
                    attachmentsPattern: 'trivy-image-report.html'
                )
            }
            cleanWs()
        }
    }
}
```

</details>


**IMPORTANT Customizations:**

Replace these placeholders:
* `YOUR_DOCKERHUB_USERNAME` → your Docker Hub username
* `YOUR_USERNAME/YOUR_REPO` → your GitHub repository
* `YOUR_MASTER_IP` → Jenkins/K8s master private IP


**5B.6** Press `ESC`, then type `:wq` and press `Enter` to save.


**5B.7** Commit and push to GitHub:

```bash
git add ci-cd/Jenkinsfile
git commit -m "Add Jenkins pipeline configuration"
git push origin main
```


<br>

<br>

### Verification

**Option A Users:** Jenkinsfile exists at `ci-cd/Jenkinsfile` in repository.

**Option B Users:** Jenkinsfile created, committed, and pushed to GitHub.


---

<br>



## Task 6: Configure Pipeline from SCM

<br>

<br>

Tell Jenkins to use Jenkinsfile from your GitHub repository.


<br>

<br>

### Instructions

**5.1** Scroll to "Pipeline" section.


**5.2** In "Definition" dropdown, select:

```
Pipeline script from SCM
```


**5.3** In "SCM" dropdown, select:

```
Git
```


**New fields will appear.**


**5.4** In "Repository URL", enter:

```
https://github.com/temitayocharles/musicvibe-cicd-project.git
```


**5.5** In "Credentials" dropdown:

**If your repository is public:**
Select: `- none -`


**If your repository is private:**
Select: `git-cred` (the GitHub credentials you created in Step 6)


**5.6** In "Branch Specifier" field, verify it shows:

```
*/main
```


**If your repository uses `master` branch instead of `main`, change it to:**

```
*/master
```


**5.7** In "Script Path" field, enter:

```
ci-cd/Jenkinsfile
```


**This tells Jenkins where to find the Jenkinsfile in your repository.**


**5.8** Leave all other settings as default.


**5.9** Now click "Save" button (bottom of page).


<br>

<br>

### Verification

**You should see:** Pipeline project page with "Build Now" button in left sidebar.


---

<br>



## Task 7: Trigger First Build

<br>

<br>

Run the pipeline for the first time.


<br>

<br>

### Instructions

**6.1** From the pipeline project page, click "Build Now" (left sidebar).


**6.2** You should see a build appear in "Build History" (left sidebar):

```
#1 <timestamp>
```


**6.3** Click on "#1" to open the build.


**6.4** Click "Console Output" (left sidebar).


**You will see:** Real-time build logs.


**The pipeline will execute these 11 stages:**

1. **Git Checkout** - Clone repository
2. **Compile** - Run `mvn compile`
3. **Unit Tests** - Run `mvn test`
4. **SonarQube Analysis** - Analyze code quality
5. **Quality Gate** - Wait for SonarQube results
6. **Build** - Run `mvn package` to create JAR
7. **Publish to Nexus** - Deploy artifact to Nexus
8. **Build Docker Image** - Create Docker image
9. **Trivy Scan** - Security scan of Docker image
10. **Push to Docker Hub** - Upload image to Docker Hub
11. **Deploy to Kubernetes** - Deploy to K8s cluster


**Expected duration:** 8-12 minutes for first build (longer because tools need to download dependencies).


<br>

<br>

### Verification

**You should see:** Console output showing each stage executing.


---

<br>



## Task 8: Monitor Build Progress

<br>

<br>

Watch the pipeline stages execute.


<br>

<br>

### Instructions

**7.1** Go back to the build page (click "#1" in breadcrumb at top).


**7.2** You should see "Stage View" showing all stages.


**Each stage will show:**
* Blue/Green = Success
* Red = Failed
* Gray/Flashing = In progress


**7.3** Watch the stages progress:


**Stage 1: Git Checkout**
```
Expected output:
Cloning repository...
Checking out Revision abc123...
```
Duration: ~30 seconds


**Stage 2: Compile**
```
Expected output:
[INFO] Building MusicVibe Application
[INFO] Compiling 10 source files...
[INFO] BUILD SUCCESS
```
Duration: ~2 minutes (first time downloads Maven dependencies)


**Stage 3: Unit Tests**
```
Expected output:
Running com.javaproject.DatabaseServiceProjectApplicationTests
Tests run: X, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```
Duration: ~1 minute


**Stage 4: SonarQube Analysis**
```
Expected output:
[INFO] SonarQube Scanner 6.2.1.4610
[INFO] Analyzing on SonarQube server...
[INFO] ANALYSIS SUCCESSFUL
```
Duration: ~2 minutes


**Stage 5: Quality Gate**
```
Expected output:
Checking Quality Gate status...
Quality Gate passed
```
Duration: ~30 seconds


**Stage 6: Build**
```
Expected output:
[INFO] Building jar: .../target/database-0.0.1-SNAPSHOT.jar
[INFO] BUILD SUCCESS
```
Duration: ~1 minute


**Stage 7: Publish to Nexus**
```
Expected output:
Uploading to maven-snapshots...
Uploaded to maven-snapshots: .../database-0.0.1-SNAPSHOT.jar
```
Duration: ~30 seconds


**Stage 8: Build Docker Image**
```
Expected output:
Successfully built abc123def456
Successfully tagged temitayocharles/musicvibe:latest
```
Duration: ~2 minutes


**Stage 9: Trivy Scan**
```
Expected output:
Scanning Docker image...
Total: 0 (CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0)
```
Duration: ~2 minutes


**Stage 10: Push to Docker Hub**
```
Expected output:
The push refers to repository [docker.io/temitayocharles/musicvibe]
latest: digest: sha256:abc123... size: 2841
```
Duration: ~1 minute


**Stage 11: Deploy to Kubernetes**
```
Expected output:
deployment.apps/musicvibe configured
service/musicvibe configured
Waiting for deployment to be ready...
deployment "musicvibe" successfully rolled out
```
Duration: ~30 seconds


<br>

<br>

### Verification

**All 11 stages should show green/blue (success).**


---

<br>



## Task 9: Review Build Results

<br>

<br>

Check that the build completed successfully.


<br>

<br>

### Instructions

**8.1** When all stages complete, go to "Console Output".


**8.2** Scroll to the bottom.


**8.3** You should see:

```
[Pipeline] End of Pipeline
Finished: SUCCESS
```


**8.4** Go back to the pipeline project page.


**8.5** You should see:

```
Last Successful Build: #1
Last Stable Build: #1
```


<br>

<br>

### Verification

**Build status:** SUCCESS (green checkmark or blue ball).


---

<br>



## Task 10: Verify Artifacts in Nexus

<br>

<br>

Check that artifacts were published to Nexus.


<br>

<br>

### Instructions

**9.1** Open Nexus in browser:

```
http://<NEXUS_SONARQUBE_PUBLIC_IP>:8081
```


**9.2** Log in (admin/admin123).


**9.3** Click "Browse" (left sidebar).


**9.4** Click "maven-snapshots".


**9.5** Navigate through folders:

```
com/
  → musicvibe/
    → database/
      → 0.0.1-SNAPSHOT/
```


**9.6** You should see:

```
database-0.0.1-SNAPSHOT.jar
database-0.0.1-SNAPSHOT.pom
```


**These are your Maven artifacts!**


<br>

<br>

### Verification

**Artifacts exist in Nexus** maven-snapshots repository.


---

<br>



## Task 11: Verify Code Analysis in SonarQube

<br>

<br>

Check code quality analysis results.


<br>

<br>

### Instructions

**10.1** Open SonarQube in browser:

```
http://<NEXUS_SONARQUBE_PUBLIC_IP>:9000
```


**10.2** Log in (admin / your SonarQube password).


**10.3** You should see a project:

```
com.musicvibe:database
```


**10.4** Click on the project.


**10.5** Review the analysis:

```
Quality Gate: Passed (or Failed if quality issues exist)
Bugs: X
Vulnerabilities: X
Code Smells: X
Coverage: X%
Duplications: X%
```


**10.6** Click on each metric to see details.


<br>

<br>

### Verification

**SonarQube analyzed the code** and shows quality metrics.


---

<br>



## Task 12: Verify Docker Image in Docker Hub

<br>

<br>

Check that the image was pushed to Docker Hub.


<br>

<br>

### Instructions

**11.1** Open Docker Hub in browser:

```
https://hub.docker.com
```


**11.2** Log in with your Docker Hub credentials.


**11.3** Click on "Repositories".


**11.4** You should see:

```
temitayocharles/musicvibe
```


**11.5** Click on it.


**11.6** You should see:

```
Tag: latest
Last Pushed: <recent timestamp>
```


**11.7** Note the image size and digest.


<br>

<br>

### Verification

**Docker image exists** in your Docker Hub repository with tag `latest`.


---

<br>



## Task 13: Verify Deployment in Kubernetes

<br>

<br>

Check that the application is running in Kubernetes.


<br>

<br>

### Instructions

**12.1** SSH to Kubernetes master:

```bash
ssh -i k8s-pipeline-key.pem ubuntu@<JENKINS_MASTER_PUBLIC_IP>
```


**12.2** Check deployment:

```bash
kubectl get deployments -n webapps
```


**Expected output:**

```
NAME        READY   UP-TO-DATE   AVAILABLE   AGE
musicvibe   2/2     2            2           Xm
```


**READY should be 2/2** (2 replicas running).


**12.3** Check pods:

```bash
kubectl get pods -n webapps
```


**Expected output:**

```
NAME                         READY   STATUS    RESTARTS   AGE
musicvibe-xxxxxxxxxx-xxxxx   1/1     Running   0          Xm
musicvibe-xxxxxxxxxx-xxxxx   1/1     Running   0          Xm
```


**Both pods should be Running.**


**12.4** Check service:

```bash
kubectl get svc -n webapps
```


**Expected output:**

```
NAME        TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
musicvibe   LoadBalancer   10.96.xxx.xxx   <pending>     80:xxxxx/TCP   Xm
```


**Note:** EXTERNAL-IP will show `<pending>` because we're not using a cloud load balancer. The NodePort (xxxxx) is what we'll use.


**12.5** Get the NodePort:

```bash
kubectl get svc musicvibe -n webapps -o jsonpath='{.spec.ports[0].nodePort}'
```


**Example output:** `32000`


**12.6** Test application from master node:

```bash
curl http://localhost:<NODE_PORT>
```


Replace `<NODE_PORT>` with the number from previous step.


**Expected output:** HTML content of the musicvibe application.


**12.7** Exit SSH:

```bash
exit
```


<br>

<br>

### Verification

**Application is deployed and running** in Kubernetes with 2 healthy pods.


---

<br>



## Task 14: Access Application in Browser

<br>

<br>

Open the musicvibe application.


<br>

<br>

### Instructions

**13.1** Get one of the worker node public IPs from your terraform outputs.


**13.2** Open in browser:

```
http://<WORKER_NODE_PUBLIC_IP>:<NODE_PORT>
```


Example: `http://54.123.45.67:32000`


**13.3** You should see the MusicVibe Database application home page.


**13.4** Test login functionality:

**Click "Login" or navigate to login page.**


**Try these credentials:**

```
Username: bugs
Password: bunny
```

Or:

```
Username: daffy
Password: duck
```


**13.5** Explore the application.


<br>

<br>

### Verification

**Application is accessible** via browser and login works.


---

<br>



## Checklist: Pipeline Setup Complete

<br>

<br>

Verify all tasks:

```
[ ] Pipeline job created (name: musicvibe-cicd)
[ ] GitHub repository configured
[ ] Jenkinsfile path set to ci-cd/Jenkinsfile
[ ] First build triggered and completed successfully
[ ] All 11 stages passed (green/blue)
[ ] Build status: SUCCESS
[ ] Artifacts published to Nexus (maven-snapshots)
[ ] Code analyzed in SonarQube
[ ] Docker image pushed to Docker Hub
[ ] Application deployed to Kubernetes (2/2 pods running)
[ ] Application accessible via browser
[ ] Login functionality works
```


---

<br>



## Important Information to Record

<br>

<br>

**Add to your notes:**

```
=== Pipeline Details ===
Job Name: musicvibe-cicd
Repository: https://github.com/temitayocharles/musicvibe-cicd-project.git
Branch: main
Jenkinsfile Path: ci-cd/Jenkinsfile
Poll SCM: H/5 * * * * (every 5 minutes)

=== Build #1 Results ===
Status: SUCCESS
Duration: ~8-12 minutes
Stages: 11/11 passed
Maven Artifact: database-0.0.1-SNAPSHOT.jar
Docker Image: temitayocharles/musicvibe:latest
K8s Namespace: webapps
K8s Deployment: musicvibe (2 replicas)

=== Application Access ===
URL: http://<WORKER_IP>:<NODE_PORT>
Login: bugs/bunny or daffy/duck
```


---

<br>



## Troubleshooting

<br>

<br>

**Problem:** Build fails at "Git Checkout" stage

**Solution:**
1. Verify GitHub repository URL is correct
2. If repository is private, ensure git-cred credentials are configured
3. Check network connectivity from Jenkins to GitHub


**Problem:** Build fails at "Compile" or "Test" stage

**Solution:**
```
Check console output for Maven errors:
- Missing dependencies (wait for Maven to download)
- Java version mismatch (verify JDK 17 configured)
- Code compilation errors (fix in source code)
```


**Problem:** Build fails at "SonarQube Analysis" stage

**Solution:**
1. Verify SonarQube is running: `docker ps | grep sonar`
2. Check SonarQube server configured in Jenkins (Step 6, Task 14)
3. Verify sonar-token credential is correct
4. Test connection: `curl http://nexus-sonarqube.musicvibe-services.local:9000`


**Problem:** Quality Gate fails

**Solution:**
1. Go to SonarQube and review failed conditions
2. Fix code quality issues, or
3. Create a more relaxed quality gate (see Step 7, Task 4)
4. Or temporarily disable quality gate in Jenkinsfile


**Problem:** Build fails at "Publish to Nexus" stage

**Solution:**
```
Common causes:
- Nexus credentials incorrect in Maven settings
- Nexus not running: docker ps | grep nexus
- Repository doesn't exist in Nexus
- Check console for 401 Unauthorized error

Verify:
1. Nexus admin password is admin123
2. Jenkins global-settings has correct credentials
3. Repository IDs in pom.xml match Nexus (maven-releases, maven-snapshots)
```


**Problem:** Build fails at "Push to Docker Hub" stage

**Solution:**
1. Verify docker-cred credentials in Jenkins
2. Log in to Docker Hub and check quota limits
3. Ensure repository name matches: temitayocharles/musicvibe
4. Check console for authentication errors


**Problem:** Build fails at "Deploy to Kubernetes" stage

**Solution:**
```bash
# SSH to Jenkins master
ssh ubuntu@<JENKINS_IP>

# Test kubectl access
kubectl get nodes

# Check namespace exists
kubectl get namespace webapps

# Verify k8-cred credential contains valid kubeconfig
```


**Problem:** Application pods not running

**Solution:**
```bash
# Check pod status
kubectl get pods -n webapps

# Check pod logs
kubectl logs <pod-name> -n webapps

# Describe pod to see events
kubectl describe pod <pod-name> -n webapps

# Common issues:
# - Image pull error (check Docker Hub image exists)
# - Insufficient resources (check node resources)
# - Application crash (check logs)
```


**Problem:** Cannot access application in browser

**Solution:**
1. Verify security group allows NodePort range (30000-32767)
2. Check pods are Running: `kubectl get pods -n webapps`
3. Test from within cluster first: `curl http://localhost:<NODE_PORT>`
4. Try accessing from different worker node IP


**Problem:** Pipeline takes very long (>20 minutes)

**Solution:**
1. First build is slower (Maven downloads dependencies)
2. Subsequent builds should be 5-8 minutes
3. Check if SonarQube analysis is hanging (timeout issue)
4. Verify network speed between Jenkins and Nexus/SonarQube


---

<br>



## Next Steps

<br>

<br>

Proceed to **Step 10: Verification and Testing** (`10-verification.md`)

You will perform comprehensive testing and create final documentation.


---

<br>



**Completion Time:** First build: 25-30 minutes. Subsequent builds: 5-8 minutes.


**Congratulations! Your complete CI/CD pipeline is working!**


You have successfully:
* Built a Java application with Maven
* Analyzed code quality with SonarQube
* Stored artifacts in Nexus
* Created and scanned a Docker image
* Deployed to Kubernetes automatically


This is a production-grade CI/CD pipeline!
