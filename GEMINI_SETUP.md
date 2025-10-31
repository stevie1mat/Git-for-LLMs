# Gemini API Setup Guide

## Getting Your Gemini API Key

1. **Go to Google AI Studio**
   - Visit: https://aistudio.google.com/
   - Sign in with your Google account

2. **Create an API Key**
   - Click "Get API Key" in the left sidebar
   - Click "Create API Key"
   - Choose "Create API key in new project" or select an existing project
   - Copy the generated API key

3. **Add to Your Environment**
   - Create a `.env` file in your LangFork project root
   - Add your API key:
   ```env
   REACT_APP_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Restart the Development Server**
   ```bash
   npm start
   ```

## Why Gemini Flash 2.0?

- **Speed**: Extremely fast response times
- **Cost**: Very affordable pricing
- **Quality**: Excellent for conversational AI
- **Context**: Good at understanding conversation context
- **Multimodal**: Supports text, images, and more (future feature)

## Pricing (as of 2024)

- **Gemini Flash 2.0**: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
- **Very cost-effective** for LangFork's use case
- Free tier available for testing

## Troubleshooting

### "Gemini API key not found" Error
- Make sure your `.env` file is in the project root
- Restart the development server after adding the key
- Check that the key starts with `AIza...`

### API Quota Exceeded
- Check your usage in Google AI Studio
- Consider upgrading your quota if needed
- The app will fall back to mock responses if the API fails

### Slow Responses
- Gemini Flash 2.0 is typically very fast
- Check your internet connection
- Consider adjusting the `maxTokens` parameter in the code

## Advanced Configuration

You can customize Gemini settings in `src/hooks/useLLM.js`:

```javascript
return await sendToGemini(context, {
  model: 'gemini-2.0-flash-exp',  // or 'gemini-1.5-flash'
  temperature: 0.7,               // 0.0 to 1.0
  maxTokens: 2000,               // Max response length
  topP: 0.95,                    // Nucleus sampling
  topK: 40                       // Top-k sampling
});
```

Happy chatting with Gemini! 🚀
