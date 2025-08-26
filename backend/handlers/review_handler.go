package handlers

import (
	"encoding/json"
	"net/http"

	"eaglekidz-backend/models"
	"eaglekidz-backend/services"

	"github.com/gorilla/mux"
)

type ReviewHandler struct {
	reviewService *services.ReviewService
}

func NewReviewHandler() *ReviewHandler {
	return &ReviewHandler{
		reviewService: services.NewReviewService(),
	}
}

// CreateReview handles POST /api/v1/reviews
func (h *ReviewHandler) CreateReview(w http.ResponseWriter, r *http.Request) {
	var req models.CreateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.WeekID == "" {
		http.Error(w, "Week ID is required", http.StatusBadRequest)
		return
	}

	review, err := h.reviewService.CreateReview(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    review,
	})
}

// GetReview handles GET /api/v1/reviews/{id}
func (h *ReviewHandler) GetReview(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	review, err := h.reviewService.GetReviewByID(r.Context(), id)
	if err != nil {
		if err.Error() == "review not found" {
			http.Error(w, "Review not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    review,
	})
}

// GetReviewsByWeek handles GET /api/v1/weeks/{weekId}/reviews
func (h *ReviewHandler) GetReviewsByWeek(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	weekID := vars["weekId"]

	reviews, err := h.reviewService.GetReviewsByWeekID(r.Context(), weekID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    reviews,
	})
}

// GetAllReviews handles GET /api/v1/reviews
func (h *ReviewHandler) GetAllReviews(w http.ResponseWriter, r *http.Request) {
	reviews, err := h.reviewService.GetAllReviews(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    reviews,
	})
}

// UpdateReview handles PUT /api/v1/reviews/{id}
func (h *ReviewHandler) UpdateReview(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var req models.UpdateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	review, err := h.reviewService.UpdateReview(r.Context(), id, req)
	if err != nil {
		if err.Error() == "review not found" {
			http.Error(w, "Review not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    review,
	})
}

// DeleteReview handles DELETE /api/v1/reviews/{id}
func (h *ReviewHandler) DeleteReview(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := h.reviewService.DeleteReview(r.Context(), id)
	if err != nil {
		if err.Error() == "review not found" {
			http.Error(w, "Review not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Review deleted successfully",
	})
}