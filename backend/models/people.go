package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// People represents a person in the church (minister or child)
type People struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FirstName string             `bson:"first_name" json:"first_name"`
	LastName  string             `bson:"last_name" json:"last_name"`
	Type      string             `bson:"type" json:"type"` // "minister" or "children"
	AgeGroup  []string           `bson:"age_group,omitempty" json:"age_group,omitempty"`
	Roles     []string           `bson:"roles,omitempty" json:"roles,omitempty"`
	Phone     string             `bson:"phone,omitempty" json:"phone,omitempty"`
	Email     string             `bson:"email,omitempty" json:"email,omitempty"`
	Notes     string             `bson:"notes,omitempty" json:"notes,omitempty"`
	Deleted   bool               `bson:"deleted" json:"deleted"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// CreatePeopleRequest represents the request payload for creating a person
type CreatePeopleRequest struct {
	FirstName string   `json:"first_name" binding:"required"`
	LastName  string   `json:"last_name" binding:"required"`
	Type      string   `json:"type" binding:"required,oneof=minister children"`
	AgeGroup  []string `json:"age_group" binding:"required"`
	Roles     []string `json:"roles" binding:"required"`
	Phone     string   `json:"phone" binding:"required"`
	Email     string   `json:"email,omitempty"`
	Notes     string   `json:"notes,omitempty"`
}

// UpdatePeopleRequest represents the request payload for updating a person
type UpdatePeopleRequest struct {
	FirstName *string   `json:"first_name,omitempty"`
	LastName  *string   `json:"last_name,omitempty"`
	Type      *string   `json:"type,omitempty" binding:"omitempty,oneof=minister children"`
	AgeGroup  []string  `json:"age_group,omitempty"`
	Roles     []string  `json:"roles,omitempty"`
	Phone     *string   `json:"phone,omitempty"`
	Email     *string   `json:"email,omitempty"`
	Notes     *string   `json:"notes,omitempty"`
}