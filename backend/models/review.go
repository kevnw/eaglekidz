package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Review represents a weekly church review
type Review struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	WeekID       primitive.ObjectID `bson:"week_id" json:"week_id"`
	WhatWentWell string             `bson:"what_went_well" json:"what_went_well"`
	CanImprove   string             `bson:"can_improve" json:"can_improve"`
	ActionPlans  string             `bson:"action_plans" json:"action_plans"`
	Summary      string             `bson:"summary" json:"summary"`
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updated_at"`
}

// CreateReviewRequest represents the request payload for creating a review
type CreateReviewRequest struct {
	WeekID       string `json:"week_id" binding:"required"`
	WhatWentWell string `json:"what_went_well" binding:"required"`
	CanImprove   string `json:"can_improve" binding:"required"`
	ActionPlans  string `json:"action_plans" binding:"required"`
	Summary      string `json:"summary" binding:"required"`
}

// UpdateReviewRequest represents the request payload for updating a review
type UpdateReviewRequest struct {
	WhatWentWell *string `json:"what_went_well,omitempty"`
	CanImprove   *string `json:"can_improve,omitempty"`
	ActionPlans  *string `json:"action_plans,omitempty"`
	Summary      *string `json:"summary,omitempty"`
}