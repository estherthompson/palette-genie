from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import os
import numpy as np

# Import our custom modules
from services.color_analyzer import ColorAnalyzer
from services.paint_mixer import PaintMixer
from models.color_models import ColorAnalysisRequest, ColorAnalysisResponse, PaintMixResponse, UserPaint, Color, PaintColor
from services.image_processor import ImageProcessor

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Palette Genie AI Backend",
    description="AI-powered paint mixing calculator with TensorFlow color analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Your React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
color_analyzer = ColorAnalyzer()
paint_mixer = PaintMixer()
image_processor = ImageProcessor()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Palette Genie AI Backend is running! 🎨",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "color_analyzer": "ready",
            "paint_mixer": "ready",
            "image_processor": "ready"
        }
    }

@app.post("/api/analyze-colors", response_model=ColorAnalysisResponse)
async def analyze_colors(image: UploadFile = File(...)):
    """
    Analyze colors from uploaded image and return colors classified by tier
    """
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Process the image
        processed_image = await image_processor.process_image(image)
        
        # Analyze colors using AI and classify into tiers
        color_analysis = await color_analyzer.extract_dominant_colors(processed_image)
        
        # Combine all colors for paint mixing analysis
        all_colors = (
            color_analysis["dominant_colors"] + 
            color_analysis["secondary_colors"] + 
            color_analysis["tertiary_colors"]
        )
        
        # Generate paint mixing ratios for all colors
        paint_mixes = await paint_mixer.generate_mixing_ratios(all_colors)
        
        return ColorAnalysisResponse(
            success=True,
            message="Color analysis completed successfully",
            dominant_colors=color_analysis["dominant_colors"],
            secondary_colors=color_analysis["secondary_colors"],
            tertiary_colors=color_analysis["tertiary_colors"],
            paint_mixes=paint_mixes,
            image_info={
                "filename": image.filename,
                "size": image.size,
                "content_type": image.content_type
            },
            color_distribution=color_analysis["color_distribution"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing colors: {str(e)}")

@app.post("/api/generate-palette")
async def generate_harmonious_palette():
    """
    Generate a harmonious color palette using color theory
    """
    try:
        # Generate harmonious palette
        palette = await color_analyzer.generate_harmonious_palette()
        
        # Extract all colors from the palette
        all_colors = []
        if palette.primary_colors:
            all_colors.extend(palette.primary_colors)
        if palette.secondary_colors:
            all_colors.extend(palette.secondary_colors)
        if palette.accent_colors:
            all_colors.extend(palette.accent_colors)
        
        # Generate paint mixing ratios for the palette colors
        paint_mixes = await paint_mixer.generate_mixing_ratios(all_colors)
        
        return {
            "success": True,
            "palette": palette,
            "paint_mixes": paint_mixes
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating palette: {str(e)}")

@app.get("/api/color-theory/{color_name}")
async def get_color_theory(color_name: str):
    """
    Get color theory information for a specific color
    """
    try:
        # Generate theory information
        theory_info = await color_analyzer.get_color_theory(color_name)
        return {
            "success": True,
            "color": color_name,
            "theory": theory_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting color theory: {str(e)}")

@app.post("/api/user/paints")
async def add_user_paint(paint: UserPaint):
    """
    Add a paint to user's collection
    """
    try:
        # TODO: Implement database storage for user paints
        # For now, return success
        return {
            "success": True,
            "message": f"Paint {paint.name} added to collection",
            "paint": paint
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding paint: {str(e)}")

@app.get("/api/user/paints")
async def get_user_paints():
    """
    Get user's paint collection
    """
    try:
        # TODO: Implement database retrieval for user paints
        # For now, return sample data
        sample_paints = [
            UserPaint(
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
                quantity=100.0,
                unit="ml",
                cost_per_unit=0.05
            ),
            UserPaint(
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
                quantity=75.0,
                unit="ml",
                cost_per_unit=0.08
            )
        ]
        
        return {
            "success": True,
            "paints": sample_paints,
            "total_paints": len(sample_paints),
            "total_value": sum(p.cost_per_unit * p.quantity for p in sample_paints if p.cost_per_unit)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving paints: {str(e)}")

@app.post("/api/check-paint-availability")
async def check_paint_availability(request: dict):
    """
    Check if a target color can be mixed with user's available paints
    """
    try:
        target_color = Color(**request["target_color"])
        user_paints = [UserPaint(**paint) for paint in request["user_paints"]]
        
        # TODO: Implement paint availability checking logic
        # For now, return basic response
        return {
            "success": True,
            "target_color": target_color,
            "available_paints": user_paints[:2],  # Sample
            "missing_paints": ["Cadmium Red", "Titanium White"],
            "can_mix": False,
            "alternative_mixes": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking paint availability: {str(e)}")

@app.get("/api/paint-brands")
async def get_paint_brands():
    """
    Get list of all available paint brands
    """
    try:
        from services.paint_brands import PaintBrands
        paint_brands = PaintBrands()
        
        brands_info = []
        for brand_name in paint_brands.get_available_brands():
            brand_info = paint_brands.get_brand_info(brand_name)
            brands_info.append(brand_info)
        
        return {
            "success": True,
            "brands": brands_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving paint brands: {str(e)}")

@app.get("/api/paint-brands/{brand_name}/colors")
async def get_brand_colors(brand_name: str):
    """
    Get all available colors for a specific paint brand
    """
    try:
        from services.paint_brands import PaintBrands
        paint_brands = PaintBrands()
        
        colors = paint_brands.get_brand_colors(brand_name)
        if not colors:
            raise HTTPException(status_code=404, detail=f"Brand '{brand_name}' not found")
        
        return {
            "success": True,
            "brand": brand_name,
            "colors": colors,
            "total_colors": len(colors)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving brand colors: {str(e)}")

@app.post("/api/analyze-colors-with-brand")
async def analyze_colors_with_brand(
    image: UploadFile = File(...),
    brand_name: str = Form(...),
    algorithm: str = Form("brand_specific")
):
    """
    Analyze colors from uploaded image and return paint mixing ratios using specific brand
    """
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Process the image
        processed_image = await image_processor.process_image(image)
        
        # Analyze colors using AI and classify into tiers
        color_analysis = await color_analyzer.extract_dominant_colors(processed_image)
        
        # Combine all colors for paint mixing analysis
        all_colors = (
            color_analysis["dominant_colors"] + 
            color_analysis["secondary_colors"] + 
            color_analysis["tertiary_colors"]
        )
        
        # Generate paint mixing ratios using the specified brand
        paint_mixes = await paint_mixer.generate_mixing_ratios(
            all_colors, 
            algorithm=algorithm, 
            user_brand=brand_name
        )
        
        return ColorAnalysisResponse(
            success=True,
            message=f"Color analysis completed successfully using {brand_name} paints",
            dominant_colors=color_analysis["dominant_colors"],
            secondary_colors=color_analysis["secondary_colors"],
            tertiary_colors=color_analysis["tertiary_colors"],
            paint_mixes=paint_mixes,
            image_info={
                "filename": image.filename,
                "size": image.size,
                "content_type": image.content_type
            },
            color_distribution=color_analysis["color_distribution"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing colors: {str(e)}")

@app.post("/api/generate-palette-with-brand")
async def generate_palette_with_brand(brand_name: str = Form(...)):
    """
    Generate a harmonious color palette using color theory and specific brand paints
    """
    try:
        # Generate harmonious palette
        palette = await color_analyzer.generate_harmonious_palette()
        
        # Extract all colors from the palette
        all_colors = []
        if palette.primary_colors:
            all_colors.extend(palette.primary_colors)
        if palette.secondary_colors:
            all_colors.extend(palette.secondary_colors)
        if palette.accent_colors:
            all_colors.extend(palette.accent_colors)
        
        # Generate paint mixing ratios using the specified brand
        paint_mixes = await paint_mixer.generate_mixing_ratios(
            all_colors, 
            algorithm="brand_specific", 
            user_brand=brand_name
        )
        
        return {
            "success": True,
            "palette": palette,
            "paint_mixes": paint_mixes,
            "brand_used": brand_name
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating palette: {str(e)}")

@app.post("/api/mix-color-custom-volume")
async def mix_color_custom_volume(
    target_color: dict = Body(...),
    brand_name: str = Body(...),
    total_volume_ml: float = Body(5.0)
):
    """
    Generate paint mixing instructions for a specific color and volume
    """
    try:
        from services.paint_brands import PaintBrands
        paint_brands = PaintBrands()
        
        # Convert target color
        target_color_obj = Color(**target_color)
        
        # Get brand colors
        brand_colors = paint_brands.get_brand_colors(brand_name)
        if not brand_colors:
            raise HTTPException(status_code=404, detail=f"Brand '{brand_name}' not found")
        
        # Find closest colors from the brand
        target_rgb = np.array(target_color_obj.rgb)
        similarities = []
        
        for paint_color in brand_colors:
            paint_rgb = np.array(paint_color.color.rgb)
            distance = np.linalg.norm(target_rgb - paint_rgb)
            similarities.append((distance, paint_color))
        
        # Sort by similarity and take top 3
        similarities.sort(key=lambda x: x[0])
        closest_paints = similarities[:3]
        
        if not closest_paints:
            raise HTTPException(status_code=400, detail=f"No suitable colors found in {brand_name}")
        
        # Calculate mixing ratios based on inverse distance
        total_weight = sum(1 / (d[0] + 1e-6) for d in closest_paints)
        mixing_ratios = []
        base_colors = []
        
        for distance, paint_color in closest_paints:
            ratio = (1 / (distance + 1e-6)) / total_weight
            mixing_ratios.append(ratio)
            
            # Convert UserPaint to PaintColor for compatibility
            paint_color_converted = PaintColor(
                name=paint_color.name,
                brand=paint_color.brand,
                color=paint_color.color,
                opacity=paint_color.opacity
            )
            base_colors.append(paint_color_converted)
        
        # Generate custom volume instructions
        instructions = paint_mixer._generate_custom_volume_instructions(
            base_colors, mixing_ratios, total_volume_ml
        )
        
        # Calculate difficulty and cost
        difficulty = paint_mixer._calculate_difficulty(mixing_ratios)
        estimated_cost = paint_mixer._calculate_cost(base_colors, mixing_ratios)
        
        return {
            "success": True,
            "target_color": target_color_obj,
            "brand_used": brand_name,
            "total_volume_ml": total_volume_ml,
            "base_colors": base_colors,
            "mixing_ratios": mixing_ratios,
            "instructions": instructions,
            "difficulty": difficulty,
            "estimated_cost": estimated_cost,
            "uses_available_paints": True,
            "missing_paints": []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating custom volume mix: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 