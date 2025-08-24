import type { NextApiRequest, NextApiResponse } from 'next';

type PaintBrandInfo = {
  name: string;
  totalColors: number;
  averageCostPerMl: number;
  priceRange: 'Budget' | 'Mid-range' | 'Premium';
  description: string;
  website?: string;
  productImages?: string[];
  popularColors?: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaintBrandInfo | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brandName } = req.body;

    if (!brandName) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    // Integration with aimlapi.com API
    const API_KEY = process.env.AIMLAPI_KEY || '187fa5d8a5d2445da69a9a126d3f8f6c';
    const API_URL = 'https://api.aimlapi.com/v1/chat/completions';
    
    try {
      console.log('🔍 Searching for paint brand:', brandName);
      console.log('🔑 Using API key:', API_KEY.substring(0, 8) + '...');
      
      const requestBody = {
        model: 'mistralai/mistral-tiny',
        messages: [
                      {
              role: 'system',
              content: `You are a paint expert. When asked about a paint brand, provide detailed information in this exact JSON format:
{
  "name": "Brand Name",
  "totalColors": number,
  "averageCostPerMl": number,
  "priceRange": "Budget|Mid-range|Premium",
  "description": "Detailed description of the brand",
  "website": "Official website URL if known",
  "productImages": ["URL1", "URL2"],
  "popularColors": ["Color Name 1", "Color Name 2", "Color Name 3"]
}

For productImages, provide 2-3 URLs to actual product images from the brand's website or official sources.
For popularColors, list 3-5 of the brand's most popular or signature colors.

Only return valid JSON, no other text.`
            },
          {
            role: 'user',
            content: `Tell me about ${brandName} paint brand. Include specific details about their paint quality, color range, and pricing.`
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      };
      
      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 API Response data:', JSON.stringify(data, null, 2));
      
      const aiResponse = data.choices?.[0]?.message?.content;
      
      if (!aiResponse) {
        console.error('❌ No AI response in data:', data);
        throw new Error('No response from AI API');
      }

      // Try to parse the AI response as JSON
      let paintBrandInfo: PaintBrandInfo;
      try {
        paintBrandInfo = JSON.parse(aiResponse);
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the text
        paintBrandInfo = {
          name: brandName,
          totalColors: 50,
          averageCostPerMl: 0.15,
          priceRange: 'Mid-range' as const,
          description: aiResponse,
          website: undefined
        };
      }

      return res.status(200).json(paintBrandInfo);
      
    } catch (apiError) {
      console.error('AI API error:', apiError);
      
      // Fallback to basic paint brand information
      const fallbackBrands: Record<string, PaintBrandInfo> = {
        'liquitex': {
          name: 'Liquitex',
          totalColors: 120,
          averageCostPerMl: 0.15,
          priceRange: 'Mid-range',
          description: 'Professional acrylic paints known for their quality and consistency. Great for both beginners and professionals.',
          website: 'https://www.liquitex.com',
          productImages: [
            'https://www.liquitex.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/7/1/71001_1.jpg',
            'https://www.liquitex.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/7/1/71002_1.jpg'
          ],
          popularColors: ['Titanium White', 'Mars Black', 'Cadmium Red Medium', 'Phthalo Blue', 'Hansa Yellow Medium']
        },
        'golden': {
          name: 'Golden',
          totalColors: 90,
          averageCostPerMl: 0.25,
          priceRange: 'Premium',
          description: 'High-quality artist acrylics with excellent pigment load and archival quality.',
          website: 'https://www.goldenpaints.com',
          productImages: [
            'https://www.goldenpaints.com/images/products/acrylics/heavy-body-acrylics/acrylics-heavy-body-2oz.jpg',
            'https://www.goldenpaints.com/images/products/acrylics/heavy-body-acrylics/acrylics-heavy-body-8oz.jpg'
          ],
          popularColors: ['Titanium White', 'Mars Black', 'Quinacridone Red', 'Phthalo Blue', 'Hansa Yellow']
        },
        'winsor newton': {
          name: 'Winsor & Newton',
          totalColors: 150,
          averageCostPerMl: 0.20,
          priceRange: 'Mid-range',
          description: 'Professional artist paints with a wide color range and excellent lightfastness.',
          website: 'https://www.winsornewton.com',
          productImages: [
            'https://www.winsornewton.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/1/1/1100001_1.jpg',
            'https://www.winsornewton.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/1/1/1100002_1.jpg'
          ],
          popularColors: ['Titanium White', 'Ivory Black', 'Cadmium Red', 'French Ultramarine', 'Lemon Yellow']
        },
        'northhaven': {
          name: 'Northhaven',
          totalColors: 80,
          averageCostPerMl: 0.10,
          priceRange: 'Budget',
          description: 'Affordable acrylic paints for students and hobbyists. Good quality for the price.',
          website: 'https://www.northhaven.com',
          productImages: [
            'https://www.northhaven.com/images/products/acrylics/student-acrylics-2oz.jpg',
            'https://www.northhaven.com/images/products/acrylics/student-acrylics-8oz.jpg'
          ],
          popularColors: ['White', 'Black', 'Red', 'Blue', 'Yellow']
        }
      };
      
      // Search for exact or partial matches in fallback data
      const searchTerm = brandName.toLowerCase();
      let fallbackBrand: PaintBrandInfo | null = null;
      
      for (const [key, brand] of Object.entries(fallbackBrands)) {
        if (key.includes(searchTerm) || brand.name.toLowerCase().includes(searchTerm)) {
          fallbackBrand = brand;
          break;
        }
      }
      
      if (fallbackBrand) {
        console.log('🔄 Using fallback data for:', brandName);
        return res.status(200).json(fallbackBrand);
      }
      
      // Generic fallback if no match found
      return res.status(200).json({
        name: brandName,
        totalColors: 50,
        averageCostPerMl: 0.15,
        priceRange: 'Mid-range' as const,
        description: `Information about ${brandName} paint brand (AI search temporarily unavailable)`
      });
    }

  } catch (error) {
    console.error('Error searching paint brand:', error);
    return res.status(500).json({ error: 'Failed to search for paint brand' });
  }
}
