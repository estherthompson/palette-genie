import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_KEY = process.env.AIMLAPI_KEY || '187fa5d8a5d2445da69a9a126d3f8f6c';
    const API_URL = 'https://api.aimlapi.com/v1/chat/completions';
    
    console.log('🧪 Testing aimlapi.com API...');
    console.log('🔑 API Key:', API_KEY.substring(0, 8) + '...');
    console.log('🌐 API URL:', API_URL);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-tiny',
        messages: [
          {
            role: 'user',
            content: 'Hello! Can you tell me about Liquitex paint brand?'
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      })
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return res.status(response.status).json({ 
        error: `API request failed: ${response.status}`,
        details: errorText,
        status: response.status
      });
    }
    
    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    return res.status(200).json({
      success: true,
      message: 'aimlapi.com API test successful',
      data: data
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return res.status(500).json({ 
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
