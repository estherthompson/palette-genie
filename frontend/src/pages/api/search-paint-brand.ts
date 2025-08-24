import type { NextApiRequest, NextApiResponse } from 'next';

type PaintBrandInfo = {
  name: string;
  totalColors: number;
  averageCostPerMl: number;
  priceRange: 'Budget' | 'Mid-range' | 'Premium';
  description: string;
  website?: string;
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

    // Integration with OpenChat (open-source alternative to ChatGPT)
    // You can also use OpenAI API, Anthropic Claude, or Google Gemini
    // For OpenChat local deployment, replace the URL with your local server
    
    const mockBrandData: Record<string, PaintBrandInfo> = {
      'liquitex': {
        name: 'Liquitex',
        totalColors: 120,
        averageCostPerMl: 0.15,
        priceRange: 'Mid-range',
        description: 'Professional acrylic paints known for their quality and consistency',
        website: 'https://www.liquitex.com'
      },
      'golden': {
        name: 'Golden',
        totalColors: 90,
        averageCostPerMl: 0.25,
        priceRange: 'Premium',
        description: 'High-quality artist acrylics with excellent pigment load',
        website: 'https://www.goldenpaints.com'
      },
      'winsor newton': {
        name: 'Winsor & Newton',
        totalColors: 150,
        averageCostPerMl: 0.20,
        priceRange: 'Mid-range',
        description: 'Professional artist paints with a wide color range',
        website: 'https://www.winsornewton.com'
      },
      'northhaven': {
        name: 'Northhaven',
        totalColors: 80,
        averageCostPerMl: 0.10,
        priceRange: 'Budget',
        description: 'Affordable acrylic paints for students and hobbyists',
        website: 'https://www.northhaven.com'
      }
    };

    // Search for exact or partial matches
    const searchTerm = brandName.toLowerCase();
    let foundBrand: PaintBrandInfo | null = null;

    for (const [key, brand] of Object.entries(mockBrandData)) {
      if (key.includes(searchTerm) || brand.name.toLowerCase().includes(searchTerm)) {
        foundBrand = brand;
        break;
      }
    }

    if (foundBrand) {
      return res.status(200).json(foundBrand);
    }

    // If no exact match, return a generic response
    return res.status(200).json({
      name: brandName,
      totalColors: 50,
      averageCostPerMl: 0.15,
      priceRange: 'Mid-range' as const,
      description: `Information about ${brandName} paint brand`
    });

  } catch (error) {
    console.error('Error searching paint brand:', error);
    return res.status(500).json({ error: 'Failed to search for paint brand' });
  }
}
