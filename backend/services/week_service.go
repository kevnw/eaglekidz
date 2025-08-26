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
	"go.mongodb.org/mongo-driver/mongo/options"
)

const WeeksCollection = "weeks"

type WeekService struct {
	collection *mongo.Collection
}

func NewWeekService() *WeekService {
	return &WeekService{
		collection: database.GetCollection(WeeksCollection),
	}
}

// CreateWeek creates a new week
func (s *WeekService) CreateWeek(ctx context.Context, req models.CreateWeekRequest) (*models.Week, error) {
	// Check if a week with the same start and end dates already exists
	existingWeek := &models.Week{}
	err := s.collection.FindOne(ctx, bson.M{
		"start_time": req.StartTime,
		"end_time":   req.EndTime,
	}).Decode(existingWeek)
	
	if err == nil {
		return nil, fmt.Errorf("a week with the same start and end dates already exists")
	} else if err != mongo.ErrNoDocuments {
		return nil, fmt.Errorf("failed to check for duplicate week: %v", err)
	}

	week := &models.Week{
		ID:        primitive.NewObjectID(),
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = s.collection.InsertOne(ctx, week)
	if err != nil {
		return nil, fmt.Errorf("failed to create week: %v", err)
	}

	return week, nil
}

// GetWeekByID retrieves a week by its ID
func (s *WeekService) GetWeekByID(ctx context.Context, id string) (*models.Week, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid week ID: %v", err)
	}

	var week models.Week
	err = s.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&week)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("week not found")
		}
		return nil, fmt.Errorf("failed to get week: %v", err)
	}

	return &week, nil
}

// GetAllWeeks retrieves all weeks
func (s *WeekService) GetAllWeeks(ctx context.Context) ([]*models.Week, error) {
	// Sort by start_time in ascending order (oldest first)
	opts := options.Find().SetSort(bson.D{{"start_time", 1}})
	cursor, err := s.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to get weeks: %v", err)
	}
	defer cursor.Close(ctx)

	var weeks []*models.Week
	for cursor.Next(ctx) {
		var week models.Week
		if err := cursor.Decode(&week); err != nil {
			return nil, fmt.Errorf("failed to decode week: %v", err)
		}
		weeks = append(weeks, &week)
	}

	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %v", err)
	}

	return weeks, nil
}

// DeleteWeek deletes a week by its ID
func (s *WeekService) DeleteWeek(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid week ID: %v", err)
	}

	result, err := s.collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return fmt.Errorf("failed to delete week: %v", err)
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("week not found")
	}

	return nil
}