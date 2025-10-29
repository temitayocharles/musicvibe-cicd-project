# Step 6: Jenkins Configuration

<br>

**Duration:** 30-40 minutes (most detailed step)

**Goal:** Configure Jenkins with plugins, tools, and credentials for CI/CD pipeline

<br>

**Note:** This is the longest step because Jenkins has many settings. Take your time and follow carefully.

<br>

---

<br>


<br>

## What You Will Configure

<br>

<br>

* Install Jenkins on the master node
* Install Docker and Trivy for security scanning
* Access Jenkins web interface
* Install required plugins
* Configure Java 17 (JDK)
* Configure Docker tool
* Configure SonarQube scanner
* Set up credentials for Docker Hub, SonarQube, Kubernetes, and GitHub


---

<br>



## Task 1: Install Jenkins on Master Node

<br>

<br>

Jenkins was automatically installed by Terraform, but let's verify and understand the installation.


<br>

<br>

### Instructions

**1.1** SSH to the Jenkins/K8s master node:

```bash
cd ~/Documents/PROJECTS/ec2-k8s
ssh -i k8s-pipeline-key.pem ubuntu@<JENKINS_MASTER_PUBLIC_IP>
```

Replace `<JENKINS_MASTER_PUBLIC_IP>` with the IP from your terraform outputs.


**1.2** Check if Jenkins is installed and running:

```bash
sudo systemctl status jenkins
```

<br>

**Expected output:**

```
● jenkins.service - Jenkins Continuous Integration Server
     Loaded: loaded (/lib/systemd/system/jenkins.service; enabled; vendor preset: enabled)
     Active: active (running) since ...
```

**You should see:** `Active: active (running)` in green text.

<br>

**1.3** Check Jenkins version:

```bash
jenkins --version
```

<br>

**Expected output:**

```
2.4xx.x
```

<br>

---

<br>


<br>

<br>

<br>

### If Jenkins is NOT Installed (Manual Installation Steps)

<br>

**If the above commands fail, Jenkins was not installed by Terraform. Install it manually:**

<br>

```bash
vi install_jenkins.sh
```

<br>

**1.5** Press `i` to enter insert mode, then paste this complete script:


**1.3** Verify Docker is installed:

```bash
docker --version
```

<br>

**Expected output:**

```
Docker version 24.x.x, build xxxxx
```

<br>

**2.2** Check if Trivy is installed:
```


**Expected output:**
```
Docker version 24.0.x, build...
```


**1.4** Verify Trivy is installed:

```bash
trivy --version
```


**Expected output:**
```
trivy --version
```

<br>

**Expected output:**

```
Version: 0.xx.x
```

<br>

---

<br>


<br>

<br>

<br>

### If Docker or Trivy is NOT Installed (Manual Installation Steps)

<br>

<details>
<summary><b>Click here to see manual Docker installation steps (only if needed)</b></summary>

<br>

**2.3** Create Docker installation script:

```bash
vi install_docker.sh
```

<br>

**2.4** Press `i` for insert mode, paste this complete script:

```bash
#!/bin/bash
# Update package manager repositories
sudo apt-get update

# Install necessary dependencies
sudo apt-get install -y ca-certificates curl

# Create directory for Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings

# Download Docker's GPG key
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc

# Ensure proper permissions for the key
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository to Apt sources
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package manager repositories
sudo apt-get update

# Install Docker
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

<br>

**2.5** Save: Press `ESC`, type `:wq`, press `Enter`

<br>

**2.6** Make executable and run:

```bash
chmod +x install_docker.sh
./install_docker.sh
```

<br>

**2.7** Add Jenkins user to docker group:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

</details>

<br>

<details>
<summary><b>Click here to see manual Trivy installation steps (only if needed)</b></summary>

<br>

**2.8** Create Trivy installation script:

```bash
vi install_trivy.sh
```

<br>

**2.9** Press `i` for insert mode, paste this complete script:

```bash
#!/bin/bash
sudo apt-get install wget apt-transport-https gnupg lsb-release -y
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy -y
```

<br>

**2.10** Save: Press `ESC`, type `:wq`, press `Enter`

<br>

**2.11** Make executable and run:

```bash
chmod +x install_trivy.sh
./install_trivy.sh
```

</details>

<br>

---

<br>


<br>

<br>

<br>

### Verification

<br>

**All three tools should be installed and working:**

```bash
sudo systemctl status jenkins   # Should show "active (running)"
docker --version                 # Should show Docker version
trivy --version                  # Should show Trivy version
```

<br>

---

<br>


<br>

## Task 3: Access Jenkins and Get Initial Password

<br>

<br>

Log in to Jenkins for the first time.


<br>

<br>

### Instructions

**2.1** Open Jenkins URL in your browser:

```
http://<JENKINS_MASTER_PUBLIC_IP>:8080
```


**You will see:** "Unlock Jenkins" page asking for administrator password.


**2.2** Get the initial admin password:

**In your SSH session** (still connected to Jenkins master), run:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```


**Expected output:** A long password like:
```
a771e06575b54f91bc56a42ccdbb2f76
```


**2.3** Copy this password.


**2.4** Paste it into the "Administrator password" field in your browser.


**2.5** Click "Continue".


<br>

<br>

### Verification

**You should now see:** "Customize Jenkins" page with plugin installation options.


---

<br>



## Task 3: Install Suggested Plugins

<br>

<br>

Install the basic Jenkins plugins.


<br>

<br>

### Instructions

**3.1** Click "Install suggested plugins".


**You will see:** A progress screen showing plugins being installed.


**Plugins being installed include:**
* Git
* GitHub
* Pipeline
* Credentials
* And many others...


**This process takes 3-5 minutes.**


**Wait for all plugins to complete.** Green checkmarks will appear next to each plugin.


<br>

<br>

### Verification

**When complete, you will see:** "Create First Admin User" page.


---

<br>



## Task 4: Create Admin User

<br>

<br>

Create your Jenkins administrator account.


<br>

<br>

### Instructions

**3.1** Fill in the form:

```
Username: admin
Password: <choose a strong password>
Confirm password: <same password>
Full name: <your name>
E-mail address: <your email>
```


**IMPORTANT:** Write down your username and password! You will need these to log in later.


**3.2** Click "Save and Continue".


**3.3** On "Instance Configuration" page, keep the default Jenkins URL:

```
http://<YOUR_IP>:8080/
```


**3.4** Click "Save and Finish".


**3.5** Click "Start using Jenkins".


<br>

<br>

### Verification

**You should now see:** Jenkins Dashboard with "Welcome to Jenkins!" message.


---

<br>



## Task 5: Install Additional Required Plugins

<br>

<br>

Install 8 more plugins needed for the CI/CD pipeline.


<br>

<br>

### Instructions

**4.1** From Jenkins Dashboard, click "Manage Jenkins" (left sidebar).


**4.2** Click "Plugins" (or "Manage Plugins").


**4.3** Click the "Available plugins" tab.


**Now install each plugin one by one:**


**Plugin 1: Eclipse Temurin Installer**

**4.4** In the search box, type: `Eclipse Temurin Installer`


**4.5** Check the box next to "Eclipse Temurin Installer".


**4.6** Click "Install" button (bottom of page).


**Wait for installation to complete** (shows "Success" in green).


**4.7** Click "Go back to top page".


**Repeat steps 4.1-4.7 for each of the following plugins:**


**Plugin 2: SonarQube Scanner**

Search for: `SonarQube Scanner`


**Plugin 3: Config File Provider**

Search for: `Config File Provider`


**Plugin 4: Pipeline Maven Integration**

Search for: `Pipeline Maven Integration`


**Plugin 5: Docker**

Search for: `Docker`


**Plugin 6: Docker Pipeline**

Search for: `Docker Pipeline`


**Plugin 7: Kubernetes CLI**

Search for: `Kubernetes CLI`


**Plugin 8: Kubernetes**

Search for: `Kubernetes`


**IMPORTANT:** After installing all plugins, you may see "Restart Jenkins when installation is complete and no jobs are running" checkbox. Check it.


**4.8** Wait for Jenkins to restart (takes 30-60 seconds).


**4.9** Log in again with your admin credentials.


<br>

<br>

### Verification

**Verify plugins are installed:**

1. Click "Manage Jenkins" → "Plugins"
2. Click "Installed plugins" tab
3. Search for each plugin name
4. All 8 should appear in the list with green checkmarks


---

<br>



## Task 6: Configure Java (JDK 17)

<br>

<br>

Tell Jenkins where to find Java 17.


<br>

<br>

### Instructions

**5.1** Click "Manage Jenkins" (left sidebar).


**5.2** Scroll down and click "Tools" (under "System Configuration" section).


**5.3** Scroll down to find "JDK installations" section.


**5.4** Click "Add JDK" button.


**5.5** Fill in the form:

```
Name: jdk17
```


**5.6** Uncheck "Install automatically" checkbox.


**5.7** In "JAVA_HOME" field, enter:

```
/usr/lib/jvm/java-17-openjdk-amd64
```


**This is the path where Java 17 is installed on the Jenkins server.**


**5.8** Do NOT click Save yet (we have more tools to configure).


<br>

<br>

### Verification

**You should see:** JDK configuration section filled with name "jdk17" and JAVA_HOME path.


---

<br>



## Task 7: Configure Maven

<br>

<br>

Configure Maven build tool.


<br>

<br>

### Instructions

**Still on the same "Tools" configuration page...**


**6.1** Scroll down to "Maven installations" section.


**6.2** Click "Add Maven" button.


**6.3** Fill in the form:

```
Name: maven3.6
```


**Note:** The name must be exactly `maven3.6` (our Jenkinsfile references this name).


**6.4** Check "Install automatically" checkbox.


**6.5** In the "Version" dropdown, select:

```
3.9.6
```


**Or the latest 3.x version available.**


**6.6** Do NOT click Save yet.


<br>

<br>

### Verification

**You should see:** Maven configuration with name "maven3.6" and version "3.9.6".


---

<br>



## Task 8: Configure Docker

<br>

<br>

Configure Docker tool for building images.


<br>

<br>

### Instructions

**Still on the same "Tools" page...**


**7.1** Scroll down to "Docker installations" section.


**7.2** Click "Add Docker" button.


**7.3** Fill in the form:

```
Name: docker
```


**7.4** Check "Install automatically" checkbox.


**7.5** In "Download from docker.com" dropdown, select:

```
Latest
```


**Or select a specific version like `24.0.7`.**


**7.6** Do NOT click Save yet.


<br>

<br>

### Verification

**You should see:** Docker configuration with name "docker".


---

<br>



## Task 9: Configure SonarQube Scanner

<br>

<br>

Configure SonarQube code analysis tool.


<br>

<br>

### Instructions

**Still on the same "Tools" page...**


**8.1** Scroll down to "SonarQube Scanner installations" section.


**8.2** Click "Add SonarQube Scanner" button.


**8.3** Fill in the form:

```
Name: sonar-scanner
```


**8.4** Check "Install automatically" checkbox.


**8.5** In "Version" dropdown, select:

```
SonarQube Scanner 6.2.1.4610
```


**Or the latest version available.**


**8.6** Now click "Save" button (at the bottom of the page).


<br>

<br>

### Verification

**You should see:** Jenkins Dashboard again. All tools are now configured.


---

<br>



## Task 10: Add Docker Hub Credentials

<br>

<br>

Add your Docker Hub username and password to Jenkins.


<br>

<br>

### Instructions

**9.1** From Dashboard, click "Manage Jenkins".


**9.2** Click "Credentials".


**9.3** Click "(global)" under "Stores scoped to Jenkins".


**9.4** Click "Add Credentials" (left sidebar).


**9.5** Fill in the form:

```
Kind: Username with password
Scope: Global
Username: <your Docker Hub username>
Password: <your Docker Hub password>
ID: docker-cred
Description: Docker Hub Credentials
```


**IMPORTANT:** The ID must be exactly `docker-cred` (our Jenkinsfile uses this).


**9.6** Click "Create".


<br>

<br>

### Verification

**You should see:** "docker-cred" in the credentials list with description "Docker Hub Credentials".


---

<br>



## Task 11: Add GitHub Credentials

<br>

<br>

Add GitHub personal access token for repository access.


<br>

<br>

### Instructions

**10.1** From credentials page, click "Add Credentials" again.


**10.2** Fill in the form:

```
Kind: Username with password
Scope: Global
Username: <your GitHub username>
Password: <your GitHub personal access token>
ID: git-cred
Description: GitHub Credentials
```


**If you don't have a GitHub token:**

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Give it a name like "Jenkins"
4. Select scope: `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy the token immediately (you won't see it again)
7. Use this as the password in Jenkins


**10.3** Click "Create".


<br>

<br>

### Verification

**You should see:** Both "docker-cred" and "git-cred" in the credentials list.


---

<br>



## Task 12: Configure Kubernetes Credentials

<br>

<br>

Add Kubernetes config file so Jenkins can deploy to the cluster.


<br>

<br>

### Instructions

**11.1** First, get the Kubernetes config file from the master node:


**In your terminal (SSH to Jenkins master if not already connected):**

```bash
cat ~/.kube/config
```


**11.2** Copy the ENTIRE output (from `apiVersion` to the end).


**11.3** Back in Jenkins browser, click "Add Credentials".


**11.4** Fill in the form:

```
Kind: Secret file
Scope: Global
File: <click Choose File, then create a file with the config content>
ID: k8-cred
Description: Kubernetes Config
```


**Alternative method (easier):**

```
Kind: Secret text
Scope: Global
Secret: <paste the entire kubectl config content here>
ID: k8-cred
Description: Kubernetes Config
```


**11.5** Click "Create".


<br>

<br>

### Verification

**You should see:** "k8-cred" in the credentials list.


---

<br>



## Task 13: Get SonarQube Token

<br>

<br>

Generate authentication token from SonarQube.


<br>

<br>

### Instructions

**12.1** Open SonarQube in a new browser tab:

```
http://<SONARQUBE_IP>:9000
```


**12.2** Log in with default credentials:

```
Username: admin
Password: admin
```


**12.3** SonarQube will prompt you to change the password.

**Set new password:** (write it down!)


**12.4** After login, click on "A" icon (top right) → "My Account".


**12.5** Click "Security" tab.


**12.6** In "Generate Tokens" section:

```
Name: jenkins-token
Type: Global Analysis Token
Expires in: No expiration
```


**12.7** Click "Generate".


**12.8** Copy the token immediately.

**It looks like:** `squ_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0`


**You cannot see this token again after closing this page!**


<br>

<br>

### Verification

**You should have:** A SonarQube token copied and saved in your notes.


---

<br>



## Task 14: Add SonarQube Token to Jenkins

<br>

<br>

Store the SonarQube token in Jenkins.


<br>

<br>

### Instructions

**13.1** Back in Jenkins, go to "Manage Jenkins" → "Credentials".


**13.2** Click "Add Credentials".


**13.3** Fill in the form:

```
Kind: Secret text
Scope: Global
Secret: <paste your SonarQube token>
ID: sonar-token
Description: SonarQube Authentication Token
```


**13.4** Click "Create".


<br>

<br>

### Verification

**You should now have 4 credentials:**
* docker-cred
* git-cred
* k8-cred
* sonar-token


---

<br>



## Task 15: Configure SonarQube Server in Jenkins

<br>

<br>

Connect Jenkins to SonarQube server.


<br>

<br>

### Instructions

**14.1** Click "Manage Jenkins" → "System" (under "System Configuration").


**14.2** Scroll down to "SonarQube servers" section.


**14.3** Check "Enable injection of SonarQube server configuration" checkbox.


**14.4** Click "Add SonarQube" button.


**14.5** Fill in the form:

```
Name: sonar
Server URL: http://nexus-sonarqube.musicvibe-services.local:9000
Server authentication token: <select "sonar-token" from dropdown>
```


**Note:** We use the service discovery DNS name instead of IP address.


**14.6** Click "Save" (at bottom of page).


<br>

<br>

### Verification

**You should see:** Dashboard again. SonarQube is now connected.


---

<br>



## Task 16: Configure Maven Settings for Nexus

<br>

<br>

Create Maven settings file for artifact deployment.


<br>

<br>

### Instructions

**15.1** Click "Manage Jenkins" → "Managed files" (under "System Configuration").


**If you don't see "Managed files":**
* The Config File Provider plugin might need activation
* Go to "Manage Jenkins" → "Configure System" and look for "Managed files" section


**15.2** Click "Add a new Config" button.


**15.3** Select "Global Maven settings.xml".


**15.4** Click "Next" or "Submit".


**15.5** Fill in the form:

```
ID: global-settings
Name: Global Maven Settings
Comment: Maven settings for Nexus deployment
```


**15.6** In the "Content" section, replace everything with:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                              http://maven.apache.org/xsd/settings-1.0.0.xsd">
  
  <servers>
    <server>
      <id>maven-releases</id>
      <username>admin</username>
      <password>admin123</password>
    </server>
    <server>
      <id>maven-snapshots</id>
      <username>admin</username>
      <password>admin123</password>
    </server>
  </servers>

</settings>
```


**Note:** We'll set up Nexus password in Step 8. The default admin password will be changed to "admin123".


**15.7** Click "Save" or "Submit".


<br>

<br>

### Verification

**You should see:** "global-settings" in the list of managed files.


---

<br>



## Checklist: Jenkins Configuration Complete

<br>

<br>

Verify all configurations before proceeding:

```
[ ] Jenkins accessible at http://<IP>:8080
[ ] Admin user created and password saved
[ ] All 8 required plugins installed
[ ] JDK 17 configured (name: jdk17)
[ ] Maven configured (name: maven3.6)
[ ] Docker configured (name: docker)
[ ] SonarQube Scanner configured (name: sonar-scanner)
[ ] Docker Hub credentials added (ID: docker-cred)
[ ] GitHub credentials added (ID: git-cred)
[ ] Kubernetes credentials added (ID: k8-cred)
[ ] SonarQube token added (ID: sonar-token)
[ ] SonarQube server configured (name: sonar)
[ ] Maven global settings file created (ID: global-settings)
```


---

<br>



## Important Information to Record

<br>

<br>

**Add to your notes:**

```
=== Jenkins Access ===
URL: http://<IP>:8080
Username: admin
Password: <your password>

=== Tool Names (used in Jenkinsfile) ===
JDK: jdk17
Maven: maven3.6
Docker: docker
SonarQube Scanner: sonar-scanner

=== Credential IDs (used in Jenkinsfile) ===
Docker Hub: docker-cred
GitHub: git-cred
Kubernetes: k8-cred
SonarQube: sonar-token

=== SonarQube Server ===
Name in Jenkins: sonar
URL: http://nexus-sonarqube.musicvibe-services.local:9000
Token: <saved in sonar-token credential>

=== Maven Settings ===
Config ID: global-settings
```


---

<br>



## Troubleshooting

<br>

<br>

**Problem:** Cannot access Jenkins at port 8080

**Solution:**
1. Check security group allows port 8080 from your IP
2. Verify Jenkins is running: `sudo systemctl status jenkins`
3. Check Jenkins logs: `sudo journalctl -u jenkins -n 50`


**Problem:** Initial admin password file not found

**Solution:**
```bash
# Jenkins might still be starting
sudo systemctl status jenkins

# Wait 2-3 minutes, then try again
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```


**Problem:** Plugin installation fails

**Solution:**
1. Check internet connectivity from Jenkins server
2. Try installing plugins one at a time
3. Restart Jenkins: "Manage Jenkins" → "Reload Configuration from Disk"


**Problem:** Tool configuration not saved

**Solution:**
* Make sure to click "Save" button at bottom of page
* Don't navigate away before saving


**Problem:** Credentials not appearing in dropdown

**Solution:**
* Ensure credential ID matches exactly what Jenkinsfile expects
* Check credential scope is "Global"
* Try refreshing the Jenkins page


**Problem:** Cannot connect to SonarQube

**Solution:**
```bash
# Verify SonarQube is running
ssh ubuntu@<SONARQUBE_IP>
docker ps | grep sonar

# Check you can access from Jenkins server using service discovery
curl http://nexus-sonarqube.musicvibe-services.local:9000
```


---

<br>



## Next Steps

<br>

<br>

Proceed to **Step 7: SonarQube Configuration** (`07-sonarqube-setup.md`)

You will complete SonarQube setup and configure quality gates.


---

<br>



**Completion Time:** If all configurations are correct, you spent 30-40 minutes.


**Jenkins is now fully configured for CI/CD pipelines!**


This was the most complex step. The remaining steps are much shorter.
