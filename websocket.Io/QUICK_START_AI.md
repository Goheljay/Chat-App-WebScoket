# 🚀 Quick Start - AI Features

## ⚡ 3 Steps to Enable AI

### Step 1: Get OpenAI API Key (2 minutes)
1. Visit: https://platform.openai.com/api-keys
2. Sign up/login
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

### Step 2: Add API Key to Backend (30 seconds)
```bash
cd backend
nano .env  # or use your preferred editor
```

Add this line (replace with your actual key):
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

Save and close the file.

### Step 3: Restart Backend (10 seconds)
```bash
cd backend
npm start
```

## 🎉 You're Ready!

1. Open your chat app
2. Select a contact
3. Click **"AI Image"** (blue) or **"AI Text"** (purple)
4. Enter your prompt
5. Click Generate!

## 💡 Try These Prompts

**For Images:**
- "A sunset over mountains"
- "A cute robot mascot"
- "A futuristic city"

**For Text:**
- "Write a haiku about coding"
- "Explain AI in simple terms"
- "Give me 5 programming tips"

## 📚 More Info

- Full setup guide: `SETUP_AI_FEATURES.md`
- Implementation details: `AI_IMPLEMENTATION_SUMMARY.md`

## 💰 Costs

- Images: $0.04-$0.12 each
- Text: ~$0.002 per 1K tokens (very cheap!)

**Tip:** Start with Standard quality images and GPT-3.5-turbo to save money!

---

**Need help?** Check `SETUP_AI_FEATURES.md` for troubleshooting.
