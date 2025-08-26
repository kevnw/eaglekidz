// API service for communicating with the Go backend

const API_BASE_URL = 'http://localhost:8080';

export interface ApiResponse<T = any> {
  message: string;
  status: string;
  data?: T;
}

export interface HealthData {
  timestamp: string;
  version: string;
}

export interface Week {
  id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWeekRequest {
  start_time: string;
  end_time: string;
}

export interface Review {
  id: string;
  week_id: string;
  what_went_well: string;
  can_improve: string;
  action_plans: string;
  summary: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewRequest {
  week_id: string;
  what_went_well: string;
  can_improve: string;
  action_plans: string;
  summary: string;
}

export interface UpdateReviewRequest {
  what_went_well?: string;
  can_improve?: string;
  action_plans?: string;
  summary?: string;
}

export interface WeeksResponse extends ApiResponse<Week[]> {
  success: boolean;
}

export interface WeekResponse extends ApiResponse<Week> {
  success: boolean;
}

export interface ReviewsResponse extends ApiResponse<Review[]> {
  success: boolean;
}

export interface ReviewResponse extends ApiResponse<Review> {
  success: boolean;
}

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        // Try to parse error response from backend
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('Error response from backend:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If parsing fails, use the generic error message
          console.log('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check endpoint
  async getHealth(): Promise<ApiResponse<HealthData>> {
    return this.fetchApi<HealthData>('/health');
  }

  // Welcome API endpoint
  async getWelcome(): Promise<ApiResponse> {
    return this.fetchApi('/api');
  }

  // API status endpoint
  async getApiStatus(): Promise<ApiResponse<HealthData>> {
    return this.fetchApi<HealthData>('/api/v1/status');
  }

  // Week endpoints
  async createWeek(weekData: CreateWeekRequest): Promise<ApiResponse<Week>> {
    return this.fetchApi<Week>('/api/v1/weeks', {
      method: 'POST',
      body: JSON.stringify(weekData),
    });
  }

  async getAllWeeks(): Promise<ApiResponse<Week[]>> {
    return this.fetchApi<Week[]>('/api/v1/weeks');
  }

  async getWeekById(id: string): Promise<ApiResponse<Week>> {
    return this.fetchApi<Week>(`/api/v1/weeks/${id}`);
  }

  async deleteWeek(id: string): Promise<ApiResponse> {
    return this.fetchApi(`/api/v1/weeks/${id}`, {
      method: 'DELETE',
    });
  }

  // Review endpoints
  async createReview(reviewData: CreateReviewRequest): Promise<ApiResponse<Review>> {
    return this.fetchApi<Review>('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getAllReviews(): Promise<ApiResponse<Review[]>> {
    return this.fetchApi<Review[]>('/api/v1/reviews');
  }

  async getReviewById(id: string): Promise<ApiResponse<Review>> {
    return this.fetchApi<Review>(`/api/v1/reviews/${id}`);
  }

  async getReviewsByWeekId(weekId: string): Promise<ApiResponse<Review[]>> {
    return this.fetchApi<Review[]>(`/api/v1/weeks/${weekId}/reviews`);
  }

  async updateReview(id: string, reviewData: UpdateReviewRequest): Promise<ApiResponse<Review>> {
    return this.fetchApi<Review>(`/api/v1/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(id: string): Promise<ApiResponse> {
    return this.fetchApi(`/api/v1/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  async getDeletedReviewsByWeekId(weekId: string): Promise<ApiResponse<Review[]>> {
    return this.fetchApi<Review[]>(`/api/v1/weeks/${weekId}/deleted-reviews`);
  }

  async hardDeleteReview(id: string): Promise<ApiResponse> {
    return this.fetchApi(`/api/v1/reviews/${id}/permanent`, {
      method: 'DELETE',
    });
  }

  async restoreReview(id: string): Promise<ApiResponse<Review>> {
    return this.fetchApi(`/api/v1/reviews/${id}/restore`, {
      method: 'PUT',
    });
  }
}

export const apiService = new ApiService();
export default apiService;