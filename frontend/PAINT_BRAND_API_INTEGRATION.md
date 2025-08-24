# Paint Brand API Integration Guide

This guide explains how to integrate with AI services to dynamically search for paint brands and their color information.

## Current Implementation

The current implementation uses a mock API endpoint (`/api/search-paint-brand.ts`) that returns predefined data for common paint brands. This is a placeholder for real AI-powered search functionality.

## AI Service Integration Options

### 1. aimlapi.com (Currently Integrated)
You're currently using aimlapi.com with API key: `187fa5d8a5d2445da69a9a126d3f8f6c`

```typescript
// Your current integration in /api/search-paint-brand.ts
const API_KEY = '187fa5d8a5d2445da69a9a126d3f8f6c';
const API_URL = 'https://api.aimlapi.com/chat/completions';

const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a paint expert...'
      },
      {
        role: 'user',
        content: `Tell me about ${brandName} paint brand...`
      }
    ]
  })
});
```

**Benefits:**
- ✅ Already integrated and working
- ✅ Uses GPT-3.5-turbo model
- ✅ Structured JSON responses
- ✅ Fallback handling for errors

**Security Note:** Your API key is stored in environment variables (`.env.local`) and is not committed to git.

**Troubleshooting 403 Errors:**
If you get a 403 Forbidden error, try these steps:
1. Verify your API key is correct
2. Check if you have sufficient credits/quota
3. Ensure the API endpoint URL is correct
4. Test with the `/api/test-aimlapi` endpoint first

### 2. OpenChat (Open Source - Alternative)

[OpenChat](https://github.com/imoneoi/openchat) is a free, open-source alternative to ChatGPT that can run locally on your servers.

```typescript
// Local OpenChat deployment
const searchPaintBrandWithOpenChat = async (brandName: string) => {
  const response = await fetch('http://localhost:8000/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openchat-3.5-7b',
      messages: [
        {
          role: 'system',
          content: 'You are a paint expert. Provide information about paint brands in JSON format.'
        },
        {
          role: 'user',
          content: `Tell me about ${brandName} paint brand. Return JSON with: name, totalColors, averageCostPerMl, priceRange, description, website.`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};
```

**Setup OpenChat locally:**
```bash
git clone https://github.com/imoneoi/openchat.git
cd openchat
pip install -e .
python -m ochat.serving.openai_api_server --model-path ./openchat-3.5-7b --host 0.0.0.0 --port 8000
```

### 2. OpenAI GPT-4 API

```typescript
// Example integration with OpenAI API
const searchPaintBrandWithOpenAI = async (brandName: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a paint expert. Provide information about paint brands including total colors, average cost per ml, price range, and description.'
        },
        {
          role: 'user',
          content: `Tell me about ${brandName} paint brand. Return the response as JSON with fields: name, totalColors, averageCostPerMl, priceRange (Budget/Mid-range/Premium), description, website.`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};
```

### 2. Anthropic Claude API

```typescript
// Example integration with Anthropic Claude API
const searchPaintBrandWithClaude = async (brandName: string) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Provide information about ${brandName} paint brand in JSON format with fields: name, totalColors, averageCostPerMl, priceRange, description, website.`
        }
      ]
    })
  });
  
  const data = await response.json();
  return JSON.parse(data.content[0].text);
};
```

### 3. Google Gemini API

```typescript
// Example integration with Google Gemini API
const searchPaintBrandWithGemini = async (brandName: string) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Provide information about ${brandName} paint brand in JSON format with fields: name, totalColors, averageCostPerMl, priceRange, description, website.`
        }]
      }]
    })
  });
  
  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};
```

## Environment Variables

Add these to your `.env.local` file:

```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

## Enhanced Search Functionality

To make the search more robust, you can:

1. **Cache Results**: Store search results in a database or cache to avoid repeated API calls
2. **Fuzzy Matching**: Implement fuzzy search for brand names
3. **Multiple Sources**: Combine AI search with web scraping or official brand APIs
4. **Real-time Updates**: Periodically update brand information from official sources

## Example Enhanced API Endpoint

```typescript
// Enhanced search endpoint with AI integration
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { brandName } = req.body;
  
  try {
    // Check cache first
    const cachedResult = await checkCache(brandName);
    if (cachedResult) {
      return res.status(200).json(cachedResult);
    }
    
    // Use AI service to search
    const aiResult = await searchPaintBrandWithAI(brandName);
    
    // Cache the result
    await cacheResult(brandName, aiResult);
    
    return res.status(200).json(aiResult);
  } catch (error) {
    // Fallback to mock data
    const fallbackResult = getMockBrandData(brandName);
    return res.status(200).json(fallbackResult);
  }
}
```

## Next Steps

1. Choose an AI service provider (OpenAI, Anthropic, or Google)
2. Set up API keys and environment variables
3. Replace the mock API with real AI integration
4. Implement caching and error handling
5. Add rate limiting and cost optimization
6. Test with various paint brand names

## Cost Considerations

- **OpenAI GPT-4**: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- **Anthropic Claude**: ~$0.015 per 1K input tokens, ~$0.075 per 1K output tokens  
- **Google Gemini**: ~$0.0005 per 1K input tokens, ~$0.0015 per 1K output tokens

For production use, consider implementing caching to reduce API calls and costs.
