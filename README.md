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

## Frontend (React TypeScript)

The frontend is built with React and TypeScript, providing a modern web interface that communicates with the Go backend.

### Features

- React with TypeScript for type safety
- Real-time API integration with backend
- Error handling and loading states
- Responsive UI components
- API service layer for backend communication

### Prerequisites

- Node.js 16+ and npm

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will start on port 3000 and automatically open in your browser.

### Frontend API Integration

The frontend includes an API service (`src/services/api.ts`) that communicates with the backend:

- **Health Check**: Displays server status and version info
- **Welcome API**: Shows welcome message from backend
- **API Status**: Real-time status monitoring

### Frontend Development

#### Project Structure

```
frontend/
├── src/
│   ├── App.tsx           # Main application component
│   ├── services/
│   │   └── api.ts         # API service for backend communication
│   └── ...
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

#### Adding New Features

1. Create new components in `src/components/`
2. Add API methods to `src/services/api.ts`
3. Update types and interfaces as needed
4. Follow existing patterns for error handling

## Getting Started

### Full-Stack Development

1. Clone the repository
2. Start the backend server (port 8080):
   ```bash
   cd backend
   go mod tidy
   go run main.go
   ```
3. Start the frontend server (port 3000):
   ```bash
   cd frontend
   npm install
   npm start
   ```
4. Open http://localhost:3000 to view the application

### Quick Start

For development, you'll need both servers running:
- Backend API: http://localhost:8080
- Frontend App: http://localhost:3000

## Contributing

Please ensure all code follows the established patterns and includes appropriate error handling.