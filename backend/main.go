package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"eaglekidz-backend/database"
	"eaglekidz-backend/handlers"
	"eaglekidz-backend/services"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

// Response represents a standard API response
type Response struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Status  string      `json:"status"`
}

// Health check endpoint
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := Response{
		Message: "Server is running",
		Status:  "success",
		Data: map[string]interface{}{
			"timestamp": time.Now().UTC(),
			"version":   "1.0.0",
		},
	}
	json.NewEncoder(w).Encode(response)
}

// Sample API endpoint
func apiHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := Response{
		Message: "Welcome to EagleKidz API",
		Status:  "success",
	}
	json.NewEncoder(w).Encode(response)
}

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Logging middleware
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.RequestURI, time.Since(start))
	})
}

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Connect to MongoDB
	if err := database.Connect(""); err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer database.Disconnect()

	fmt.Println("Connected to MongoDB successfully")

	// Create services
	peopleService := services.NewPeopleService(database.Database)

	// Create handlers
	weekHandler := handlers.NewWeekHandler()
	reviewHandler := handlers.NewReviewHandler()
	aiHandler := handlers.NewAIHandler()
	peopleHandler := handlers.NewPeopleHandler(peopleService)

	// Create a new router
	r := mux.NewRouter()

	// Add middleware
	r.Use(corsMiddleware)
	r.Use(loggingMiddleware)

	// Define routes
	r.HandleFunc("/health", healthHandler).Methods("GET")
	r.HandleFunc("/api", apiHandler).Methods("GET")

	// API v1 routes
	api := r.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/status", healthHandler).Methods("GET")

	// Week routes
	api.HandleFunc("/weeks", weekHandler.CreateWeek).Methods("POST", "OPTIONS")
	api.HandleFunc("/weeks", weekHandler.GetAllWeeks).Methods("GET", "OPTIONS")
	api.HandleFunc("/weeks/{id}", weekHandler.GetWeek).Methods("GET", "OPTIONS")
	api.HandleFunc("/weeks/{id}", weekHandler.DeleteWeek).Methods("DELETE", "OPTIONS")

	// Review routes
	api.HandleFunc("/reviews", reviewHandler.CreateReview).Methods("POST", "OPTIONS")
	api.HandleFunc("/reviews", reviewHandler.GetAllReviews).Methods("GET", "OPTIONS")
	api.HandleFunc("/reviews/{id}", reviewHandler.GetReview).Methods("GET", "OPTIONS")
	api.HandleFunc("/reviews/{id}", reviewHandler.UpdateReview).Methods("PUT", "OPTIONS")
	api.HandleFunc("/reviews/{id}", reviewHandler.DeleteReview).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/weeks/{weekId}/reviews", reviewHandler.GetReviewsByWeek).Methods("GET", "OPTIONS")
	api.HandleFunc("/weeks/{weekId}/deleted-reviews", reviewHandler.GetDeletedReviewsByWeek).Methods("GET", "OPTIONS")
	api.HandleFunc("/reviews/{id}/permanent", reviewHandler.HardDeleteReview).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/reviews/{id}/restore", reviewHandler.RestoreReview).Methods("PUT", "OPTIONS")

	// People routes
	api.HandleFunc("/people", peopleHandler.CreatePeople).Methods("POST", "OPTIONS")
	api.HandleFunc("/people", peopleHandler.GetAllPeople).Methods("GET", "OPTIONS")
	api.HandleFunc("/people/type/{type}", peopleHandler.GetPeopleByType).Methods("GET", "OPTIONS")
	api.HandleFunc("/people/{id}", peopleHandler.GetPeople).Methods("GET", "OPTIONS")
	api.HandleFunc("/people/{id}", peopleHandler.UpdatePeople).Methods("PUT", "OPTIONS")
	api.HandleFunc("/people/{id}", peopleHandler.DeletePeople).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/people/deleted", peopleHandler.GetDeletedPeople).Methods("GET", "OPTIONS")
	api.HandleFunc("/people/{id}/permanent", peopleHandler.HardDeletePeople).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/people/{id}/restore", peopleHandler.RestorePeople).Methods("PUT", "OPTIONS")

	// AI routes
	api.HandleFunc("/ai/summarize", aiHandler.GenerateSummary).Methods("POST", "OPTIONS")

	// Start server
	port := ":8080"
	fmt.Printf("Server starting on port %s\n", port)
	fmt.Println("Available endpoints:")
	fmt.Println("  GET /health - Health check")
	fmt.Println("  GET /api - Welcome message")
	fmt.Println("  GET /api/v1/status - API status")
	fmt.Println("  POST /api/v1/weeks - Create week")
	fmt.Println("  GET /api/v1/weeks - Get all weeks")
	fmt.Println("  GET /api/v1/weeks/{id} - Get week by ID")
	fmt.Println("  DELETE /api/v1/weeks/{id} - Delete week")
	fmt.Println("  POST /api/v1/reviews - Create review")
	fmt.Println("  GET /api/v1/reviews - Get all reviews")
	fmt.Println("  GET /api/v1/reviews/{id} - Get review by ID")
	fmt.Println("  PUT /api/v1/reviews/{id} - Update review")
	fmt.Println("  DELETE /api/v1/reviews/{id} - Soft delete review")
	fmt.Println("  GET /api/v1/weeks/{weekId}/reviews - Get reviews by week")
	fmt.Println("  GET /api/v1/weeks/{weekId}/deleted-reviews - Get deleted reviews by week")
	fmt.Println("  DELETE /api/v1/reviews/{id}/permanent - Permanently delete review")
	fmt.Println("  PUT /api/v1/reviews/{id}/restore - Restore deleted review")
	fmt.Println("  POST /api/v1/people - Create person")
	fmt.Println("  GET /api/v1/people - Get all people")
	fmt.Println("  GET /api/v1/people/type/{type} - Get people by type (minister/children)")
	fmt.Println("  GET /api/v1/people/{id} - Get person by ID")
	fmt.Println("  PUT /api/v1/people/{id} - Update person")
	fmt.Println("  DELETE /api/v1/people/{id} - Soft delete person")
	fmt.Println("  GET /api/v1/people/deleted - Get deleted people")
	fmt.Println("  DELETE /api/v1/people/{id}/permanent - Permanently delete person")
	fmt.Println("  PUT /api/v1/people/{id}/restore - Restore deleted person")

	// Create HTTP server
	srv := &http.Server{
		Addr:    port,
		Handler: r,
	}

	// Start server in a goroutine
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Server failed to start:", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	fmt.Println("\nShutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	fmt.Println("Server exited")
}
