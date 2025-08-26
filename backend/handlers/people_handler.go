package handlers

import (
	"encoding/json"
	"net/http"

	"eaglekidz-backend/models"
	"eaglekidz-backend/services"

	"github.com/gorilla/mux"
)

type PeopleHandler struct {
	peopleService *services.PeopleService
}

func NewPeopleHandler(peopleService *services.PeopleService) *PeopleHandler {
	return &PeopleHandler{
		peopleService: peopleService,
	}
}

// CreatePeople handles POST /api/v1/people
func (h *PeopleHandler) CreatePeople(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.CreatePeopleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate type
	if req.Type != "minister" && req.Type != "children" {
		http.Error(w, "Type must be 'minister' or 'children'", http.StatusBadRequest)
		return
	}

	people, err := h.peopleService.CreatePeople(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Person created successfully",
		"status":  "success",
		"data":    people,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// GetAllPeople handles GET /api/v1/people
func (h *PeopleHandler) GetAllPeople(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	people, err := h.peopleService.GetAllPeople()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "People retrieved successfully",
		"status":  "success",
		"data":    people,
	}

	json.NewEncoder(w).Encode(response)
}

// GetPeopleByType handles GET /api/v1/people/type/{type}
func (h *PeopleHandler) GetPeopleByType(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	peopleType := vars["type"]

	// Validate type
	if peopleType != "minister" && peopleType != "children" {
		http.Error(w, "Type must be 'minister' or 'children'", http.StatusBadRequest)
		return
	}

	people, err := h.peopleService.GetPeopleByType(peopleType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "People retrieved successfully",
		"status":  "success",
		"data":    people,
	}

	json.NewEncoder(w).Encode(response)
}

// GetPeople handles GET /api/v1/people/{id}
func (h *PeopleHandler) GetPeople(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	people, err := h.peopleService.GetPeopleByID(id)
	if err != nil {
		if err.Error() == "person not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Person retrieved successfully",
		"status":  "success",
		"data":    people,
	}

	json.NewEncoder(w).Encode(response)
}

// UpdatePeople handles PUT /api/v1/people/{id}
func (h *PeopleHandler) UpdatePeople(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	var req models.UpdatePeopleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate type if provided
	if req.Type != nil && *req.Type != "minister" && *req.Type != "children" {
		http.Error(w, "Type must be 'minister' or 'children'", http.StatusBadRequest)
		return
	}

	people, err := h.peopleService.UpdatePeople(id, req)
	if err != nil {
		if err.Error() == "person not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Person updated successfully",
		"status":  "success",
		"data":    people,
	}

	json.NewEncoder(w).Encode(response)
}

// DeletePeople handles DELETE /api/v1/people/{id}
func (h *PeopleHandler) DeletePeople(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	err := h.peopleService.DeletePeople(id)
	if err != nil {
		if err.Error() == "person not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Person deleted successfully",
		"status":  "success",
	}

	json.NewEncoder(w).Encode(response)
}

// GetDeletedPeople handles GET /api/v1/people/deleted
func (h *PeopleHandler) GetDeletedPeople(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	people, err := h.peopleService.GetDeletedPeople()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Deleted people retrieved successfully",
		"status":  "success",
		"data":    people,
	}

	json.NewEncoder(w).Encode(response)
}

// HardDeletePeople handles DELETE /api/v1/people/{id}/permanent
func (h *PeopleHandler) HardDeletePeople(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	err := h.peopleService.HardDeletePeople(id)
	if err != nil {
		if err.Error() == "person not found or not deleted" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Person permanently deleted successfully",
		"status":  "success",
	}

	json.NewEncoder(w).Encode(response)
}

// RestorePeople handles PUT /api/v1/people/{id}/restore
func (h *PeopleHandler) RestorePeople(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	people, err := h.peopleService.RestorePeople(id)
	if err != nil {
		if err.Error() == "person not found or not deleted" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Person restored successfully",
		"status":  "success",
		"data":    people,
	}

	json.NewEncoder(w).Encode(response)
}