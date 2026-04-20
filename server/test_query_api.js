const axios = require('axios');

async function testApi() {
  try {
    const authHeaders = { Authorization: 'Bearer DUMMY_TOKEN' };
    
    // 1. Register a test user
    const rand = Math.random();
    console.log("Registering test user...");
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: "Test User",
      email: `test_${rand}@test.com`,
      password: "password123"
    });
    
    authHeaders.Authorization = `Bearer ${regRes.data.token}`;
    console.log("Registered! Token:", regRes.data.token.substring(0, 20) + "...");

    // 2. Query
    console.log("Querying...");
    const response = await axios.post('http://localhost:5000/api/query', {
      documentId: '69e50c18ba8374cc78a11635',
      question: 'what this pdf says explain in simple words'
    }, { headers: authHeaders });
    
    console.log("Response:", response.data);
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
  }
}

testApi();
