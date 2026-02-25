# AI Features Implementation Guide

## Overview

This chat application now supports AI-powered image generation and text completion using OpenAI's DALL-E 3 and ChatGPT models.

## Features Added

### 1. **AI Image Generation (DALL-E 3)**

- Generate high-quality images from text descriptions
- Multiple size options (Square, Landscape, Portrait)
- Quality settings (Standard, HD)
- Images are automatically sent as chat messages

### 2. **AI Text Generation (ChatGPT)**

- Generate AI-powered text responses
- Support for GPT-3.5-turbo and GPT-4 models
- AI responses are sent as chat messages

## Setup Instructions

### Backend Setup

1. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**

   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your OpenAI API key to the `.env` file:
     ```env
     OPENAI_API_KEY=sk-your-openai-api-key-here
     ```

3. **Get OpenAI API Key**
   - Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Sign up or log in to your OpenAI account
   - Create a new API key
   - Copy and paste it into your `.env` file

### Frontend Setup

1. **Install Dependencies**

   ```bash
   cd frontend/chat-app
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the environment variables if needed

## Usage

### Using AI Image Generation

1. **Start a Chat**

   - Select a contact from your friends list or add a new user

2. **Generate Image**
   - Click the **"AI Image"** button (blue button above the message input)
   - Enter a detailed description of the image you want to generate
   - Select image size (1024x1024, 1792x1024, or 1024x1792)
   - Choose quality (Standard or HD)
   - Click **"Generate Image"**
   - Wait for the image to be generated (typically 10-20 seconds)
   - The generated image will appear in the chat automatically

### Using AI Text Generation

1. **Start a Chat**

   - Select a contact from your friends list or add a new user

2. **Generate Text**
   - Click the **"AI Text"** button (purple button above the message input)
   - Enter your prompt or question
   - Select the model (GPT-3.5-turbo for faster responses, GPT-4 for better quality)
   - Click **"Generate Text"**
   - The AI-generated response will appear in the chat

## API Endpoints

### POST `/ai/generate-image`

Generate an AI image using DALL-E 3

**Request Body:**

```json
{
  "prompt": "A futuristic city at sunset",
  "userId": "user_id_to_send_to",
  "size": "1024x1024",
  "quality": "standard"
}
```

**Response:**

```json
{
  "message": "Image generated successfully",
  "data": {
    "imageUrl": "https://...",
    "prompt": "A futuristic city at sunset",
    "messageId": "message_id",
    "chatId": "chat_id"
  }
}
```

### POST `/ai/generate-text`

Generate AI text completion using ChatGPT

**Request Body:**

```json
{
  "prompt": "Write a story about robots",
  "userId": "user_id_to_send_to",
  "model": "gpt-3.5-turbo"
}
```

**Response:**

```json
{
  "message": "Text generated successfully",
  "data": {
    "response": "Generated text...",
    "messageId": "message_id"
  }
}
```

## File Structure

### Backend Files Added/Modified

```
backend/
├── controller/
│   └── AIController.js          # New: AI operations controller
├── routes/
│   ├── AIRoute.js               # New: AI endpoints
│   └── index.js                 # Modified: Added AI routes
├── package.json                 # Modified: Added OpenAI package
└── .env.example                 # New: Environment variables template
```

### Frontend Files Added/Modified

```
frontend/chat-app/
├── src/
│   ├── component/
│   │   ├── AIImageGenerator.js  # New: Image generation modal
│   │   └── AITextGenerator.js   # New: Text generation modal
│   ├── view/
│   │   └── Home.js              # Modified: Added AI features
│   └── services/
│       └── authentication.js    # Modified: Added AI API calls
└── .env.example                 # New: Environment variables template
```

## Cost Considerations

### DALL-E 3 Pricing

- Standard quality (1024×1024): $0.040 per image
- HD quality (1024×1024): $0.080 per image
- Standard quality (1024×1792, 1792×1024): $0.080 per image
- HD quality (1024×1792, 1792×1024): $0.120 per image

### ChatGPT Pricing

- GPT-3.5-turbo: ~$0.002 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens (input) + $0.06 per 1K tokens (output)

## Troubleshooting

### Error: "OpenAI API key is invalid or missing"

- Verify your `OPENAI_API_KEY` is correctly set in the `.env` file
- Ensure there are no extra spaces or quotes around the API key
- Check that your OpenAI account has available credits

### Error: "Rate limit exceeded"

- You've exceeded your OpenAI rate limit
- Wait a few minutes and try again
- Consider upgrading your OpenAI plan for higher rate limits

### Images not displaying

- Check browser console for errors
- Verify the image URL is accessible
- Ensure your network allows loading images from OpenAI CDN

### "Failed to generate" error

- Check backend console for detailed error messages
- Verify MongoDB and Redis are running
- Ensure the user you're chatting with exists

## Security Notes

1. **Never commit your `.env` file** - It contains sensitive API keys
2. **Rotate API keys regularly** for security
3. **Monitor usage** on OpenAI dashboard to prevent unexpected charges
4. **Implement rate limiting** in production to prevent abuse

## Future Enhancements

Potential improvements for the AI features:

- Image editing and variations
- Conversation context for ChatGPT
- Speech-to-text integration
- Multiple image generation in one request
- Custom AI model fine-tuning
- Cost tracking and usage analytics

## Support

For issues or questions:

- Check OpenAI API documentation: https://platform.openai.com/docs
- Review OpenAI API status: https://status.openai.com
- Check application logs for detailed error messages

---

**Note:** This implementation requires an active OpenAI API account with available credits. The AI features will not work without a valid API key.
