package services

import (
	"context"
	"fmt"
	"time"

	"eaglekidz-backend/database"
	"eaglekidz-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const ReviewsCollection = "reviews"

type ReviewService struct {
	collection *mongo.Collection
}

func NewReviewService() *ReviewService {
	return &ReviewService{
		collection: database.GetCollection(ReviewsCollection),
	}
}

// CreateReview creates a new review
func (s *ReviewService) CreateReview(ctx context.Context, req models.CreateReviewRequest) (*models.Review, error) {
	weekObjID, err := primitive.ObjectIDFromHex(req.WeekID)
	if err != nil {
		return nil, fmt.Errorf("invalid week ID: %v", err)
	}

	review := &models.Review{
		ID:           primitive.NewObjectID(),
		WeekID:       weekObjID,
		WhatWentWell: req.WhatWentWell,
		CanImprove:   req.CanImprove,
		ActionPlans:  req.ActionPlans,
		Summary:      req.Summary,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err = s.collection.InsertOne(ctx, review)
	if err != nil {
		return nil, fmt.Errorf("failed to create review: %v", err)
	}

	return review, nil
}

// GetReviewByID retrieves a review by its ID
func (s *ReviewService) GetReviewByID(ctx context.Context, id string) (*models.Review, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid review ID: %v", err)
	}

	var review models.Review
	err = s.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&review)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("review not found")
		}
		return nil, fmt.Errorf("failed to get review: %v", err)
	}

	return &review, nil
}

// GetReviewsByWeekID retrieves all reviews for a specific week
func (s *ReviewService) GetReviewsByWeekID(ctx context.Context, weekID string) ([]*models.Review, error) {
	weekObjID, err := primitive.ObjectIDFromHex(weekID)
	if err != nil {
		return nil, fmt.Errorf("invalid week ID: %v", err)
	}

	cursor, err := s.collection.Find(ctx, bson.M{"week_id": weekObjID})
	if err != nil {
		return nil, fmt.Errorf("failed to get reviews: %v", err)
	}
	defer cursor.Close(ctx)

	var reviews []*models.Review
	for cursor.Next(ctx) {
		var review models.Review
		if err := cursor.Decode(&review); err != nil {
			return nil, fmt.Errorf("failed to decode review: %v", err)
		}
		reviews = append(reviews, &review)
	}

	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %v", err)
	}

	return reviews, nil
}

// GetAllReviews retrieves all reviews
func (s *ReviewService) GetAllReviews(ctx context.Context) ([]*models.Review, error) {
	cursor, err := s.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("failed to get reviews: %v", err)
	}
	defer cursor.Close(ctx)

	var reviews []*models.Review
	for cursor.Next(ctx) {
		var review models.Review
		if err := cursor.Decode(&review); err != nil {
			return nil, fmt.Errorf("failed to decode review: %v", err)
		}
		reviews = append(reviews, &review)
	}

	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %v", err)
	}

	return reviews, nil
}

// UpdateReview updates a review by its ID
func (s *ReviewService) UpdateReview(ctx context.Context, id string, req models.UpdateReviewRequest) (*models.Review, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid review ID: %v", err)
	}

	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	if req.WhatWentWell != nil {
		update["$set"].(bson.M)["what_went_well"] = *req.WhatWentWell
	}
	if req.CanImprove != nil {
		update["$set"].(bson.M)["can_improve"] = *req.CanImprove
	}
	if req.ActionPlans != nil {
		update["$set"].(bson.M)["action_plans"] = *req.ActionPlans
	}
	if req.Summary != nil {
		update["$set"].(bson.M)["summary"] = *req.Summary
	}

	_, err = s.collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		return nil, fmt.Errorf("failed to update review: %v", err)
	}

	return s.GetReviewByID(ctx, id)
}

// DeleteReview deletes a review by its ID
func (s *ReviewService) DeleteReview(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid review ID: %v", err)
	}

	result, err := s.collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return fmt.Errorf("failed to delete review: %v", err)
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("review not found")
	}

	return nil
}