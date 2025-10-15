const fetch = require('node-fetch');

// This is the URL for the Gemini API
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';

// This is the main function handler for Netlify
exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: 'Method Not Allowed',
        };
    }

    // Securely read the API key from Netlify Environment Variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ error: 'Server API key missing.' }),
        };
    }

    try {
        const data = JSON.parse(event.body);
        const photoDescription = data.photoDescription;
        
        if (!photoDescription) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Photo description is required.' }),
            };
        }

        const systemPrompt = "You are a witty, magical social media content creator. Your goal is to write a single, short, incredibly engaging Instagram caption (max 15 words) for a travel photo. The caption must use playful language, incorporate a hint of 'pixie dust' or 'magic', and end with a relevant emoji. Do not use hashtags.";
        
        const userPrompt = `Write a caption for a photo described as: "${photoDescription}"`;

        const payload = {
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        const response = await fetch(`${GEMINI_API_BASE_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Couldn't generate a caption. Try again!";

        return {
            statusCode: 200,
            headers: { 
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ caption: generatedText }),
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Failed to communicate with the AI service.' }),
        };
    }
};

