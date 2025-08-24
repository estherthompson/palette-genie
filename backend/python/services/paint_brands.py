import numpy as np
from typing import Dict, List, Optional
from models.color_models import Color, UserPaint

class PaintBrands:
    """Database of paint brands and their available colors"""
    
    def __init__(self):
        self.brands = self._load_paint_brands()
    
    def _load_paint_brands(self) -> Dict[str, Dict[str, UserPaint]]:
        """Load comprehensive paint brand databases"""
        return {
            "Northhaven": self._get_northhaven_colors(),
            "Liquitex": self._get_liquitex_colors(),
            "Golden": self._get_golden_colors()
        }
    
    def get_brand_colors(self, brand_name: str) -> List[UserPaint]:
        """Get all available colors for a specific brand"""
        brand_name_lower = brand_name.lower()
        
        # Find exact or partial match
        for brand in self.brands.keys():
            if brand_name_lower in brand.lower():
                return list(self.brands[brand].values())
        
        return []
    
    def search_colors_by_name(self, brand_name: str, color_name: str) -> List[UserPaint]:
        """Search for specific colors by name within a brand"""
        brand_colors = self.get_brand_colors(brand_name)
        if not brand_colors:
            return []
        
        color_name_lower = color_name.lower()
        matches = []
        
        for paint_color in brand_colors:
            if color_name_lower in paint_color.name.lower():
                matches.append(paint_color)
        
        return matches
    
    def get_similar_colors(self, target_color: Color, brand_name: str, limit: int = 5) -> List[UserPaint]:
        """Find similar colors from a specific brand to a target color"""
        brand_colors = self.get_brand_colors(brand_name)
        if not brand_colors:
            return []
        
        # Calculate color similarity using RGB distance
        similarities = []
        target_rgb = np.array(target_color.rgb)
        
        for paint_color in brand_colors:
            paint_rgb = np.array(paint_color.color.rgb)
            distance = np.linalg.norm(target_rgb - paint_rgb)
            similarities.append((distance, paint_color))
        
        # Sort by similarity (closest first)
        similarities.sort(key=lambda x: x[0])
        
        return [paint_color for _, paint_color in similarities[:limit]]
    
    def _get_northhaven_colors(self) -> Dict[str, UserPaint]:
        """Northhaven acrylic paint colors"""
        colors = {
            "Titanium White": UserPaint(
                id="northhaven-white",
                name="Titanium White",
                brand="Northhaven",
                color=Color(
                    rgb=[255, 255, 255],
                    hex="#FFFFFF",
                    hsl=[0.0, 0.0, 100.0],
                    cmyk=[0.0, 0.0, 0.0, 0.0],
                    name="Titanium White",
                    confidence=1.0,
                    tier="dominant"
                ),
                opacity=1.0,
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.04,
                notes="Professional grade titanium white"
            ),
            "Burnt Sienna": UserPaint(
                id="northhaven-burnt-sienna",
                name="Burnt Sienna",
                brand="Northhaven",
                color=Color(
                    rgb=[160, 82, 45],
                    hex="#A0522D",
                    hsl=[19.0, 56.0, 40.0],
                    cmyk=[0.0, 49.0, 72.0, 37.0],
                    name="Burnt Sienna",
                    confidence=1.0,
                    tier="dominant"
                ),
                opacity=1.0,
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.05,
                notes="Warm earth tone"
            ),
            "Ultramarine Blue": UserPaint(
                id="northhaven-ultramarine",
                name="Ultramarine Blue",
                brand="Northhaven",
                color=Color(
                    rgb=[18, 10, 143],
                    hex="#120A8F",
                    hsl=[242.0, 87.0, 30.0],
                    cmyk=[87.0, 93.0, 0.0, 44.0],
                    name="Ultramarine Blue",
                    confidence=1.0,
                    tier="dominant"
                ),
                opacity=1.0,
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.06,
                notes="Deep blue pigment"
            ),
            "Cadmium Red": UserPaint(
                id="northhaven-cadmium-red",
                name="Cadmium Red",
                brand="Northhaven",
                color=Color(
                    rgb=[227, 0, 34],
                    hex="#E30022",
                    hsl=[350.0, 100.0, 44.5],
                    cmyk=[0.0, 100.0, 85.0, 11.0],
                    name="Cadmium Red",
                    confidence=1.0,
                    tier="dominant"
                ),
                opacity=1.0,
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.07,
                notes="Bright red pigment"
            ),
            "Cadmium Yellow": UserPaint(
                id="northhaven-cadmium-yellow",
                name="Cadmium Yellow",
                brand="Northhaven",
                color=Color(
                    rgb=[255, 246, 0],
                    hex="#FFF600",
                    hsl=[58.0, 100.0, 50.0],
                    cmyk=[0.0, 4.0, 100.0, 0.0],
                    name="Cadmium Yellow",
                    confidence=1.0,
                    tier="dominant"
                ),
                opacity=1.0,
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.07,
                notes="Bright yellow pigment"
            )
        }
        return colors
    
    def _get_liquitex_colors(self) -> Dict[str, UserPaint]:
        """Liquitex acrylic paint colors"""
        colors = {
            "Titanium White": UserPaint(
                id="liquitex-white",
                name="Titanium White",
                brand="Liquitex",
                color=Color(
                    rgb=[255, 255, 255],
                    hex="#FFFFFF",
                    hsl=[0.0, 0.0, 100.0],
                    cmyk=[0.0, 0.0, 0.0, 0.0],
                    name="Titanium White",
                    confidence=1.0,
                    tier="dominant"
                ),
                opacity=1.0,
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.08,
                notes="Professional acrylic white"
            ),
            "Phthalo Blue": UserPaint(
                id="liquitex-phthalo-blue",
                name="Phthalo Blue",
                brand="Liquitex",
                color=Color(
                    rgb=[0, 15, 137],
                    hex="#000F89",
                    hsl=[235.0, 100.0, 27.0],
                    cmyk=[100.0, 89.0, 0.0, 46.0],
                    name="Phthalo Blue",
                    confidence=1.0,
                    tier="dominant"
                ),
                opacity=1.0,
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.12,
                notes="Intense blue pigment"
            ),
            "Quinacridone Magenta": UserPaint(
                id="liquitex-quinacridone",
                name="Quinacridone Magenta",
                brand="Liquitex",
                color=Color(
                    rgb=[142, 0, 62],
                    hex="#8E003E",
                    hsl=[335.0, 100.0, 28.0],
                    cmyk=[0.0, 100.0, 56.0, 44.0],
                    name="Quinacridone Magenta",
                    confidence=1.0,
                    tier="dominant"
                ),
                opacity=1.0,
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.15,
                notes="Transparent magenta"
            )
        }
        return colors
    
    def _get_golden_colors(self) -> Dict[str, UserPaint]:
        """Golden acrylic paint colors"""
        colors = {
            "Titanium White": UserPaint(
                id="golden-white",
                name="Titanium White",
                brand="Golden",
                color=Color(
                    rgb=[255, 255, 255],
                    hex="#FFFFFF",
                    hsl=[0.0, 0.0, 100.0],
                    cmyk=[0.0, 0.0, 0.0, 0.0],
                    name="Titanium White",
                    confidence=1.0,
                    tier="dominant"
                ),
                opacity=1.0,
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.18,
                notes="Professional artist grade"
            ),
            "Cobalt Blue": UserPaint(
                id="golden-cobalt-blue",
                name="Cobalt Blue",
                brand="Golden",
                color=Color(
                    rgb=[0, 71, 171],
                    hex="#0047AB",
                    hsl=[217.0, 100.0, 33.5],
                    cmyk=[100.0, 58.0, 0.0, 33.0],
                    name="Cobalt Blue",
                    confidence=1.0,
                    tier="dominant"
                ),
                opacity=1.0,
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.25,
                notes="Traditional cobalt blue"
            ),
            "Alizarin Crimson": UserPaint(
                id="golden-alizarin",
                name="Alizarin Crimson",
                brand="Golden",
                color=Color(
                    rgb=[227, 38, 54],
                    hex="#E32636",
                    hsl=[354.0, 77.0, 52.0],
                    cmyk=[0.0, 83.0, 76.0, 11.0],
                    name="Alizarin Crimson",
                    confidence=1.0,
                    tier="dominant"
                ),
                opacity=1.0,
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.22,
                notes="Classic crimson red"
            )
        }
        return colors
    
    def get_available_brands(self) -> List[str]:
        """Get list of all available paint brands"""
        return list(self.brands.keys())
    
    def get_brand_info(self, brand_name: str) -> Dict:
        """Get information about a specific brand"""
        brand_colors = self.get_brand_colors(brand_name)
        if not brand_colors:
            return {}
        
        total_colors = len(brand_colors)
        avg_cost = sum(p.cost_per_unit for p in brand_colors if p.cost_per_unit) / total_colors
        
        return {
            "name": brand_name,
            "total_colors": total_colors,
            "average_cost_per_ml": round(avg_cost, 2),
            "price_range": "Budget" if avg_cost < 0.08 else "Mid-range" if avg_cost < 0.15 else "Premium"
        }
