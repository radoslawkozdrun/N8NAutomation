const axios = require('axios');

async function testEndpointWithAuth() {
  try {
    console.log('Testing endpoint with authentication...');

    // Test endpoint bez uwierzytelnienia (powinien zwrócić 401)
    try {
      const response = await axios.get('http://localhost:8002/api/feeds/fetch-logs?page=1&limit=20');
      console.log('Unexpected success without auth:', response.status);
    } catch (error) {
      console.log('Expected auth error:', error.response?.status, error.response?.data?.message);
    }

    // Sprawdzmy endpoint testowy z health check
    try {
      const healthResponse = await axios.get('http://localhost:8002/api/health');
      console.log('Health check response:', healthResponse.status, healthResponse.data);
    } catch (error) {
      console.error('Health check failed:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testEndpointWithAuth();