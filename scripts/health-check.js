#!/usr/bin/env node

/**
 * MusicVibe Health Check Script
 * 
 * This script verifies that the MusicVibe application is running and healthy
 * after deployment to Kubernetes or local Docker container.
 * 
 * Usage:
 *   node scripts/health-check.js [url]
 * 
 * Examples:
 *   node scripts/health-check.js
 *   node scripts/health-check.js http://localhost:4000
 *   node scripts/health-check.js http://192.168.1.100:30080
 */

const http = require('http');
const https = require('https');

// Configuration
const DEFAULT_URL = process.env.MUSICVIBE_URL || 'http://localhost:4000';
const TARGET_URL = process.argv[2] || DEFAULT_URL;
const TIMEOUT = 5000; // 5 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Parse URL
let parsedUrl;
try {
  parsedUrl = new URL(TARGET_URL);
} catch (error) {
  console.error(`ERROR: Invalid URL: ${TARGET_URL}`);
  process.exit(1);
}

// Color output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url, retryCount = 0) {
  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: '/health',
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'MusicVibe-HealthCheck/1.0'
      }
    };

    log(`\n[${new Date().toISOString()}] Checking health endpoint...`, colors.cyan);
    log(`URL: ${url.protocol}//${url.hostname}:${options.port}/health`, colors.blue);
    log(`Attempt: ${retryCount + 1}/${MAX_RETRIES}`, colors.blue);

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: { raw: data } });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${TIMEOUT}ms`));
    });

    req.end();
  });
}

async function retryableHealthCheck() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const result = await makeRequest(parsedUrl, i);
      
      if (result.statusCode === 200) {
        log('\n✓ SUCCESS: Application is healthy!', colors.green);
        log('\nHealth Check Response:', colors.cyan);
        console.log(JSON.stringify(result.data, null, 2));
        
        if (result.data.status === 'ok') {
          log('\nService Status: OK', colors.green);
          log(`Service Name: ${result.data.service || 'Unknown'}`, colors.green);
        }
        
        log('\n=== Recommended Next Steps ===', colors.yellow);
        log('1. Access the application:', colors.yellow);
        log(`   ${parsedUrl.protocol}//${parsedUrl.hostname}:${parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80)}`, colors.cyan);
        log('2. Test API endpoints:', colors.yellow);
        log(`   curl ${parsedUrl.protocol}//${parsedUrl.hostname}:${parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80)}/api/v1/songs`, colors.cyan);
        log('3. Check Kubernetes pods:', colors.yellow);
        log('   kubectl get pods -n musicvibe', colors.cyan);
        log('4. View logs:', colors.yellow);
        log('   kubectl logs -f <pod-name> -n musicvibe\n', colors.cyan);
        
        return 0;
      } else {
        log(`\n✗ WARNING: Health check returned status ${result.statusCode}`, colors.yellow);
        console.log('Response:', result.data);
      }
    } catch (error) {
      log(`\n✗ ERROR: ${error.message}`, colors.red);
      
      if (i < MAX_RETRIES - 1) {
        log(`Retrying in ${RETRY_DELAY / 1000} seconds...`, colors.yellow);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  log('\n✗ FAILED: Application health check failed after all retries', colors.red);
  log('\n=== Troubleshooting Steps ===', colors.yellow);
  log('1. Check if the application is running:', colors.yellow);
  log('   docker ps | grep musicvibe', colors.cyan);
  log('   kubectl get pods -n musicvibe', colors.cyan);
  log('\n2. Check application logs:', colors.yellow);
  log('   docker logs musicvibe', colors.cyan);
  log('   kubectl logs <pod-name> -n musicvibe', colors.cyan);
  log('\n3. Verify the port is accessible:', colors.yellow);
  log('   netstat -tlnp | grep 4000', colors.cyan);
  log('   kubectl get svc -n musicvibe', colors.cyan);
  log('\n4. Check security group/firewall rules', colors.yellow);
  log('\n5. Verify Docker container is healthy:', colors.yellow);
  log('   docker exec musicvibe curl -s http://localhost:4000/health\n', colors.cyan);
  
  return 1;
}

// Main execution
log('========================================', colors.blue);
log('   MusicVibe Health Check', colors.blue);
log('========================================', colors.blue);

retryableHealthCheck()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    log(`\nUnexpected error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
