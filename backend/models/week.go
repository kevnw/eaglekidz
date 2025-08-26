package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Service represents a church service within a week
type Service struct {
	Name string `bson:"name" json:"name"`
	Time string `bson:"time" json:"time"`
	SIC  string `bson:"sic" json:"sic"` // Service in Charge (Minister ID)
}

// Week represents a church week entity
type Week struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	StartTime time.Time          `bson:"start_time" json:"start_time"`
	EndTime   time.Time          `bson:"end_time" json:"end_time"`
	Services  []Service          `bson:"services" json:"services"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// CreateWeekRequest represents the request payload for creating a week
type CreateWeekRequest struct {
	StartTime time.Time `json:"start_time" binding:"required"`
	EndTime   time.Time `json:"end_time" binding:"required"`
	Services  []Service `json:"services"`
}

// UpdateWeekServicesRequest represents the request payload for updating week services
type UpdateWeekServicesRequest struct {
	Services []Service `json:"services" binding:"required"`
}