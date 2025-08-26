package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	// Client is the MongoDB client instance
	Client *mongo.Client
	// Database is the MongoDB database instance
	Database *mongo.Database
)

const (
	// DatabaseName is the name of the MongoDB database
	DatabaseName = "eaglekidz"
	// DefaultMongoURI is the default MongoDB connection string
	DefaultMongoURI = "mongodb://localhost:27017"
)

// Connect establishes a connection to MongoDB
func Connect(mongoURI string) error {
	if mongoURI == "" {
		mongoURI = DefaultMongoURI
	}

	// Set client options
	clientOptions := options.Client().ApplyURI(mongoURI)

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	Client = client
	Database = client.Database(DatabaseName)

	log.Printf("Connected to MongoDB at %s", mongoURI)
	return nil
}

// Disconnect closes the MongoDB connection
func Disconnect() error {
	if Client == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err := Client.Disconnect(ctx)
	if err != nil {
		return fmt.Errorf("failed to disconnect from MongoDB: %v", err)
	}

	log.Println("Disconnected from MongoDB")
	return nil
}

// GetCollection returns a MongoDB collection
func GetCollection(collectionName string) *mongo.Collection {
	if Database == nil {
		log.Fatal("Database connection not established")
	}
	return Database.Collection(collectionName)
}