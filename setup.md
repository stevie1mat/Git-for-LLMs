# LangFork Setup Guide

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env` file in the root directory with your API keys:
```env
# Gemini API Key (recommended - fast and cost-effective)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Other LLM providers
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

3. **Start the development server:**
```bash
npm start
```

4. **Open your browser:**
Navigate to `http://localhost:3000`

## What You'll See

- **Welcome Node**: The app starts with a root node
- **Interactive Tree**: Click and drag to navigate
- **Message Input**: Type at the bottom to send messages
- **Context Panel**: See pinned nodes and context info
- **Toolbar**: Export, import, and project management

## Development Notes

- The app uses **Gemini Flash 2.0** by default (fast and cost-effective)
- Falls back to mock LLM if no API key is provided
- To use other LLMs, add your API keys to the `.env` file
- All data is saved to localStorage automatically
- The tree structure is fully persistent

## Next Steps

1. Test the basic functionality
2. Add your API keys for real LLM integration
3. Customize the UI and behavior as needed
4. Deploy to production when ready

Happy coding! 🚀
