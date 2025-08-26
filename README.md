# EagleKidz

A full-stack application with Go backend and modern frontend.

## Project Structure

```
eaglekidz/
├── backend/        # Go REST API server
├── frontend/       # Frontend application
├── scripts/        # Build and deployment scripts
└── README.md       # This file
```

## Backend (Go REST API)

The backend is built with Go using the Gorilla Mux router.

### Features

- RESTful API endpoints
- CORS middleware for cross-origin requests
- Request logging middleware
- Health check endpoints
- JSON response format

### Prerequisites

- Go 1.21 or higher

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   go mod tidy
   ```

3. Start the server:
   ```bash
   go run main.go
   ```

The server will start on port 8080.

### Available API Endpoints

- `GET /health` - Health check endpoint
- `GET /api` - Welcome message
- `GET /api/v1/status` - API status endpoint

### Example API Requests

#### Health Check
```bash
curl http://localhost:8080/health
```

#### API Welcome
```bash
curl http://localhost:8080/api
```

#### API Status
```bash
curl http://localhost:8080/api/v1/status
```

### API Response Format

All endpoints return JSON responses in the following format:

```json
{
  "message": "Response message",
  "status": "success",
  "data": {
    // Optional data object
  }
}
```

## Development

### Adding New Backend Endpoints

1. Create handler functions in `backend/main.go`
2. Register routes using the mux router
3. Follow the existing response format for consistency

## Getting Started

1. Clone the repository
2. Follow the backend setup instructions above
3. The API will be available at http://localhost:8080

## Contributing

Please ensure all code follows the established patterns and includes appropriate error handling.