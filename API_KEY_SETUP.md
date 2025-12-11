# 🔑 API Key Setup Guide

## 🚨 Important: API Key Required for Real Analysis

The actor now requires you to provide your own API key for AI analysis. This ensures reliability and gives you access to the latest AI models.

## 🎯 Two Modes Available

### 1. 🎭 Demo Mode (No API Key Needed)
- **Setup**: Leave "API Key" field empty and disable "Use Free Tier"
- **Cost**: FREE
- **Output**: Sample analysis with realistic-looking results
- **Use Case**: Testing the actor functionality, seeing output format

### 2. 🎁 Free Tier Mode (Your API Key Required)
- **Setup**: Enable "Use Free Tier" and provide your API key
- **Cost**: FREE (with generous limits) or very low cost
- **Output**: Real AI-powered analysis of your websites
- **Use Case**: Production usage, real insights

## 🔧 How to Get API Keys

### Option 1: Google Gemini (Recommended - FREE)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)
5. Paste into the "API Key" field
6. **Cost**: FREE with generous daily limits

### Option 2: OpenAI GPT-4 Vision
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. Add $5-10 credits to your account
6. Paste into the "API Key" field
7. **Cost**: ~$0.01 per website audit

## 📋 Setup Instructions

### For Demo Mode (Testing Only)
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "useFreeMode": false,
  "apiKey": "",
  "analysisType": "general",
  "viewPort": "desktop"
}
```

### For Real Analysis with Gemini (FREE)
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "useFreeMode": true,
  "apiKey": "AIza-your-gemini-key-here",
  "analysisType": "general",
  "viewPort": "desktop"
}
```

### For Real Analysis with OpenAI
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "useFreeMode": true,
  "apiKey": "sk-your-openai-key-here",
  "analysisType": "general",
  "viewPort": "desktop"
}
```

## 🎯 Expected Results

### Demo Mode Output
```json
{
  "url": "https://example.com",
  "score": 7.5,
  "summary": "Demo analysis: This appears to be a well-structured website...",
  "demo_note": "This is a demo analysis. Provide your API key for real AI-powered insights.",
  "ai_provider": "demo"
}
```

### Real Analysis Output
```json
{
  "url": "https://example.com", 
  "score": 8.2,
  "summary": "Professional design with excellent visual hierarchy and user experience...",
  "color_palette": ["#FFFFFF", "#0066CC", "#333333"],
  "design_flaws": ["Specific issues identified by AI"],
  "positive_aspects": ["Specific strengths identified by AI"],
  "recommendations": ["Actionable improvement suggestions"],
  "ai_provider": "gemini" // or "openai"
}
```

## 🔒 Security Notes

- API keys are stored securely in Apify's encrypted storage
- Keys are never logged or exposed in output
- You maintain full control over your API usage and costs
- Keys can be rotated/changed anytime

## 💡 Pro Tips

1. **Start with Gemini**: It's free and provides excellent results
2. **Use Demo Mode**: Test the actor functionality before adding your key
3. **Monitor Usage**: Check your API provider dashboard for usage stats
4. **Batch Processing**: Analyze multiple URLs in one run for efficiency

## 🆘 Troubleshooting

### "Invalid API Key" Error
- Double-check the key format (AIza... for Gemini, sk-... for OpenAI)
- Ensure the key is active and has proper permissions
- For OpenAI: Make sure you have credits in your account

### Demo Mode Not Working
- Ensure "Use Free Tier" is disabled
- Leave "API Key" field empty
- This will generate sample analysis results

### Real Analysis Not Working
- Enable "Use Free Tier" 
- Provide valid API key
- Check your API provider's dashboard for any issues

---

**Ready to get real AI insights?** Get your free Gemini API key and start analyzing! 🚀