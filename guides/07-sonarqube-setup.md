# Step 7: SonarQube Configuration

<br>

**Duration:** 10-15 minutes

**Goal:** Complete SonarQube setup and verify integration with Jenkins

<br>

**Note:** SonarQube was automatically installed by Terraform as a Docker container on the Nexus/SonarQube instance.

<br>

---

<br>

## What You Will Do

<br>

<br>

* Log in to SonarQube
* Change default password
* Verify token created in previous step
* Configure quality gates (optional)
* Test connection from Jenkins


---

<br>



## Task 1: Access SonarQube

<br>

<br>

Log in to SonarQube for the first time.


<br>

<br>

### Instructions

**1.1** Open SonarQube in your browser:

```
http://<NEXUS_SONARQUBE_PUBLIC_IP>:9000
```


**1.2** You should see the SonarQube login page.


**1.3** Log in with default credentials:

```
Username: admin
Password: admin
```


**1.4** SonarQube will immediately ask you to change the password.


**1.5** Set a new password:

```
Old password: admin
New password: <choose a strong password>
Confirm password: <same password>
```


**Write down your new password!**


**1.6** Click "Update".


<br>

<br>

### Verification

**You should see:** SonarQube dashboard with "Welcome" message.


---

<br>



## Task 2: Generate Authentication Token for Jenkins

<br>

<br>

Create a token that Jenkins will use to communicate with SonarQube.


<br>

<br>

### Instructions

**2.1** In SonarQube web interface, click on the **A** icon (your admin avatar) in the **top-right corner**.


**2.2** From the dropdown menu, select **My Account**.


**2.3** Click the **Security** tab.


**2.4** Scroll down to the **Generate Tokens** section.


**2.5** Fill in the token details:

```
Name: jenkins-token
Type: Global Analysis Token
Expires in: No expiration
```


**2.6** Click the **Generate** button.


**2.7** **IMPORTANT:** The token will appear only once. It looks like:

```
squ_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```


**2.8** **Copy this entire token immediately.**


**Where to save it:**

* Copy to a secure note
* You will add this to Jenkins in the next sub-task


**2.9** After copying, click **Done**.


<br>

<br>

### Verification

**You should see:** In the **Tokens** section, a new token listed:

```
Name: jenkins-token
Type: Global Analysis Token  
Created: <today's date>
Last Use: Never
```


---

<br>



## Task 3: Add SonarQube Token to Jenkins

<br>

<br>

Now add the token you just created to Jenkins credentials.


<br>

<br>

### Instructions

**3.1** Open Jenkins in another browser tab (or switch to existing Jenkins tab):

```
http://<JENKINS_MASTER_PUBLIC_IP>:8080
```


**3.2** Click **Manage Jenkins** (left sidebar).


**3.3** Click **Credentials** (under Security section).


**3.4** Click on **(global)** domain.


**3.5** Click **Add Credentials** (left sidebar).


**3.6** Fill in the credential form:

```
Kind: Secret text

Scope: Global (Jenkins, nodes, items, all child items, etc)

Secret: <paste the SonarQube token you copied>

ID: sonar-token

Description: SonarQube authentication token
```


**3.7** Click **Create**.


<br>

<br>

### Verification

**You should see:** "sonar-token" credential listed in the global credentials list.


---

<br>



## Task 4: Test SonarQube Connection from Jenkins

<br>

<br>

Verify Jenkins can communicate with SonarQube.


<br>

<br>

### Instructions

**3.1** Open Jenkins in another browser tab:

```
http://<JENKINS_MASTER_PUBLIC_IP>:8080
```


**3.2** Log in with your Jenkins admin credentials.


**3.3** Click "Manage Jenkins" → "System".


**3.4** Scroll to "SonarQube servers" section.


**3.5** You should see:

```
Name: sonar
Server URL: http://nexus-sonarqube.musicvibe-services.local:9000
Server authentication token: sonar-token
```


**3.6** Click "Test Connection" button (if available).


**Expected result:** "Connection successful" or similar message.


**If there's no test button:**

Don't worry, we'll verify the connection when we run the pipeline in Step 9.


<br>

<br>

### Verification

**SonarQube server is configured in Jenkins** and ready to analyze code.


---

<br>



## Task 5: Review Default Quality Gate (Optional)

<br>

<br>

Understand SonarQube quality standards.


<br>

<br>

### Instructions

**4.1** In SonarQube, click "Quality Gates" (top menu).


**4.2** You should see "Sonar way" quality gate (the default).


**4.3** Click on "Sonar way" to view its conditions:

```
Conditions checked:
- Coverage on New Code < 80%
- Duplicated Lines on New Code > 3%
- Maintainability Rating on New Code worse than A
- Reliability Rating on New Code worse than A
- Security Hotspots Reviewed on New Code < 100%
- Security Rating on New Code worse than A
```


**What this means:**

Your code will be analyzed against these standards. If any condition fails, the quality gate fails, and the Jenkins pipeline will stop.


**For learning purposes, you can make the quality gate less strict:**

**4.4** Click "Copy" to create a custom quality gate.


**4.5** Name it: `relaxed-gate`


**4.6** Remove or adjust conditions to be less strict (for example, set coverage to 50% instead of 80%).


**4.7** Click "Set as Default" to use this quality gate for all projects.


**Note:** This step is optional. The default "Sonar way" quality gate is fine for learning.


<br>

<br>

### Verification

**You understand:** SonarQube will analyze your code and enforce quality standards.


---

<br>



## Task 6: Verify Service Discovery DNS (Advanced)

<br>

<br>

Confirm SonarQube is accessible via service discovery name.


<br>

<br>

### Instructions

**5.1** SSH to Jenkins master:

```bash
ssh -i k8s-pipeline-key.pem ubuntu@<JENKINS_MASTER_PUBLIC_IP>
```


**5.2** Test DNS resolution:

```bash
ping -c 3 nexus-sonarqube.musicvibe-services.local
```


**Expected output:**

```
PING nexus-sonarqube.musicvibe-services.local (10.x.x.x) 56(84) bytes of data.
64 bytes from ip-10-x-x-x: icmp_seq=1 ttl=64 time=0.5 ms
64 bytes from ip-10-x-x-x: icmp_seq=2 ttl=64 time=0.4 ms
64 bytes from ip-10-x-x-x: icmp_seq=3 ttl=64 time=0.3 ms
```


**5.3** Test HTTP connection:

```bash
curl -I http://nexus-sonarqube.musicvibe-services.local:9000
```


**Expected output:**

```
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html
...
```


**5.4** Exit SSH session:

```bash
exit
```


<br>

<br>

### Verification

**Service discovery DNS is working** and Jenkins can reach SonarQube using the internal DNS name.


---

<br>



## Checklist: SonarQube Setup Complete

<br>

<br>

Verify all tasks before proceeding:

```
[ ] SonarQube accessible at http://<IP>:9000
[ ] Default admin password changed
[ ] New SonarQube password saved in your notes
[ ] Authentication token exists (jenkins-token)
[ ] Token saved in Jenkins as "sonar-token" credential
[ ] SonarQube server configured in Jenkins (name: sonar)
[ ] Service discovery DNS working (optional verification)
[ ] Quality gate reviewed (optional configuration)
```


---

<br>



## Important Information to Record

<br>

<br>

**Add to your notes:**

```
=== SonarQube Access ===
URL: http://<IP>:9000
Username: admin
Password: <your new password>

=== Integration with Jenkins ===
Token Name: jenkins-token
Token ID in Jenkins: sonar-token
Server Name in Jenkins: sonar
Server URL: http://nexus-sonarqube.musicvibe-services.local:9000

=== Quality Gate ===
Default: Sonar way
Custom: <if you created one>
```


---

<br>



## Troubleshooting

<br>

<br>

**Problem:** Cannot access SonarQube at port 9000

**Solution:**
```bash
# SSH to Nexus/SonarQube server
ssh ubuntu@<SONARQUBE_IP>

# Check if SonarQube container is running
docker ps | grep sonar

# If not running, check logs
docker logs sonarqube

# Restart if needed
docker restart sonarqube
```


**Problem:** "Unauthorized" error when testing connection from Jenkins

**Solution:**
1. Verify the token is correct in Jenkins credentials
2. Generate a new token in SonarQube
3. Update the "sonar-token" credential in Jenkins with new token


**Problem:** Service discovery DNS not resolving

**Solution:**
```bash
# Check Cloud Map service
aws servicediscovery list-services --region us-east-1

# Verify the instance is registered
aws servicediscovery list-instances \
  --service-id <service-id> \
  --region us-east-1

# DNS may take 30-60 seconds to propagate after instance starts
```


**Problem:** Quality gate too strict, builds failing

**Solution:**
1. Create a custom quality gate with relaxed conditions
2. Set it as default
3. Or disable quality gate check temporarily in Jenkinsfile


---

<br>



## Next Steps

<br>

<br>

Proceed to **Step 8: Nexus Configuration** (`08-nexus-setup.md`)

You will set up Nexus repository for Maven artifacts.


---

<br>



**Completion Time:** You should have spent 10-15 minutes on SonarQube setup.


**SonarQube is ready to analyze your code quality!**
