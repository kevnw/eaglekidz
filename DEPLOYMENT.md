# EagleKidz Deployment Guide

This guide will help you deploy the EagleKidz application using Docker and Docker Compose.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- OpenAI API key (for AI summarization feature)

## Local Development with Docker

### 1. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 2. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 3. Access the Application

- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:8080
- **MongoDB**: localhost:27017

### 4. Stop the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete your data)
docker-compose down -v
```

## Production Deployment Options

### Option 1: DigitalOcean App Platform

1. **Prepare your repository**:
   - Push your code to GitHub/GitLab
   - Ensure all Docker files are committed

2. **Create a new app on DigitalOcean**:
   - Connect your repository
   - DigitalOcean will auto-detect your Docker setup
   - Add environment variables in the dashboard

3. **Configure services**:
   - Frontend: Dockerfile in `/frontend`
   - Backend: Dockerfile in `/backend`
   - Database: Use DigitalOcean Managed MongoDB

### Option 2: AWS ECS (Elastic Container Service)

1. **Push images to ECR**:
```bash
# Build and tag images
docker build -t eaglekidz-backend ./backend
docker build -t eaglekidz-frontend ./frontend

# Tag for ECR
docker tag eaglekidz-backend:latest YOUR_ECR_URI/eaglekidz-backend:latest
docker tag eaglekidz-frontend:latest YOUR_ECR_URI/eaglekidz-frontend:latest

# Push to ECR
docker push YOUR_ECR_URI/eaglekidz-backend:latest
docker push YOUR_ECR_URI/eaglekidz-frontend:latest
```

2. **Create ECS task definitions** for each service
3. **Set up Application Load Balancer**
4. **Use MongoDB Atlas** for managed database

### Option 3: Railway

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
railway login
```

2. **Deploy**:
```bash
# Initialize Railway project
railway init

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up
```

3. **Add MongoDB**: Use Railway's MongoDB template

### Option 4: VPS Deployment

1. **Setup Docker on your VPS**:
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Clone and deploy**:
```bash
git clone your-repository
cd eaglekidz
cp .env.example .env
# Edit .env with your values
docker-compose up -d
```

3. **Setup reverse proxy** (Nginx/Traefik) for HTTPS

## Environment Variables for Production

```bash
# Required
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=mongodb://username:password@host:port/database

# Optional
PORT=8080
FRONTEND_URL=https://your-domain.com
```

## Monitoring and Maintenance

### Health Checks

- Backend health: `GET /api/v1/health`
- Frontend: Check if main page loads
- Database: Connection status in backend logs

### Logs

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Backup Database

```bash
# Create backup
docker exec eaglekidz-mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/eaglekidz?authSource=admin" --out=/backup

# Copy backup from container
docker cp eaglekidz-mongodb:/backup ./backup
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **MongoDB connection**: Check MONGODB_URI format
3. **API not accessible**: Verify CORS settings in backend
4. **Build failures**: Check Docker logs and .dockerignore files

### Performance Optimization

1. **Use multi-stage builds** (already implemented)
2. **Enable gzip compression** (configured in nginx)
3. **Use CDN** for static assets in production
4. **Database indexing** (configured in init-mongo.js)

## Security Considerations

1. **Change default MongoDB credentials** in production
2. **Use environment variables** for all secrets
3. **Enable HTTPS** with reverse proxy
4. **Regular security updates** for base images
5. **Network isolation** between services

## Next Steps

After successful deployment:
1. Set up monitoring (Prometheus/Grafana)
2. Configure automated backups
3. Set up CI/CD pipeline
4. Configure domain and SSL certificates
5. Set up log aggregation