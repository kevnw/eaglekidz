package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// People represents a person in the church (minister or child)
type People struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name"`
	Type      string             `bson:"type" json:"type"` // "minister" or "children"
	Age       *int               `bson:"age,omitempty" json:"age,omitempty"`
	Phone     string             `bson:"phone,omitempty" json:"phone,omitempty"`
	Email     string             `bson:"email,omitempty" json:"email,omitempty"`
	Notes     string             `bson:"notes,omitempty" json:"notes,omitempty"`
	Deleted   bool               `bson:"deleted" json:"deleted"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// CreatePeopleRequest represents the request payload for creating a person
type CreatePeopleRequest struct {
	Name  string `json:"name" binding:"required"`
	Type  string `json:"type" binding:"required,oneof=minister children"`
	Age   *int   `json:"age,omitempty"`
	Phone string `json:"phone,omitempty"`
	Email string `json:"email,omitempty"`
	Notes string `json:"notes,omitempty"`
}

// UpdatePeopleRequest represents the request payload for updating a person
type UpdatePeopleRequest struct {
	Name  *string `json:"name,omitempty"`
	Type  *string `json:"type,omitempty" binding:"omitempty,oneof=minister children"`
	Age   *int    `json:"age,omitempty"`
	Phone *string `json:"phone,omitempty"`
	Email *string `json:"email,omitempty"`
	Notes *string `json:"notes,omitempty"`
}