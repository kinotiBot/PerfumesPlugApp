import React, { useState } from 'react';
import { Container, Paper, Typography, Button, Box, Alert, TextField } from '@mui/material';
import axios from 'axios';
import { getApiUrl } from '../utils/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testCredentials, setTestCredentials] = useState({
    email: '',
    password: ''
  });

  const addResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testApiConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    // Test 1: Check API URL configuration
    const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
    addResult('API URL Configuration', 'info', `Using API URL: ${apiUrl}`);
    
    // Test 2: Basic connectivity test
    try {
      const healthUrl = getApiUrl('/api/');
      addResult('Health Check URL', 'info', `Testing: ${healthUrl}`);
      
      const response = await axios.get(healthUrl, { timeout: 10000 });
      addResult('Basic Connectivity', 'success', 'API is reachable', response.status);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        addResult('Basic Connectivity', 'error', 'Connection timeout - API server may be down');
      } else if (error.request) {
        addResult('Basic Connectivity', 'error', 'Network error - unable to reach API server', error.message);
      } else {
        addResult('Basic Connectivity', 'error', 'Request setup error', error.message);
      }
    }
    
    // Test 3: Login endpoint test (if credentials provided)
    if (testCredentials.email && testCredentials.password) {
      try {
        const loginUrl = getApiUrl('/api/users/login/');
        addResult('Login Endpoint Test', 'info', `Testing login at: ${loginUrl}`);
        
        const response = await axios.post(loginUrl, testCredentials, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        
        addResult('Login Test', 'success', 'Login successful', response.status);
      } catch (error) {
        if (error.response) {
          addResult('Login Test', 'warning', `Server responded with error: ${error.response.status}`, error.response.data);
        } else if (error.request) {
          addResult('Login Test', 'error', 'No response from login endpoint', error.message);
        } else {
          addResult('Login Test', 'error', 'Login request failed', error.message);
        }
      }
    }
    
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          API Connection Test
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          This page helps diagnose connection issues between the frontend and backend API.
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Login Credentials (Optional)
          </Typography>
          <TextField
            label="Email"
            type="email"
            value={testCredentials.email}
            onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
            sx={{ mr: 2, mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={testCredentials.password}
            onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
            sx={{ mb: 2 }}
          />
        </Box>
        
        <Button 
          variant="contained" 
          onClick={testApiConnection}
          disabled={loading}
          sx={{ mb: 3 }}
        >
          {loading ? 'Testing...' : 'Run API Tests'}
        </Button>
        
        <Box>
          {testResults.map((result, index) => (
            <Alert 
              key={index} 
              severity={getStatusColor(result.status)} 
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle2">
                [{result.timestamp}] {result.test}
              </Typography>
              <Typography variant="body2">
                {result.message}
              </Typography>
              {result.details && (
                <Typography variant="caption" component="pre" sx={{ mt: 1, display: 'block' }}>
                  {typeof result.details === 'object' ? JSON.stringify(result.details, null, 2) : result.details}
                </Typography>
              )}
            </Alert>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default ApiTest;