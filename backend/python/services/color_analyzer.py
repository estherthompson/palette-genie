import cv2
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import pairwise_distances
import colorsys
from typing import List, Dict, Tuple, Optional
import logging
from models.color_models import Color, HarmoniousPalette, ColorTheoryInfo

logger = logging.getLogger(__name__)

class ColorAnalyzer:
    """AI-powered color analysis using TensorFlow and OpenCV"""
    
    def __init__(self):
        self.color_names = self._load_color_names()
        self.base_colors = self._get_base_colors()
        
    async def extract_dominant_colors(self, image: np.ndarray, num_colors: int = 15) -> Dict[str, List[Color]]:
        """
        Extract dominant colors from image using K-means clustering and classify into tiers
        
        Args:
            image: Preprocessed image as numpy array
            num_colors: Total number of colors to extract (15 = 5 dominant + 5 secondary + 5 tertiary)
            
        Returns:
            Dictionary with colors classified by tier
        """
        try:
            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Reshape image to 2D array of pixels
            pixels = image_rgb.reshape(-1, 3)
            
            # Use K-means to find dominant colors
            kmeans = KMeans(n_clusters=num_colors, random_state=42, n_init=10)
            kmeans.fit(pixels)
            
            # Get cluster centers (dominant colors)
            dominant_colors = kmeans.cluster_centers_.astype(int)
            
            # Get cluster sizes for confidence scoring
            cluster_sizes = np.bincount(kmeans.labels_)
            total_pixels = len(pixels)
            
            # Convert to Color objects with confidence scores
            colors = []
            for i, color_rgb in enumerate(dominant_colors):
                # Calculate confidence based on cluster size
                confidence = cluster_sizes[i] / total_pixels
                
                # Convert RGB to other formats
                hex_color = self._rgb_to_hex(color_rgb)
                hsl_color = self._rgb_to_hsl(color_rgb)
                cmyk_color = self._rgb_to_cmyk(color_rgb)
                
                # Find closest color name
                color_name = self._find_closest_color_name(color_rgb)
                
                color = Color(
                    rgb=color_rgb.tolist(),
                    hex=hex_color,
                    hsl=hsl_color,
                    cmyk=cmyk_color,
                    name=color_name,
                    confidence=float(confidence),
                    tier="dominant"  # Will be updated based on ranking
                )
                colors.append(color)
            
            # Sort by confidence (most dominant first)
            colors.sort(key=lambda x: x.confidence, reverse=True)
            
            # Classify colors into tiers
            dominant_colors = colors[:5]  # Top 5 most dominant
            secondary_colors = colors[5:10]  # Next 5
            tertiary_colors = colors[10:15]  # Remaining colors
            
            # Update tier labels
            for color in dominant_colors:
                color.tier = "dominant"
            for color in secondary_colors:
                color.tier = "secondary"
            for color in tertiary_colors:
                color.tier = "tertiary"
            
            logger.info(f"Successfully extracted {len(colors)} colors: {len(dominant_colors)} dominant, {len(secondary_colors)} secondary, {len(tertiary_colors)} tertiary")
            
            return {
                "dominant_colors": dominant_colors,
                "secondary_colors": secondary_colors,
                "tertiary_colors": tertiary_colors,
                "color_distribution": {
                    "dominant": len(dominant_colors),
                    "secondary": len(secondary_colors),
                    "tertiary": len(tertiary_colors)
                }
            }
            
        except Exception as e:
            logger.error(f"Error extracting dominant colors: {str(e)}")
            raise Exception(f"Failed to extract colors: {str(e)}")
    
    async def generate_harmonious_palette(self, base_color: Optional[Color] = None) -> HarmoniousPalette:
        """
        Generate a harmonious color palette using color theory
        
        Args:
            base_color: Optional base color to build palette around
            
        Returns:
            Harmonious color palette
        """
        try:
            if base_color is None:
                # Generate random base color
                base_color = self._generate_random_color()
            
            # Generate different color schemes
            complementary = self._get_complementary_color(base_color)
            analogous = self._get_analogous_colors(base_color)
            triadic = self._get_triadic_colors(base_color)
            split_complementary = self._get_split_complementary_colors(base_color)
            
            # Create palette
            palette = HarmoniousPalette(
                primary_colors=[base_color],
                secondary_colors=analogous[:2],
                accent_colors=[complementary] + triadic[:2],
                scheme_type="comprehensive",
                harmony_score=0.85
            )
            
            logger.info("Successfully generated harmonious palette")
            return palette
            
        except Exception as e:
            logger.error(f"Error generating harmonious palette: {str(e)}")
            raise Exception(f"Failed to generate palette: {str(e)}")
    
    async def get_color_theory(self, color_name: str) -> ColorTheoryInfo:
        """
        Get color theory information for a specific color
        
        Args:
            color_name: Name of the color
            
        Returns:
            Color theory information
        """
        try:
            # Find color by name
            color = self._find_color_by_name(color_name)
            if not color:
                raise Exception(f"Color '{color_name}' not found")
            
            # Generate theory information
            theory_info = ColorTheoryInfo(
                color_name=color_name,
                complementary=self._get_complementary_color(color),
                analogous=self._get_analogous_colors(color),
                triadic=self._get_triadic_colors(color),
                split_complementary=self._get_split_complementary_colors(color),
                psychological_meaning=self._get_psychological_meaning(color_name),
                cultural_significance=self._get_cultural_significance(color_name)
            )
            
            return theory_info
            
        except Exception as e:
            logger.error(f"Error getting color theory: {str(e)}")
            raise Exception(f"Failed to get color theory: {str(e)}")
    
    def _rgb_to_hex(self, rgb: np.ndarray) -> str:
        """Convert RGB values to hex color code"""
        return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
    
    def _rgb_to_hsl(self, rgb: np.ndarray) -> List[float]:
        """Convert RGB values to HSL"""
        r, g, b = rgb[0]/255, rgb[1]/255, rgb[2]/255
        h, l, s = colorsys.rgb_to_hls(r, g, b)
        return [round(h * 360, 2), round(s * 100, 2), round(l * 100, 2)]
    
    def _rgb_to_cmyk(self, rgb: np.ndarray) -> List[float]:
        """Convert RGB values to CMYK"""
        r, g, b = rgb[0]/255, rgb[1]/255, rgb[2]/255
        
        k = 1 - max(r, g, b)
        if k == 1:
            c = m = y = 0
        else:
            c = (1 - r - k) / (1 - k)
            m = (1 - g - k) / (1 - k)
            y = (1 - b - k) / (1 - k)
        
        return [round(c * 100, 2), round(m * 100, 2), round(y * 100, 2), round(k * 100, 2)]
    
    def _find_closest_color_name(self, rgb: np.ndarray) -> str:
        """Find the closest named color to the given RGB values"""
        min_distance = float('inf')
        closest_name = "Unknown"
        
        for name, color_rgb in self.color_names.items():
            distance = np.linalg.norm(rgb - color_rgb)
            if distance < min_distance:
                min_distance = distance
                closest_name = name
        
        return closest_name
    
    def _get_complementary_color(self, color: Color) -> Color:
        """Get complementary color (opposite on color wheel)"""
        # Convert RGB to HSL
        h, s, l = color.hsl
        
        # Add 180 degrees to hue
        complementary_h = (h + 180) % 360
        
        # Convert back to RGB
        complementary_rgb = self._hsl_to_rgb([complementary_h, s, l])
        
        return Color(
            rgb=complementary_rgb,
            hex=self._rgb_to_hex(np.array(complementary_rgb)),
            hsl=[complementary_h, s, l],
            cmyk=self._rgb_to_cmyk(np.array(complementary_rgb)),
            name=f"Complementary to {color.name or 'Unknown'}",
            confidence=0.9,
            tier="tertiary"
        )
    
    def _get_analogous_colors(self, color: Color, num_colors: int = 3) -> List[Color]:
        """Get analogous colors (adjacent on color wheel)"""
        h, s, l = color.hsl
        analogous_colors = []
        
        for i in range(num_colors):
            # Add/subtract 30 degrees for each analogous color
            offset = (i - 1) * 30
            new_h = (h + offset) % 360
            
            new_rgb = self._hsl_to_rgb([new_h, s, l])
            analogous_colors.append(Color(
                rgb=new_rgb,
                hex=self._rgb_to_hex(np.array(new_rgb)),
                hsl=[new_h, s, l],
                cmyk=self._rgb_to_cmyk(np.array(new_rgb)),
                name=f"Analogous {i+1} to {color.name or 'Unknown'}",
                confidence=0.8,
                tier="secondary"
            ))
        
        return analogous_colors
    
    def _get_triadic_colors(self, color: Color) -> List[Color]:
        """Get triadic colors (120 degrees apart on color wheel)"""
        h, s, l = color.hsl
        triadic_colors = []
        
        for i in range(2):
            new_h = (h + (i + 1) * 120) % 360
            new_rgb = self._hsl_to_rgb([new_h, s, l])
            triadic_colors.append(Color(
                rgb=new_rgb,
                hex=self._rgb_to_hex(np.array(new_rgb)),
                hsl=[new_h, s, l],
                cmyk=self._rgb_to_cmyk(np.array(new_rgb)),
                name=f"Triadic {i+1} to {color.name or 'Unknown'}",
                confidence=0.8,
                tier="tertiary"
            ))
        
        return triadic_colors
    
    def _get_split_complementary_colors(self, color: Color) -> List[Color]:
        """Get split complementary colors (30 degrees from complementary)"""
        h, s, l = color.hsl
        complementary_h = (h + 180) % 360
        
        split_colors = []
        for offset in [-30, 30]:
            new_h = (complementary_h + offset) % 360
            new_rgb = self._hsl_to_rgb([new_h, s, l])
            split_colors.append(Color(
                rgb=new_rgb,
                hex=self._rgb_to_hex(np.array(new_rgb)),
                hsl=[new_h, s, l],
                cmyk=self._rgb_to_cmyk(np.array(new_rgb)),
                name=f"Split complementary {offset:+d}° to {color.name or 'Unknown'}",
                confidence=0.7,
                tier="tertiary"
            ))
        
        return split_colors
    
    def _hsl_to_rgb(self, hsl: List[float]) -> List[int]:
        """Convert HSL values to RGB"""
        h, s, l = hsl[0]/360, hsl[1]/100, hsl[2]/100
        r, g, b = colorsys.hls_to_rgb(h, l, s)
        return [int(r * 255), int(g * 255), int(b * 255)]
    
    def _generate_random_color(self) -> Color:
        """Generate a random color"""
        import random
        r = random.randint(0, 255)
        g = random.randint(0, 255)
        b = random.randint(0, 255)
        
        rgb = [r, g, b]
        return Color(
            rgb=rgb,
            hex=self._rgb_to_hex(np.array(rgb)),
            hsl=self._rgb_to_hsl(np.array(rgb)),
            cmyk=self._rgb_to_cmyk(np.array(rgb)),
            name="Random",
            confidence=1.0,
            tier="dominant"
        )
    
    def _load_color_names(self) -> Dict[str, np.ndarray]:
        """Load a dictionary of color names and their RGB values"""
        return {
            "Red": np.array([255, 0, 0]),
            "Green": np.array([0, 255, 0]),
            "Blue": np.array([0, 0, 255]),
            "Yellow": np.array([255, 255, 0]),
            "Cyan": np.array([0, 255, 255]),
            "Magenta": np.array([255, 0, 255]),
            "White": np.array([255, 255, 255]),
            "Black": np.array([0, 0, 0]),
            "Gray": np.array([128, 128, 128]),
            "Orange": np.array([255, 165, 0]),
            "Purple": np.array([128, 0, 128]),
            "Pink": np.array([255, 192, 203]),
            "Brown": np.array([165, 42, 42]),
            "Teal": np.array([0, 128, 128]),
            "Navy": np.array([0, 0, 128]),
            "Lime": np.array([0, 255, 0]),
            "Maroon": np.array([128, 0, 0]),
            "Olive": np.array([128, 128, 0])
        }
    
    def _get_base_colors(self) -> Dict[str, np.ndarray]:
        """Get common paint base colors"""
        return {
            "Titanium White": np.array([255, 255, 255]),
            "Ivory Black": np.array([0, 0, 0]),
            "Cadmium Red": np.array([227, 0, 34]),
            "Cadmium Yellow": np.array([255, 246, 0]),
            "Ultramarine Blue": np.array([18, 10, 143]),
            "Phthalo Green": np.array([0, 100, 0]),
            "Burnt Sienna": np.array([138, 51, 36]),
            "Raw Umber": np.array([130, 102, 68])
        }
    
    def _find_color_by_name(self, color_name: str) -> Optional[Color]:
        """Find a color by name"""
        if color_name in self.color_names:
            rgb = self.color_names[color_name]
            return Color(
                rgb=rgb.tolist(),
                hex=self._rgb_to_hex(rgb),
                hsl=self._rgb_to_hsl(rgb),
                cmyk=self._rgb_to_cmyk(rgb),
                name=color_name,
                confidence=1.0,
                tier="dominant"
            )
        return None
    
    def _get_psychological_meaning(self, color_name: str) -> Optional[str]:
        """Get psychological meaning of a color"""
        meanings = {
            "Red": "Energy, passion, excitement, danger",
            "Blue": "Calm, trust, stability, sadness",
            "Green": "Nature, growth, harmony, envy",
            "Yellow": "Happiness, optimism, creativity, caution",
            "Purple": "Royalty, luxury, mystery, spirituality",
            "Orange": "Enthusiasm, adventure, confidence, warmth",
            "Pink": "Love, romance, gentleness, femininity",
            "Black": "Power, elegance, mystery, death",
            "White": "Purity, cleanliness, innocence, peace"
        }
        return meanings.get(color_name)
    
    def _get_cultural_significance(self, color_name: str) -> Optional[str]:
        """Get cultural significance of a color"""
        significance = {
            "Red": "China: good fortune, India: purity, Western: love/danger",
            "Blue": "Western: trust/stability, Middle East: safety/protection",
            "Green": "Ireland: national pride, Islamic: paradise, Western: nature",
            "Yellow": "China: royalty, Japan: courage, Western: happiness",
            "Purple": "Ancient Rome: power, Thailand: mourning, Western: luxury",
            "White": "Western: purity, Eastern: death/mourning, India: peace"
        }
        return significance.get(color_name) 