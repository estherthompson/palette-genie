from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum

class ColorFormat(str, Enum):
    RGB = "rgb"
    HEX = "hex"
    HSL = "hsl"
    CMYK = "cmyk"

class ColorTier(str, Enum):
    DOMINANT = "dominant"
    SECONDARY = "secondary"
    TERTIARY = "tertiary"

class Color(BaseModel):
    """Represents a single color with multiple formats"""
    rgb: List[int] = Field(..., description="RGB values [r, g, b]")
    hex: str = Field(..., description="Hex color code")
    hsl: List[float] = Field(..., description="HSL values [h, s, l]")
    cmyk: List[float] = Field(..., description="CMYK values [c, m, y, k]")
    name: Optional[str] = Field(None, description="Human-readable color name")
    confidence: float = Field(..., description="AI confidence score (0-1)")
    tier: ColorTier = Field(..., description="Color importance tier")

class PaintColor(BaseModel):
    """Represents a paint color with mixing information"""
    name: str = Field(..., description="Paint color name")
    brand: Optional[str] = Field(None, description="Paint brand")
    color: Color = Field(..., description="Color information")
    opacity: float = Field(1.0, description="Paint opacity (0-1)")

class UserPaint(BaseModel):
    """Represents a paint in user's collection"""
    id: Optional[str] = Field(None, description="Unique identifier")
    name: str = Field(..., description="Paint color name")
    brand: str = Field(..., description="Paint brand (e.g., Northhaven)")
    color: Color = Field(..., description="Color information")
    opacity: float = Field(1.0, description="Paint opacity (0-1)")
    quantity: float = Field(..., description="Available quantity (ml or oz)")
    unit: str = Field("ml", description="Unit of measurement")
    cost_per_unit: Optional[float] = Field(None, description="Cost per unit")
    notes: Optional[str] = Field(None, description="Additional notes")

class PaintMix(BaseModel):
    """Represents a paint mixing recipe"""
    target_color: Color = Field(..., description="The color we want to achieve")
    base_colors: List[PaintColor] = Field(..., description="Base paint colors needed")
    mixing_ratios: List[float] = Field(..., description="Mixing ratios for each base color")
    instructions: str = Field(..., description="Step-by-step mixing instructions")
    difficulty: str = Field(..., description="Difficulty level: easy, medium, hard")
    estimated_cost: Optional[float] = Field(None, description="Estimated cost in dollars")
    uses_available_paints: bool = Field(False, description="Whether the mix uses paints from user's collection")
    missing_paints: List[str] = Field(default_factory=list, description="Paints not in user's collection")

class ColorAnalysisRequest(BaseModel):
    """Request model for color analysis"""
    image_format: Optional[str] = Field("auto", description="Preferred image format")
    color_count: Optional[int] = Field(15, description="Total number of colors to extract (5 dominant, 5 secondary, 5 tertiary)")
    include_paint_mixes: bool = Field(True, description="Whether to include paint mixing ratios")
    user_paints: Optional[List[UserPaint]] = Field(None, description="User's available paint collection")

class ColorAnalysisResponse(BaseModel):
    """Response model for color analysis"""
    success: bool = Field(..., description="Whether the analysis was successful")
    message: str = Field(..., description="Response message")
    dominant_colors: List[Color] = Field(..., description="Extracted dominant colors (top 5)")
    secondary_colors: List[Color] = Field(..., description="Secondary colors (next 5)")
    tertiary_colors: List[Color] = Field(..., description="Tertiary colors (remaining)")
    paint_mixes: List[PaintMix] = Field(..., description="Paint mixing recipes")
    image_info: Dict[str, Any] = Field(..., description="Image metadata")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")
    color_distribution: Dict[str, int] = Field(..., description="Distribution of colors by tier")

class PaintMixResponse(BaseModel):
    """Response model for paint mixing"""
    success: bool = Field(..., description="Whether the mixing was successful")
    message: str = Field(..., description="Response message")
    paint_mix: PaintMix = Field(..., description="Paint mixing recipe")
    alternatives: Optional[List[PaintMix]] = Field(None, description="Alternative mixing options")

class HarmoniousPalette(BaseModel):
    """Represents a harmonious color palette"""
    primary_colors: List[Color] = Field(..., description="Primary colors in the palette")
    secondary_colors: List[Color] = Field(..., description="Secondary colors")
    accent_colors: List[Color] = Field(..., description="Accent colors")
    scheme_type: str = Field(..., description="Type of color scheme: complementary, triadic, etc.")
    harmony_score: float = Field(..., description="Harmony score (0-1)")

class ColorTheoryInfo(BaseModel):
    """Information about color theory for a specific color"""
    color_name: str = Field(..., description="Name of the color")
    complementary: Optional[Color] = Field(None, description="Complementary color")
    analogous: List[Color] = Field(..., description="Analogous colors")
    triadic: List[Color] = Field(..., description="Triadic colors")
    split_complementary: List[Color] = Field(..., description="Split complementary colors")
    psychological_meaning: Optional[str] = Field(None, description="Psychological meaning of the color")
    cultural_significance: Optional[str] = Field(None, description="Cultural significance")

class UserPaintCollection(BaseModel):
    """User's paint collection"""
    user_id: str = Field(..., description="User identifier")
    paints: List[UserPaint] = Field(default_factory=list, description="Collection of paints")
    total_paints: int = Field(0, description="Total number of paints")
    total_value: Optional[float] = Field(None, description="Total estimated value of collection")
    last_updated: Optional[str] = Field(None, description="Last update timestamp")

class PaintAvailabilityCheck(BaseModel):
    """Check paint availability against user's collection"""
    target_color: Color = Field(..., description="Color to check")
    available_paints: List[UserPaint] = Field(..., description="Paints that could be used")
    missing_paints: List[str] = Field(..., description="Paints not in collection")
    can_mix: bool = Field(..., description="Whether the color can be mixed with available paints")
    alternative_mixes: List[PaintMix] = Field(default_factory=list, description="Alternative mixing options") 