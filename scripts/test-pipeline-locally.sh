#!/bin/bash
set -e

# ============================================================================
# MusicVibe Pipeline Local Testing Script
# ============================================================================
# This script simulates the GitHub Actions workflow locally
# Run each step to catch failures before pushing to GitHub
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track test results
PASSED=0
FAILED=0
SKIPPED=0

print_header() {
    echo ""
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
}

print_success() {
    echo -e "${GREEN} PASSED: $1${NC}"
    ((PASSED++))
}

print_failure() {
    echo -e "${RED} FAILED: $1${NC}"
    echo -e "${RED}   Error: $2${NC}"
    ((FAILED++))
}

print_skip() {
    echo -e "${YELLOW}⏭  SKIPPED: $1${NC}"
    ((SKIPPED++))
}

print_info() {
    echo -e "${YELLOW}ℹ  $1${NC}"
}

# ============================================================================
# TEST 1: Lint & Type Check
# ============================================================================
test_lint() {
    print_header "TEST 1: Lint & Type Check"
    
    print_info "Installing dependencies..."
    if npm ci &>/dev/null; then
        print_success "Root dependencies installed"
    else
        print_failure "Root dependency installation" "npm ci failed"
        return 1
    fi
    
    if npm ci --workspace=apps/api &>/dev/null; then
        print_success "API dependencies installed"
    else
        print_failure "API dependency installation" "npm ci failed"
        return 1
    fi
    
    if npm ci --workspace=apps/frontend &>/dev/null; then
        print_success "Frontend dependencies installed"
    else
        print_failure "Frontend dependency installation" "npm ci failed"
        return 1
    fi
    
    print_info "Running TypeScript type check for API..."
    if npx tsc --noEmit --project apps/api/tsconfig.json 2>&1 | tee /tmp/api-typecheck.log; then
        print_success "API type check passed"
    else
        print_failure "API type check" "See /tmp/api-typecheck.log for details"
        echo ""
        echo "Common fixes:"
        echo "  - Add missing type definitions"
        echo "  - Fix type mismatches"
        echo "  - Import missing dependencies"
        return 1
    fi
    
    print_info "Running TypeScript type check for Frontend..."
    if npx tsc --noEmit --project apps/frontend/tsconfig.json 2>&1 | tee /tmp/frontend-typecheck.log; then
        print_success "Frontend type check passed"
    else
        print_failure "Frontend type check" "See /tmp/frontend-typecheck.log for details"
        return 1
    fi
}

# ============================================================================
# TEST 2: Security Scan (Filesystem) - NON-BLOCKING
# ============================================================================
test_security_scan() {
    print_header "TEST 2: Security Scan (Filesystem) - NON-BLOCKING"
    
    if ! command -v trivy &> /dev/null; then
        print_skip "Trivy not installed. Install: brew install aquasecurity/trivy/trivy"
        return 0
    fi
    
    print_info "Scanning filesystem for vulnerabilities (informational only)..."
    if trivy fs --severity CRITICAL,HIGH --format table . 2>&1 | tee /tmp/trivy-fs.log; then
        print_success "No critical/high vulnerabilities found"
    else
        print_info "  Security vulnerabilities detected (non-blocking)"
        echo ""
        echo "Review /tmp/trivy-fs.log for details"
        echo "Fix when convenient:"
        echo "  - Update vulnerable packages: npm update"
        echo "  - Check npm audit: npm audit fix"
        # Don't return error - just warn
    fi
}

# ============================================================================
# TEST 3: Build Application
# ============================================================================
test_build() {
    print_header "TEST 3: Build Application"
    
    print_info "Building Frontend..."
    if npm run build --workspace=apps/frontend 2>&1 | tee /tmp/frontend-build.log; then
        print_success "Frontend build completed"
        if [ -d "apps/frontend/dist" ]; then
            print_success "Frontend dist/ directory created"
        else
            print_failure "Frontend build" "dist/ directory not found"
            return 1
        fi
    else
        print_failure "Frontend build" "See /tmp/frontend-build.log for details"
        echo ""
        echo "Common fixes:"
        echo "  - Check for compilation errors in React components"
        echo "  - Verify environment variables in .env files"
        echo "  - Check vite.config.ts configuration"
        return 1
    fi
    
    print_info "Building API..."
    if npm run build --workspace=apps/api 2>&1 | tee /tmp/api-build.log; then
        print_success "API build completed"
        if [ -d "apps/api/dist" ]; then
            print_success "API dist/ directory created"
        else
            print_failure "API build" "dist/ directory not found"
            return 1
        fi
    else
        print_failure "API build" "See /tmp/api-build.log for details"
        echo ""
        echo "Common fixes:"
        echo "  - Check for TypeScript compilation errors"
        echo "  - Verify tsconfig.json configuration"
        echo "  - Check for missing type definitions"
        return 1
    fi
}

# ============================================================================
# TEST 4: Docker Build
# ============================================================================
test_docker_build() {
    print_header "TEST 4: Docker Build"
    
    if ! command -v docker &> /dev/null; then
        print_skip "Docker not installed"
        return 0
    fi
    
    print_info "Building Docker image..."
    if docker build -t musicvibe-test:local . 2>&1 | tee /tmp/docker-build.log; then
        print_success "Docker image built successfully"
    else
        print_failure "Docker build" "See /tmp/docker-build.log for details"
        echo ""
        echo "Common fixes:"
        echo "  - Check Dockerfile syntax"
        echo "  - Verify all COPY paths exist"
        echo "  - Check base image availability"
        echo "  - Ensure build artifacts exist (run build test first)"
        return 1
    fi
    
    print_info "Verifying Docker image..."
    if docker images | grep "musicvibe-test" | grep "local" &>/dev/null; then
        print_success "Docker image exists in local registry"
    else
        print_failure "Docker image verification" "Image not found in docker images"
        return 1
    fi
}

# ============================================================================
# TEST 5: Docker Image Security Scan - NON-BLOCKING
# ============================================================================
test_docker_scan() {
    print_header "TEST 5: Docker Image Security Scan - NON-BLOCKING"
    
    if ! command -v trivy &> /dev/null; then
        print_skip "Trivy not installed"
        return 0
    fi
    
    if ! docker images | grep "musicvibe-test" | grep "local" &>/dev/null; then
        print_skip "Docker image not built (run test 4 first)"
        return 0
    fi
    
    print_info "Scanning Docker image for vulnerabilities (informational only)..."
    if trivy image --severity CRITICAL,HIGH --format table musicvibe-test:local 2>&1 | tee /tmp/trivy-image.log; then
        print_success "No critical/high vulnerabilities in Docker image"
    else
        print_info "  Docker image vulnerabilities detected (non-blocking)"
        echo ""
        echo "Review /tmp/trivy-image.log for details"
        echo "Fix when convenient:"
        echo "  - Update base image (FROM node:20-alpine)"
        echo "  - Update system packages in Dockerfile"
        echo "  - Review and update npm dependencies"
        # Don't return error - just warn
    fi
}

# ============================================================================
# TEST 6: Docker Container Runtime Test
# ============================================================================
test_docker_run() {
    print_header "TEST 6: Docker Container Runtime Test"
    
    if ! command -v docker &> /dev/null; then
        print_skip "Docker not installed"
        return 0
    fi
    
    if ! docker images | grep "musicvibe-test" | grep "local" &>/dev/null; then
        print_skip "Docker image not built (run test 4 first)"
        return 0
    fi
    
    print_info "Starting container..."
    CONTAINER_ID=$(docker run -d -p 4000:4000 musicvibe-test:local)
    
    if [ -z "$CONTAINER_ID" ]; then
        print_failure "Container start" "Failed to start container"
        return 1
    fi
    
    print_success "Container started: $CONTAINER_ID"
    
    print_info "Waiting for application to start (5 seconds)..."
    sleep 5
    
    print_info "Checking container status..."
    if docker inspect -f '{{.State.Running}}' "$CONTAINER_ID" 2>/dev/null | grep -q "true"; then
        print_success "Container is running"
    else
        print_failure "Container status" "Container not running"
        echo ""
        echo "Container logs:"
        docker logs "$CONTAINER_ID"
        docker rm -f "$CONTAINER_ID" &>/dev/null
        return 1
    fi
    
    print_info "Testing health endpoint..."
    if curl -f http://localhost:4000/health &>/dev/null; then
        print_success "Health endpoint responding"
    else
        print_failure "Health endpoint" "Application not responding"
        echo ""
        echo "Container logs:"
        docker logs "$CONTAINER_ID"
        docker rm -f "$CONTAINER_ID" &>/dev/null
        echo ""
        echo "Common fixes:"
        echo "  - Check PORT environment variable"
        echo "  - Verify server.ts starts correctly"
        echo "  - Check for runtime errors in logs"
        return 1
    fi
    
    print_info "Testing main endpoint..."
    if curl -f http://localhost:4000/ &>/dev/null; then
        print_success "Main endpoint responding"
    else
        print_failure "Main endpoint" "Root path not responding"
        docker rm -f "$CONTAINER_ID" &>/dev/null
        return 1
    fi
    
    print_info "Stopping container..."
    docker rm -f "$CONTAINER_ID" &>/dev/null
    print_success "Container stopped and removed"
}

# ============================================================================
# TEST 7: Kubernetes Manifest Validation
# ============================================================================
test_k8s_manifests() {
    print_header "TEST 7: Kubernetes Manifest Validation"
    
    if ! command -v kubectl &> /dev/null; then
        print_skip "kubectl not installed"
        return 0
    fi
    
    # Check if kubectl can connect to a cluster
    if ! kubectl cluster-info &>/dev/null; then
        print_skip "No Kubernetes cluster available - start cluster and rerun test"
        return 0
    fi
    
    print_info "Validating Kubernetes manifests against cluster..."
    for manifest in kubernetes/*.yaml; do
        if [ -f "$manifest" ]; then
            print_info "Checking $manifest..."
            if kubectl apply --dry-run=client -f "$manifest" &>/dev/null; then
                print_success "$(basename $manifest) is valid"
            else
                print_failure "Kubernetes manifest validation" "$manifest is invalid"
                kubectl apply --dry-run=client -f "$manifest"
                echo ""
                echo "Common fixes:"
                echo "  - Check YAML indentation"
                echo "  - Verify resource names and labels"
                echo "  - Check image references"
                return 1
            fi
        fi
    done
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================
main() {
    echo ""
    echo -e "${GREEN}${NC}"
    echo -e "${GREEN}       MusicVibe Pipeline Local Test Runner                    ${NC}"
    echo -e "${GREEN}       Test each workflow step before pushing to GitHub        ${NC}"
    echo -e "${GREEN}${NC}"
    echo ""
    
    # Change to repository root
    cd "$(dirname "$0")/.."
    
    # Run all tests
    test_lint || true
    test_security_scan || true
    test_build || true
    test_docker_build || true
    test_docker_scan || true
    test_docker_run || true
    test_k8s_manifests || true
    
    # Summary
    print_header "TEST SUMMARY"
    echo -e "${GREEN} Passed:  $PASSED${NC}"
    echo -e "${RED} Failed:  $FAILED${NC}"
    echo -e "${YELLOW}⏭  Skipped: $SKIPPED${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}${NC}"
        echo -e "${GREEN}   ALL TESTS PASSED! Ready to push to GitHub                 ${NC}"
        echo -e "${GREEN}${NC}"
        exit 0
    else
        echo -e "${RED}${NC}"
        echo -e "${RED}   TESTS FAILED! Fix errors before pushing                    ${NC}"
        echo -e "${RED}${NC}"
        echo ""
        echo "Logs saved to /tmp/:"
        ls -lh /tmp/*-*.log 2>/dev/null || echo "No logs generated"
        exit 1
    fi
}

# Parse command line arguments
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Usage: $0 [test_name]"
    echo ""
    echo "Run all tests:"
    echo "  $0"
    echo ""
    echo "Run specific test:"
    echo "  $0 lint          # Test 1: Lint & Type Check"
    echo "  $0 security      # Test 2: Security Scan"
    echo "  $0 build         # Test 3: Build Application"
    echo "  $0 docker-build  # Test 4: Docker Build"
    echo "  $0 docker-scan   # Test 5: Docker Image Scan"
    echo "  $0 docker-run    # Test 6: Container Runtime"
    echo "  $0 k8s           # Test 7: Kubernetes Manifests"
    exit 0
fi

# Run specific test if argument provided
case "$1" in
    lint)
        test_lint
        ;;
    security)
        test_security_scan
        ;;
    build)
        test_build
        ;;
    docker-build)
        test_docker_build
        ;;
    docker-scan)
        test_docker_scan
        ;;
    docker-run)
        test_docker_run
        ;;
    k8s)
        test_k8s_manifests
        ;;
    *)
        main
        ;;
esac
