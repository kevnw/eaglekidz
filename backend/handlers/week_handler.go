package handlers

import (
	"encoding/json"
	"net/http"

	"eaglekidz-backend/models"
	"eaglekidz-backend/services"

	"github.com/gorilla/mux"
)

type WeekHandler struct {
	weekService *services.WeekService
}

func NewWeekHandler() *WeekHandler {
	return &WeekHandler{
		weekService: services.NewWeekService(),
	}
}

// CreateWeek handles POST /api/v1/weeks
func (h *WeekHandler) CreateWeek(w http.ResponseWriter, r *http.Request) {
	var req models.CreateWeekRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.StartTime.IsZero() || req.EndTime.IsZero() {
		http.Error(w, "Start time and end time are required", http.StatusBadRequest)
		return
	}

	// Validate that start time is before end time
	if req.StartTime.After(req.EndTime) {
		http.Error(w, "Start time must be before end time", http.StatusBadRequest)
		return
	}

	week, err := h.weekService.CreateWeek(r.Context(), req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		// Check if it's a duplicate week error
		if err.Error() == "a week with the same start and end dates already exists" {
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{
				"message": "Week with the same start and end date already exists",
				"status":  "error",
			})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"message": err.Error(),
			"status":  "error",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    week,
	})
}

// GetWeek handles GET /api/v1/weeks/{id}
func (h *WeekHandler) GetWeek(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	week, err := h.weekService.GetWeekByID(r.Context(), id)
	if err != nil {
		if err.Error() == "week not found" {
			http.Error(w, "Week not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    week,
	})
}

// GetAllWeeks handles GET /api/v1/weeks
func (h *WeekHandler) GetAllWeeks(w http.ResponseWriter, r *http.Request) {
	weeks, err := h.weekService.GetAllWeeks(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    weeks,
	})
}

// DeleteWeek handles DELETE /api/v1/weeks/{id}
func (h *WeekHandler) DeleteWeek(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := h.weekService.DeleteWeek(r.Context(), id)
	if err != nil {
		if err.Error() == "week not found" {
			http.Error(w, "Week not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Week deleted successfully",
	})
}