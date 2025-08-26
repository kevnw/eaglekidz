package services

import (
	"context"
	"errors"
	"time"

	"eaglekidz-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type PeopleService struct {
	collection *mongo.Collection
}

func NewPeopleService(db *mongo.Database) *PeopleService {
	return &PeopleService{
		collection: db.Collection("people"),
	}
}

// CreatePeople creates a new person
func (s *PeopleService) CreatePeople(req models.CreatePeopleRequest) (*models.People, error) {
	people := models.People{
		ID:        primitive.NewObjectID(),
		Name:      req.Name,
		Type:      req.Type,
		Age:       req.Age,
		Phone:     req.Phone,
		Email:     req.Email,
		Notes:     req.Notes,
		Deleted:   false,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err := s.collection.InsertOne(context.Background(), people)
	if err != nil {
		return nil, err
	}

	return &people, nil
}

// GetAllPeople retrieves all non-deleted people
func (s *PeopleService) GetAllPeople() ([]models.People, error) {
	filter := bson.M{"deleted": false}
	cursor, err := s.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var people []models.People
	if err = cursor.All(context.Background(), &people); err != nil {
		return nil, err
	}

	return people, nil
}

// GetPeopleByType retrieves all non-deleted people of a specific type
func (s *PeopleService) GetPeopleByType(peopleType string) ([]models.People, error) {
	filter := bson.M{
		"deleted": false,
		"type":    peopleType,
	}
	cursor, err := s.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var people []models.People
	if err = cursor.All(context.Background(), &people); err != nil {
		return nil, err
	}

	return people, nil
}

// GetPeopleByID retrieves a person by ID
func (s *PeopleService) GetPeopleByID(id string) (*models.People, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid ID format")
	}

	filter := bson.M{
		"_id":     objID,
		"deleted": false,
	}

	var people models.People
	err = s.collection.FindOne(context.Background(), filter).Decode(&people)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("person not found")
		}
		return nil, err
	}

	return &people, nil
}

// UpdatePeople updates a person
func (s *PeopleService) UpdatePeople(id string, req models.UpdatePeopleRequest) (*models.People, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid ID format")
	}

	update := bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	if req.Name != nil {
		update["$set"].(bson.M)["name"] = *req.Name
	}
	if req.Type != nil {
		update["$set"].(bson.M)["type"] = *req.Type
	}
	if req.Age != nil {
		update["$set"].(bson.M)["age"] = *req.Age
	}
	if req.Phone != nil {
		update["$set"].(bson.M)["phone"] = *req.Phone
	}
	if req.Email != nil {
		update["$set"].(bson.M)["email"] = *req.Email
	}
	if req.Notes != nil {
		update["$set"].(bson.M)["notes"] = *req.Notes
	}

	filter := bson.M{
		"_id":     objID,
		"deleted": false,
	}

	result := s.collection.FindOneAndUpdate(
		context.Background(),
		filter,
		update,
	)

	if result.Err() != nil {
		if result.Err() == mongo.ErrNoDocuments {
			return nil, errors.New("person not found")
		}
		return nil, result.Err()
	}

	return s.GetPeopleByID(id)
}

// DeletePeople soft deletes a person
func (s *PeopleService) DeletePeople(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid ID format")
	}

	update := bson.M{
		"$set": bson.M{
			"deleted":    true,
			"updated_at": time.Now(),
		},
	}

	filter := bson.M{
		"_id":     objID,
		"deleted": false,
	}

	result, err := s.collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("person not found")
	}

	return nil
}

// GetDeletedPeople retrieves all deleted people
func (s *PeopleService) GetDeletedPeople() ([]models.People, error) {
	filter := bson.M{"deleted": true}
	cursor, err := s.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var people []models.People
	if err = cursor.All(context.Background(), &people); err != nil {
		return nil, err
	}

	return people, nil
}

// HardDeletePeople permanently deletes a person
func (s *PeopleService) HardDeletePeople(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid ID format")
	}

	filter := bson.M{
		"_id":     objID,
		"deleted": true,
	}

	result, err := s.collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("person not found or not deleted")
	}

	return nil
}

// RestorePeople restores a soft-deleted person
func (s *PeopleService) RestorePeople(id string) (*models.People, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid ID format")
	}

	update := bson.M{
		"$set": bson.M{
			"deleted":    false,
			"updated_at": time.Now(),
		},
	}

	filter := bson.M{
		"_id":     objID,
		"deleted": true,
	}

	result := s.collection.FindOneAndUpdate(
		context.Background(),
		filter,
		update,
	)

	if result.Err() != nil {
		if result.Err() == mongo.ErrNoDocuments {
			return nil, errors.New("person not found or not deleted")
		}
		return nil, result.Err()
	}

	return s.GetPeopleByID(id)
}