# 🤖 AI Features Setup Guide

## Quick Start

### 1. Get Your OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Click **"Create new secret key"**
4. Copy the API key (starts with `sk-...`)

### 2. Configure Backend

```bash
cd backend

# If you don't have a .env file, create one
cp .env.example .env

# Edit the .env file and add your OpenAI API key
# OPENAI_API_KEY=sk-your-actual-key-here
```

**Important:** Make sure to add this line to your `.env` file:

```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

### 3. Install Dependencies (Already Done!)

The OpenAI package has been installed. If you need to reinstall:

```bash
cd backend
npm install
```

### 4. Start Your Servers

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend/chat-app
npm start

# Terminal 3 - WebSocket Server
cd websocket
npm start
```

## 🎨 How to Use AI Features

### Generate AI Images (DALL-E 3)

1. Open your chat app and select a contact
2. Click the **"AI Image"** button (blue button above message input)
3. Enter a detailed image description, for example:
   - "A serene Japanese garden with cherry blossoms at sunset"
   - "A futuristic robot playing chess in a cyberpunk city"
   - "A cozy coffee shop interior with warm lighting and books"
4. Select image size and quality
5. Click **"Generate Image"**
6. Wait 10-20 seconds for the AI to create your image
7. The image will appear in your chat!

### Generate AI Text (ChatGPT)

1. Open your chat app and select a contact
2. Click the **"AI Text"** button (purple button above message input)
3. Enter your prompt or question, for example:
   - "Write a short poem about technology"
   - "Explain quantum computing in simple terms"
   - "Create a recipe for chocolate chip cookies"
4. Select the AI model (GPT-3.5-turbo is faster, GPT-4 is more accurate)
5. Click **"Generate Text"**
6. The AI response will appear in your chat!

## 💡 Example Prompts

### Image Generation Ideas:

- "A minimalist logo for a tech startup"
- "An underwater scene with colorful coral reefs"
- "A mountain landscape in the style of Bob Ross"
- "A cute cartoon character mascot for a coding bootcamp"
- "A sci-fi spaceship interior with holographic displays"

### Text Generation Ideas:

- "Write a motivational quote for developers"
- "Explain the difference between REST and GraphQL"
- "Create a short story about a time-traveling programmer"
- "Give me 5 tips for better code organization"
- "Write a haiku about JavaScript"

## 📁 What Was Added

### Backend Files:

- ✅ `controller/AIController.js` - Handles AI generation logic
- ✅ `routes/AIRoute.js` - API endpoints for AI features
- ✅ `routes/index.js` - Updated to include AI routes
- ✅ `.env.example` - Environment variable template
- ✅ OpenAI package installed

### Frontend Files:

- ✅ `component/AIImageGenerator.js` - Image generation modal
- ✅ `component/AITextGenerator.js` - Text generation modal
- ✅ `view/Home.js` - Updated with AI buttons and image display
- ✅ `services/authentication.js` - Added AI API calls
- ✅ `.env.example` - Environment variable template

## 🔍 API Endpoints

### POST `/ai/generate-image`

Generate an image with DALL-E 3

**Request:**

```json
{
  "prompt": "A sunset over mountains",
  "userId": "recipient_user_id",
  "size": "1024x1024",
  "quality": "standard"
}
```

### POST `/ai/generate-text`

Generate text with ChatGPT

**Request:**

```json
{
  "prompt": "Explain AI in simple terms",
  "userId": "recipient_user_id",
  "model": "gpt-3.5-turbo"
}
```

## 💰 Cost Information

### Image Generation (DALL-E 3)

- Standard 1024×1024: **$0.040** per image
- HD 1024×1024: **$0.080** per image
- Standard 1792×1024: **$0.080** per image
- HD 1792×1024: **$0.120** per image

### Text Generation

- GPT-3.5-turbo: **~$0.002** per 1K tokens (very cheap!)
- GPT-4: **~$0.03-0.06** per 1K tokens

**Tip:** Start with GPT-3.5-turbo and standard quality images to keep costs low!

## ⚠️ Troubleshooting

### "OpenAI API key is invalid"

- Check that your API key in `.env` is correct
- Make sure there are no spaces or extra characters
- Verify your OpenAI account has credits

### "Failed to generate image"

- Ensure your prompt doesn't violate OpenAI's content policy
- Check that MongoDB and Redis are running
- Verify the recipient user exists in your database

### Images not showing

- Check browser console for errors
- Verify your internet connection
- Make sure the OpenAI CDN is accessible

### Rate limit errors

- Wait a few minutes before trying again
- Consider upgrading your OpenAI plan
- Implement rate limiting in your app

## 🔒 Security Reminders

1. **NEVER commit your `.env` file to Git**
2. **Keep your OpenAI API key secret**
3. **Monitor your usage** on the OpenAI dashboard
4. **Set spending limits** in your OpenAI account settings
5. **Rotate your API key** regularly for security

## 📊 Monitoring Usage

Check your OpenAI usage at:

- Dashboard: [https://platform.openai.com/usage](https://platform.openai.com/usage)
- Billing: [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)

## 🎉 You're All Set!

Your chat app now has powerful AI capabilities! Start chatting and try generating some amazing images and text with AI.

**Happy coding! 🚀**
