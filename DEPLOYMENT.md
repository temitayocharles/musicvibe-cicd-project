# MusicVibe Deployment Guide

## Application Overview

MusicVibe is a single-service Node.js application that provides:
- REST API endpoints for music management
- Global music search via iTunes API
- Lyrics lookup via lyrics.ovh API
- React frontend served as static files
- 30-second music preview playback

## Architecture

**Type:** Monolithic single-service application
**Container:** Single Docker image containing API + Frontend
**Port:** 4000
**Health Check:** GET /health

## Docker Deployment

### Pull from Docker Hub

Multi-architecture image supports AMD64 and ARM64:

```bash
docker pull temitayocharles/musicvibe:v1.0
```

### Run Container

```bash
docker run -d \
  -p 4000:4000 \
  --name musicvibe \
  temitayocharles/musicvibe:v1.0
```

### Verify Deployment

```bash
# Check container status
docker ps | grep musicvibe

# Check health endpoint
curl http://localhost:4000/health

# Test API
curl http://localhost:4000/api/v1/songs

# Access frontend
open http://localhost:4000
```

## Kubernetes Deployment

### Apply Manifest

```bash
kubectl apply -f kubernetes/musicvibe-deployment.yaml
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n musicvibe

# Check service
kubectl get svc -n musicvibe

# Get service URL
kubectl get svc musicvibe-service -n musicvibe
```

### Access Application

```bash
# Get NodePort
kubectl get svc musicvibe-service -n musicvibe -o jsonpath='{.spec.ports[0].nodePort}'

# Access via node IP
curl http://<NODE_IP>:<NODE_PORT>/health
```

## API Endpoints

All endpoints are prefixed with `/api/v1`:

### Health
- `GET /health` - Health check (returns {"status":"ok","service":"musicvibe-api"})

### Songs
- `GET /api/v1/songs` - List all songs
- `GET /api/v1/songs/:id` - Get song by ID
- `POST /api/v1/songs/:id/favorite` - Mark song as favorite
- `DELETE /api/v1/songs/:id/favorite` - Remove favorite

### Playlists
- `GET /api/v1/playlists` - List all playlists
- `GET /api/v1/playlists/:id` - Get playlist by ID

### Search
- `GET /api/v1/search/global?q=<query>` - Search iTunes for music

### Lyrics
- `GET /api/v1/lyrics?artist=<artist>&title=<title>` - Fetch lyrics

## Environment Variables

Optional configuration:

```bash
NODE_ENV=production  # Runtime environment
PORT=4000           # Server port (default: 4000)
```

## Resource Requirements

### Recommended
- CPU: 100m (requests), 250m (limits)
- Memory: 256Mi (requests), 512Mi (limits)

### Minimum
- CPU: 50m
- Memory: 128Mi

## Monitoring

### Health Checks

**Liveness Probe:**
```yaml
httpGet:
  path: /health
  port: 4000
initialDelaySeconds: 10
periodSeconds: 10
```

**Readiness Probe:**
```yaml
httpGet:
  path: /health
  port: 4000
initialDelaySeconds: 5
periodSeconds: 5
```

### Metrics

Application exposes basic health status at `/health`:
- `status`: "ok" or "error"
- `service`: "musicvibe-api"

## Troubleshooting

### Container not starting

```bash
# Check logs
docker logs musicvibe

# Check if port is already in use
lsof -i :4000
```

### API not responding

```bash
# Check container health
docker exec musicvibe curl -s http://localhost:4000/health

# Check container processes
docker top musicvibe
```

### Kubernetes pod not ready

```bash
# Describe pod
kubectl describe pod <pod-name> -n musicvibe

# Check logs
kubectl logs <pod-name> -n musicvibe

# Check events
kubectl get events -n musicvibe --sort-by='.lastTimestamp'
```

## Build from Source

### Prerequisites
- Node.js 20+
- Docker

### Build Steps

```bash
# Build Docker image
docker build -t musicvibe:local .

# Run locally
docker run -d -p 4000:4000 musicvibe:local
```

### Multi-arch Build

```bash
# Setup buildx
docker buildx create --use

# Build and push
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t temitayocharles/musicvibe:v1.0 \
  --push .
```

## Version History

### v1.0 (Current)
- Initial release
- Node.js 20 + TypeScript 5.5
- Fastify 4.28 API
- React 19 frontend
- iTunes Search integration
- lyrics.ovh integration
- Multi-arch Docker image (AMD64, ARM64)
- Health check endpoint
- Schema validation with TypeBox

## External Dependencies

### iTunes Search API
- Base URL: https://itunes.apple.com/search
- No authentication required
- Rate limit: Not specified, reasonable usage recommended
- Timeout: 8 seconds

### lyrics.ovh API
- Base URL: https://api.lyrics.ovh/v1
- No authentication required
- Graceful fallback when lyrics not found
- Timeout: 8 seconds

## Security Notes

- No sensitive data stored
- No authentication required for basic features
- External API calls use AbortController with timeouts
- CORS enabled for frontend integration
- Static files served with proper content types
