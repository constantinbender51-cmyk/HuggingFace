import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the OpenAI client configured for Hugging Face
const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN,
});

async function getChatCompletion() {
    try {
        const chatCompletion = await client.chat.completions.create({
            model: "openai/gpt-oss-120b:novita",
            messages: [
                {
                    role: "user",
                    content: "What is the capital of France?",
                },
            ],
        });

        return chatCompletion.choices[0].message;
    } catch (error) {
        console.error("Error calling Hugging Face API:", error);
        throw error;
    }
}

// Execute and log the response
getChatCompletion()
    .then(response => {
        console.log("Response from Hugging Face:");
        console.log(response);
    })
    .catch(error => {
        console.error("Failed to get response:", error.message);
    });
