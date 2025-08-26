import React, { useState, useEffect } from 'react';
import './App.css';
import { apiService, ApiResponse, HealthData } from './services/api';

interface ApiStatus {
  health: ApiResponse<HealthData> | null;
  welcome: ApiResponse | null;
  status: ApiResponse<HealthData> | null;
  loading: boolean;
  error: string | null;
}

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    health: null,
    welcome: null,
    status: null,
    loading: false,
    error: null
  });

  const fetchApiData = async () => {
    setApiStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [healthResponse, welcomeResponse, statusResponse] = await Promise.all([
        apiService.getHealth(),
        apiService.getWelcome(),
        apiService.getApiStatus()
      ]);

      setApiStatus({
        health: healthResponse,
        welcome: welcomeResponse,
        status: statusResponse,
        loading: false,
        error: null
      });
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>EagleKidz Frontend</h1>
        <p>React application connected to Go backend API</p>
        
        <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px' }}>
          <button 
            onClick={fetchApiData} 
            disabled={apiStatus.loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#61dafb',
              border: 'none',
              borderRadius: '5px',
              cursor: apiStatus.loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {apiStatus.loading ? 'Loading...' : 'Refresh API Data'}
          </button>

          {apiStatus.error && (
            <div style={{ 
              color: '#ff6b6b', 
              backgroundColor: '#ffe0e0', 
              padding: '10px', 
              borderRadius: '5px',
              marginBottom: '20px'
            }}>
              <strong>Error:</strong> {apiStatus.error}
              <br />
              <small>Make sure the Go backend server is running on port 8080</small>
            </div>
          )}

          {apiStatus.health && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Health Check (/health)</h3>
              <pre style={{ 
                backgroundColor: '#f4f4f4', 
                padding: '10px', 
                borderRadius: '5px',
                fontSize: '14px',
                color: '#333'
              }}>
                {JSON.stringify(apiStatus.health, null, 2)}
              </pre>
            </div>
          )}

          {apiStatus.welcome && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Welcome API (/api)</h3>
              <pre style={{ 
                backgroundColor: '#f4f4f4', 
                padding: '10px', 
                borderRadius: '5px',
                fontSize: '14px',
                color: '#333'
              }}>
                {JSON.stringify(apiStatus.welcome, null, 2)}
              </pre>
            </div>
          )}

          {apiStatus.status && (
            <div style={{ marginBottom: '20px' }}>
              <h3>API Status (/api/v1/status)</h3>
              <pre style={{ 
                backgroundColor: '#f4f4f4', 
                padding: '10px', 
                borderRadius: '5px',
                fontSize: '14px',
                color: '#333'
              }}>
                {JSON.stringify(apiStatus.status, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
