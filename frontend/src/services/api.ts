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

class ApiService {
  private async fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
}

export const apiService = new ApiService();
export default apiService;