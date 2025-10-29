#!/bin/bash

# MusicVibe Health Check Script
# This script verifies the application is running correctly after deployment

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="${NAMESPACE:-musicvibe}"
SERVICE_NAME="${SERVICE_NAME:-musicvibe-service}"
DEPLOYMENT_NAME="${DEPLOYMENT_NAME:-musicvibe}"
HEALTH_ENDPOINT="/health"
MAX_RETRIES=30
RETRY_INTERVAL=10

echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}  MusicVibe Deployment Health Check${NC}"
echo -e "${YELLOW}================================================${NC}"
echo ""

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" == "success" ]; then
        echo -e "${GREEN}✓${NC} $message"
    elif [ "$status" == "error" ]; then
        echo -e "${RED}✗${NC} $message"
    else
        echo -e "${YELLOW}•${NC} $message"
    fi
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_status "error" "kubectl not found. Please install kubectl."
    exit 1
fi

print_status "success" "kubectl found"

# Check namespace exists
echo ""
echo "Checking namespace..."
if kubectl get namespace "$NAMESPACE" &> /dev/null; then
    print_status "success" "Namespace '$NAMESPACE' exists"
else
    print_status "error" "Namespace '$NAMESPACE' not found"
    exit 1
fi

# Check deployment status
echo ""
echo "Checking deployment..."
DEPLOYMENT_STATUS=$(kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o jsonpath='{.status.conditions[?(@.type=="Available")].status}' 2>/dev/null || echo "NotFound")

if [ "$DEPLOYMENT_STATUS" == "True" ]; then
    print_status "success" "Deployment '$DEPLOYMENT_NAME' is available"
    
    # Get replica information
    DESIRED=$(kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
    READY=$(kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
    print_status "info" "Replicas: $READY/$DESIRED ready"
else
    print_status "error" "Deployment '$DEPLOYMENT_NAME' is not available"
    kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE"
    exit 1
fi

# Check pods
echo ""
echo "Checking pods..."
PODS=$(kubectl get pods -n "$NAMESPACE" -l app=musicvibe -o jsonpath='{.items[*].metadata.name}')

if [ -z "$PODS" ]; then
    print_status "error" "No pods found for app=musicvibe"
    exit 1
fi

for POD in $PODS; do
    POD_STATUS=$(kubectl get pod "$POD" -n "$NAMESPACE" -o jsonpath='{.status.phase}')
    if [ "$POD_STATUS" == "Running" ]; then
        print_status "success" "Pod '$POD' is running"
    else
        print_status "error" "Pod '$POD' status: $POD_STATUS"
    fi
done

# Check service
echo ""
echo "Checking service..."
if kubectl get service "$SERVICE_NAME" -n "$NAMESPACE" &> /dev/null; then
    print_status "success" "Service '$SERVICE_NAME' exists"
    
    SERVICE_TYPE=$(kubectl get service "$SERVICE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.type}')
    SERVICE_PORT=$(kubectl get service "$SERVICE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.ports[0].port}')
    NODE_PORT=$(kubectl get service "$SERVICE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.ports[0].nodePort}')
    
    print_status "info" "Service type: $SERVICE_TYPE"
    print_status "info" "Service port: $SERVICE_PORT"
    if [ ! -z "$NODE_PORT" ]; then
        print_status "info" "NodePort: $NODE_PORT"
    fi
else
    print_status "error" "Service '$SERVICE_NAME' not found"
    exit 1
fi

# Health endpoint check
echo ""
echo "Checking health endpoint..."
RETRIES=0

while [ $RETRIES -lt $MAX_RETRIES ]; do
    # Get first running pod
    POD_NAME=$(kubectl get pods -n "$NAMESPACE" -l app=musicvibe -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ ! -z "$POD_NAME" ]; then
        # Try health check inside the pod
        HEALTH_RESPONSE=$(kubectl exec -n "$NAMESPACE" "$POD_NAME" -- curl -s http://localhost:4000"$HEALTH_ENDPOINT" 2>/dev/null || echo "")
        
        if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
            print_status "success" "Health endpoint responded successfully"
            echo ""
            echo "Response: $HEALTH_RESPONSE"
            break
        fi
    fi
    
    RETRIES=$((RETRIES + 1))
    if [ $RETRIES -lt $MAX_RETRIES ]; then
        print_status "info" "Attempt $RETRIES/$MAX_RETRIES - Waiting for health endpoint..."
        sleep $RETRY_INTERVAL
    fi
done

if [ $RETRIES -eq $MAX_RETRIES ]; then
    print_status "error" "Health endpoint check failed after $MAX_RETRIES attempts"
    echo ""
    echo "Pod logs:"
    kubectl logs -n "$NAMESPACE" "$POD_NAME" --tail=50
    exit 1
fi

# Final summary
echo ""
echo -e "${YELLOW}================================================${NC}"
echo -e "${GREEN}  Health Check Completed Successfully!${NC}"
echo -e "${YELLOW}================================================${NC}"
echo ""
echo "Deployment Summary:"
echo "  - Namespace: $NAMESPACE"
echo "  - Deployment: $DEPLOYMENT_NAME"
echo "  - Service: $SERVICE_NAME"
echo "  - Pods: $(echo $PODS | wc -w) running"
echo "  - Health Status: OK"
echo ""

# Show how to access the application
if [ ! -z "$NODE_PORT" ]; then
    echo "Access the application:"
    echo "  kubectl get nodes -o wide  # Get node IPs"
    echo "  curl http://<NODE_IP>:$NODE_PORT$HEALTH_ENDPOINT"
    echo "  Open http://<NODE_IP>:$NODE_PORT in browser"
fi

echo ""
echo -e "${GREEN}MusicVibe is ready!${NC}"
