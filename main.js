require('dotenv').config();
const axios = require('axios');

// Get the Hugging Face token from environment variables
const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
    console.error('Error: HF_TOKEN environment variable is not set');
    process.exit(1);
}

// Hugging Face API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models';
const MODEL_NAME = 'gpt2'; // You can change this to any model you want to use

async function queryHuggingFace(prompt) {
    try {
        const response = await axios.post(
            `${HF_API_URL}/${MODEL_NAME}`,
            { inputs: prompt },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error calling Hugging Face API:', error.response?.data || error.message);
        throw error;
    }
}

// Example usage
async function main() {
    try {
        const prompt = 'The meaning of life is';
        console.log(`Sending prompt to Hugging Face: "${prompt}"`);
        
        const result = await queryHuggingFace(prompt);
        console.log('Hugging Face API response:');
        console.log(result);
    } catch (error) {
        console.error('Failed to get response from Hugging Face:', error.message);
    }
}

// Run the example
main();
