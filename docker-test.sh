#!/bin/bash

# EagleKidz Docker Test Script
# This script helps you test the Docker setup locally

set -e

echo "🚀 EagleKidz Docker Test Script"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your OPENAI_API_KEY"
    echo "   You can do this by running: nano .env"
    read -p "Press Enter after you've updated the .env file..."
fi

echo "🔧 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Test backend health
echo "🔍 Testing backend health..."
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    echo "📋 Backend logs:"
    docker-compose logs backend
fi

# Test frontend
echo "🔍 Testing frontend..."
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
    echo "📋 Frontend logs:"
    docker-compose logs frontend
fi

# Test MongoDB
echo "🔍 Testing MongoDB..."
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB connection failed"
    echo "📋 MongoDB logs:"
    docker-compose logs mongodb
fi

echo ""
echo "🎉 Docker setup test completed!"
echo ""
echo "📱 Access your application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8080"
echo "   Health Check: http://localhost:8080/health"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   View running containers: docker-compose ps"
echo ""
echo "🔧 If you encounter issues:"
echo "   1. Check the logs: docker-compose logs"
echo "   2. Ensure ports 80, 8080, and 27017 are not in use"
echo "   3. Make sure your .env file has the correct OPENAI_API_KEY"
echo "   4. Try rebuilding: docker-compose down && docker-compose up --build"