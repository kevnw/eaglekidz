# EagleKidz Backend

A Go-based REST API for managing children's church review system with AI-powered summarization.

## Features

- **Week Management**: Create and manage weekly periods (Sunday-Saturday)
- **Review System**: Complete CRUD operations for weekly reviews
- **AI Summarization**: OpenAI GPT-3.5-turbo integration for generating review summaries
- **MongoDB Integration**: Persistent data storage
- **CORS Support**: Cross-origin resource sharing for frontend integration

## Setup

### Prerequisites

- Go 1.19 or higher
- MongoDB running on localhost:27017
- OpenAI API key (for AI summarization)

### Installation

1. Clone the repository and navigate to the backend directory
2. Install dependencies:
   ```bash
   go mod tidy
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

4. Start the server:
   ```bash
   go run main.go
   ```

### Getting an OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

**Note**: Keep your API key secure and never commit it to version control.

## API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /api/v1/status` - API status

### Weeks
- `POST /api/v1/weeks` - Create a new week
- `GET /api/v1/weeks` - Get all weeks
- `GET /api/v1/weeks/{id}` - Get week by ID
- `DELETE /api/v1/weeks/{id}` - Delete week

### Reviews
- `POST /api/v1/reviews` - Create a new review
- `GET /api/v1/reviews` - Get all reviews
- `GET /api/v1/reviews/{id}` - Get review by ID
- `PUT /api/v1/reviews/{id}` - Update review
- `DELETE /api/v1/reviews/{id}` - Delete review
- `GET /api/v1/weeks/{weekId}/reviews` - Get reviews by week

### AI Summarization
- `POST /api/v1/ai/summarize` - Generate AI summary from review content

## AI Integration

The AI summarization feature uses OpenAI's GPT-3.5-turbo model to generate concise summaries based on:
- What went well during the week
- Areas that can be improved
- Action plans for future weeks

If no OpenAI API key is provided, the system falls back to a template-based summary generation.

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key for AI summarization (optional)

## Development

The server runs on port 8080 by default and includes:
- CORS middleware for frontend integration
- Request logging middleware
- Graceful shutdown handling
- MongoDB connection management