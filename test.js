// test.js
const axios = require('axios');

async function runTest() {
  try {
    const response = await axios.post(
      'https://your-railway-url.up.railway.app/test-prompt',
      {
        prompt: "Write a haiku about artificial intelligence",
        model: "meta-llama/Meta-Llama-3-8B-Instruct"
      }
    );
    
    console.log("Prompt:", response.data.prompt);
    console.log("Response:", response.data.response);
  } catch (error) {
    console.error("Test failed:", error.response?.data || error.message);
  }
}

runTest();
