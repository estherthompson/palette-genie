import numpy as np
from typing import List, Dict, Tuple, Optional
import logging
from models.color_models import Color, PaintColor, PaintMix, UserPaint
from services.paint_brands import PaintBrands
import colorsys

logger = logging.getLogger(__name__)

class PaintMixer:
    """Calculates paint mixing ratios to achieve target colors using brand-specific paints"""
    
    def __init__(self):
        self.paint_brands = PaintBrands()
        self.mixing_algorithms = {
            "k_nearest": self._k_nearest_mix,
            "linear_combination": self._linear_combination_mix,
            "optimization": self._optimization_mix,
            "brand_specific": self._brand_specific_mix
        }
    
    async def generate_mixing_ratios(self, target_colors: List[Color], algorithm: str = "brand_specific", user_brand: Optional[str] = None) -> List[PaintMix]:
        """
        Generate paint mixing ratios for target colors
        
        Args:
            target_colors: List of colors to achieve
            algorithm: Mixing algorithm to use
            user_brand: User's preferred paint brand (optional)
            
        Returns:
            List of paint mixing recipes
        """
        try:
            paint_mixes = []
            
            for target_color in target_colors:
                if algorithm == "brand_specific" and user_brand:
                    mix = await self._brand_specific_mix(target_color, user_brand)
                elif algorithm in self.mixing_algorithms:
                    mix = await self.mixing_algorithms[algorithm](target_color)
                else:
                    # Default to brand-specific if available, otherwise k-nearest
                    if user_brand:
                        mix = await self._brand_specific_mix(target_color, user_brand)
                    else:
                        mix = await self._k_nearest_mix(target_color)
                
                paint_mixes.append(mix)
            
            logger.info(f"Successfully generated {len(paint_mixes)} paint mixing recipes")
            return paint_mixes
            
        except Exception as e:
            logger.error(f"Error generating paint mixing ratios: {str(e)}")
            raise Exception(f"Failed to generate mixing ratios: {str(e)}")
    
    async def _brand_specific_mix(self, target_color: Color, brand_name: str) -> PaintMix:
        """
        Generate paint mix using only colors available from the specified brand
        """
        try:
            # Get available colors from the brand
            brand_colors = self.paint_brands.get_brand_colors(brand_name)
            if not brand_colors:
                logger.warning(f"No colors found for brand: {brand_name}, falling back to generic")
                return await self._k_nearest_mix(target_color)
            
            target_rgb = np.array(target_color.rgb)
            
            # Find the closest colors from the brand
            similarities = []
            for paint_color in brand_colors:
                paint_rgb = np.array(paint_color.color.rgb)
                distance = np.linalg.norm(target_rgb - paint_rgb)
                similarities.append((distance, paint_color))
            
            # Sort by similarity and take top 3
            similarities.sort(key=lambda x: x[0])
            closest_paints = similarities[:3]
            
            if not closest_paints:
                raise Exception(f"No suitable colors found in {brand_name}")
            
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
            
            # Generate mixing instructions
            instructions = self._generate_mixing_instructions(base_colors, mixing_ratios)
            
            # Calculate difficulty and cost
            difficulty = self._calculate_difficulty(mixing_ratios)
            estimated_cost = self._calculate_cost(base_colors, mixing_ratios)
            
            # Check if we can achieve the target color with available paints
            can_achieve = self._can_achieve_target(target_color, base_colors, mixing_ratios)
            
            return PaintMix(
                target_color=target_color,
                base_colors=base_colors,
                mixing_ratios=mixing_ratios,
                instructions=instructions,
                difficulty=difficulty,
                estimated_cost=estimated_cost,
                uses_available_paints=True,
                missing_paints=[] if can_achieve else ["Additional colors may be needed"]
            )
            
        except Exception as e:
            logger.error(f"Error in brand-specific mix: {str(e)}")
            raise Exception(f"Failed to calculate brand-specific mix: {str(e)}")
    
    async def _k_nearest_mix(self, target_color: Color) -> PaintMix:
        """
        Use k-nearest neighbors approach to find best paint combination
        """
        try:
            target_rgb = np.array(target_color.rgb)
            
            # Use generic base paints for fallback
            base_paints = self._load_base_paints()
            
            # Find the 3 closest base paints
            distances = []
            for paint_name, paint_data in base_paints.items():
                paint_rgb = paint_data["rgb"]
                distance = np.linalg.norm(target_rgb - paint_rgb)
                distances.append((distance, paint_name, paint_data))
            
            # Sort by distance and take top 3
            distances.sort(key=lambda x: x[0])
            closest_paints = distances[:3]
            
            # Calculate mixing ratios based on inverse distance
            total_weight = sum(1 / (d[0] + 1e-6) for d in closest_paints)
            mixing_ratios = []
            base_colors = []
            
            for distance, paint_name, paint_data in closest_paints:
                ratio = (1 / (distance + 1e-6)) / total_weight
                mixing_ratios.append(ratio)
                
                paint_color = PaintColor(
                    name=paint_name,
                    brand=paint_data.get("brand", "Generic"),
                    color=Color(
                        rgb=paint_data["rgb"].tolist(),
                        hex=paint_data["hex"],
                        hsl=paint_data["hsl"],
                        cmyk=paint_data["cmyk"],
                        name=paint_name,
                        confidence=1.0,
                        tier="dominant"
                    ),
                    opacity=paint_data.get("opacity", 1.0)
                )
                base_colors.append(paint_color)
            
            # Generate mixing instructions
            instructions = self._generate_mixing_instructions(base_colors, mixing_ratios)
            
            # Calculate difficulty and cost
            difficulty = self._calculate_difficulty(mixing_ratios)
            estimated_cost = self._calculate_cost(base_colors, mixing_ratios)
            
            return PaintMix(
                target_color=target_color,
                base_colors=base_colors,
                mixing_ratios=mixing_ratios,
                instructions=instructions,
                difficulty=difficulty,
                estimated_cost=estimated_cost,
                uses_available_paints=False,
                missing_paints=[]
            )
            
        except Exception as e:
            logger.error(f"Error in k-nearest mix: {str(e)}")
            raise Exception(f"Failed to calculate k-nearest mix: {str(e)}")
    
    def _can_achieve_target(self, target_color: Color, base_colors: List[PaintColor], ratios: List[float]) -> bool:
        """Check if the target color can be reasonably achieved with the given base colors"""
        if not base_colors or not ratios:
            return False
        
        # Calculate the mixed color
        mixed_rgb = np.zeros(3)
        for paint_color, ratio in zip(base_colors, ratios):
            paint_rgb = np.array(paint_color.color.rgb)
            mixed_rgb += paint_rgb * ratio
        
        # Calculate distance to target
        target_rgb = np.array(target_color.rgb)
        distance = np.linalg.norm(mixed_rgb - target_rgb)
        
        # Consider it achievable if distance is less than 50 (reasonable tolerance)
        return distance < 50
    
    async def _linear_combination_mix(self, target_color: Color) -> PaintMix:
        """
        Use linear combination approach for more precise mixing
        """
        try:
            target_rgb = np.array(target_color.rgb)
            
            # Use generic base paints for this method
            base_paints = self._load_base_paints()
            
            # Create matrix of base paint RGB values
            paint_matrix = []
            paint_names = []
            paint_data_list = []
            
            for paint_name, paint_data in base_paints.items():
                paint_matrix.append(paint_data["rgb"])
                paint_names.append(paint_name)
                paint_data_list.append(paint_data)
            
            paint_matrix = np.array(paint_matrix)
            
            # Solve linear system: paint_matrix * ratios = target_rgb
            try:
                # Use least squares to find best ratios
                ratios, residuals, rank, s = np.linalg.lstsq(paint_matrix, target_rgb, rcond=None)
                
                # Ensure ratios are positive and normalize
                ratios = np.maximum(ratios, 0)
                if np.sum(ratios) > 0:
                    ratios = ratios / np.sum(ratios)
                
                # Take top 3 paints with highest ratios
                top_indices = np.argsort(ratios)[-3:][::-1]
                
                mixing_ratios = []
                base_colors = []
                
                for idx in top_indices:
                    if ratios[idx] > 0.01:  # Only include significant ratios
                        mixing_ratios.append(float(ratios[idx]))
                        
                        paint_name = paint_names[idx]
                        paint_data = paint_data_list[idx]
                        
                        paint_color = PaintColor(
                            name=paint_name,
                            brand=paint_data.get("brand", "Generic"),
                            color=Color(
                                rgb=paint_data["rgb"].tolist(),
                                hex=paint_data["hex"],
                                hsl=paint_data["hsl"],
                                cmyk=paint_data["cmyk"],
                                name=paint_name,
                                confidence=1.0,
                                tier="dominant"
                            ),
                            opacity=paint_data.get("opacity", 1.0)
                        )
                        base_colors.append(paint_color)
                
                # Normalize ratios
                if mixing_ratios:
                    total = sum(mixing_ratios)
                    mixing_ratios = [r / total for r in mixing_ratios]
                
                instructions = self._generate_mixing_instructions(base_colors, mixing_ratios)
                difficulty = self._calculate_difficulty(mixing_ratios)
                estimated_cost = self._calculate_cost(base_colors, mixing_ratios)
                
                return PaintMix(
                    target_color=target_color,
                    base_colors=base_colors,
                    mixing_ratios=mixing_ratios,
                    instructions=instructions,
                    difficulty=difficulty,
                    estimated_cost=estimated_cost,
                    uses_available_paints=False,
                    missing_paints=[]
                )
                
            except np.linalg.LinAlgError:
                # Fallback to k-nearest if linear algebra fails
                return await self._k_nearest_mix(target_color)
                
        except Exception as e:
            logger.error(f"Error in linear combination mix: {str(e)}")
            raise Exception(f"Failed to calculate linear combination mix: {str(e)}")
    
    async def _optimization_mix(self, target_color: Color) -> PaintMix:
        """
        Use optimization approach for best possible mixing
        """
        try:
            target_rgb = np.array(target_color.rgb)
            base_paints = self._load_base_paints()
            
            # Try different combinations of 2-4 paints
            best_mix = None
            best_distance = float('inf')
            
            paint_names = list(base_paints.keys())
            
            # Try combinations of 2-4 paints
            for num_paints in range(2, min(5, len(paint_names) + 1)):
                from itertools import combinations
                
                for paint_combo in combinations(paint_names, num_paints):
                    try:
                        # Create matrix for this combination
                        paint_matrix = np.array([base_paints[name]["rgb"] for name in paint_combo])
                        
                        # Solve for ratios
                        ratios, residuals, rank, s = np.linalg.lstsq(paint_matrix, target_rgb, rcond=None)
                        
                        # Ensure positive ratios and normalize
                        ratios = np.maximum(ratios, 0)
                        if np.sum(ratios) > 0:
                            ratios = ratios / np.sum(ratios)
                            
                            # Calculate resulting color
                            result_color = np.sum(paint_matrix * ratios[:, np.newaxis], axis=0)
                            distance = np.linalg.norm(result_color - target_rgb)
                            
                            if distance < best_distance:
                                best_distance = distance
                                best_mix = (paint_combo, ratios)
                                
                    except np.linalg.LinAlgError:
                        continue
            
            if best_mix:
                selected_paints, ratios = best_mix
                
                # Create PaintColor objects
                base_colors = []
                for paint_name, ratio in zip(selected_paints, ratios):
                    paint_data = base_paints[paint_name]
                    paint_color = PaintColor(
                        name=paint_name,
                        brand=paint_data.get("brand", "Generic"),
                        color=Color(
                            rgb=paint_data["rgb"].tolist(),
                            hex=paint_data["hex"],
                            hsl=paint_data["hsl"],
                            cmyk=paint_data["cmyk"],
                            name=paint_name,
                            confidence=1.0,
                            tier="dominant"
                        ),
                        opacity=paint_data.get("opacity", 1.0)
                    )
                    base_colors.append(paint_color)
                
                instructions = self._generate_mixing_instructions(base_colors, ratios.tolist())
                difficulty = self._calculate_difficulty(ratios.tolist())
                estimated_cost = self._calculate_cost(base_colors, ratios.tolist())
                
                return PaintMix(
                    target_color=target_color,
                    base_colors=base_colors,
                    mixing_ratios=ratios.tolist(),
                    instructions=instructions,
                    difficulty=difficulty,
                    estimated_cost=estimated_cost,
                    uses_available_paints=False,
                    missing_paints=[]
                )
            else:
                # Fallback to k-nearest
                return await self._k_nearest_mix(target_color)
                
        except Exception as e:
            logger.error(f"Error in optimization mix: {str(e)}")
            raise Exception(f"Failed to calculate optimization mix: {str(e)}")
    
    def _generate_custom_volume_instructions(self, base_colors: List[PaintColor], ratios: List[float], total_volume_ml: float = 5.0) -> str:
        """Generate mixing instructions for a specific total volume"""
        instructions = []
        
        # Calculate total parts for ratio conversion
        total_parts = sum(ratios)
        
        # Calculate drop counts (20 drops per ml)
        drops_per_ml = 20
        
        drop_instructions = []
        volume_instructions = []
        ratio_instructions = []
        
        for i, (paint_color, ratio) in enumerate(base_colors):
            # Calculate parts for ratio
            parts = ratio / total_parts
            ratio_instructions.append(f"{parts:.1f} parts {paint_color.name}")
            
            # Calculate volume for specified total
            volume_ml = parts * total_volume_ml
            volume_instructions.append(f"{volume_ml:.1f}ml {paint_color.name}")
            
            # Calculate drops
            drops = int(volume_ml * drops_per_ml)
            drop_instructions.append(f"{drops} drops {paint_color.name}")
        
        # Build instructions
        instructions.append(f"🎨 **Mixing Instructions for {total_volume_ml}ml Total:**")
        instructions.append("")
        
        # Drop-based instructions
        instructions.append("💧 **By Drops (20 drops = 1ml):**")
        for i, instruction in enumerate(drop_instructions):
            if i == 0:
                instructions.append(f"• Start with {instruction}")
            else:
                instructions.append(f"• Add {instruction}")
        
        instructions.append("")
        
        # Volume-based instructions
        instructions.append("📏 **By Volume:**")
        for i, instruction in enumerate(volume_instructions):
            if i == 0:
                instructions.append(f"• Start with {instruction}")
            else:
                instructions.append(f"• Add {instruction}")
        
        instructions.append("")
        
        # Simple ratio instructions
        instructions.append("⚖️ **Simple Ratio:**")
        instructions.append(f"• Mix in ratio: {' : '.join(ratio_instructions)}")
        
        return "\n".join(instructions)

    def _generate_mixing_instructions(self, base_colors: List[PaintColor], ratios: List[float]) -> str:
        """Generate human-readable mixing instructions with practical measurements"""
        instructions = []
        
        # Calculate total parts for ratio conversion
        total_parts = sum(ratios)
        
        # Convert to practical measurements
        # Option 1: Drop-based (assuming 20 drops = 1ml)
        # Option 2: Volume-based (ml)
        # Option 3: Simple ratios
        
        # Calculate drop counts (20 drops per ml)
        drops_per_ml = 20
        total_ml = 5  # Assume we're making 5ml total
        
        drop_instructions = []
        volume_instructions = []
        ratio_instructions = []
        
        for i, (paint_color, ratio) in enumerate(zip(base_colors, ratios)):
            # Calculate parts for ratio
            parts = ratio / total_parts
            ratio_instructions.append(f"{parts:.1f} parts {paint_color.name}")
            
            # Calculate volume
            volume_ml = parts * total_ml
            volume_instructions.append(f"{volume_ml:.1f}ml {paint_color.name}")
            
            # Calculate drops
            drops = int(volume_ml * drops_per_ml)
            drop_instructions.append(f"{drops} drops {paint_color.name}")
        
        # Build comprehensive instructions
        instructions.append("🎨 **Mixing Instructions:**")
        instructions.append("")
        
        # Drop-based instructions (most practical)
        instructions.append("💧 **By Drops (20 drops = 1ml):**")
        for i, instruction in enumerate(drop_instructions):
            if i == 0:
                instructions.append(f"• Start with {instruction}")
            else:
                instructions.append(f"• Add {instruction}")
        
        instructions.append("")
        
        # Volume-based instructions
        instructions.append("📏 **By Volume:**")
        for i, instruction in enumerate(volume_instructions):
            if i == 0:
                instructions.append(f"• Start with {instruction}")
            else:
                instructions.append(f"• Add {instruction}")
        
        instructions.append("")
        
        # Simple ratio instructions
        instructions.append("⚖️ **Simple Ratio:**")
        instructions.append(f"• Mix in ratio: {' : '.join(ratio_instructions)}")
        
        instructions.append("")
        instructions.append("🔧 **Tips:**")
        instructions.append("• Mix thoroughly until uniform color is achieved")
        instructions.append("• Test on a small area first to ensure desired result")
        instructions.append("• Adjust ratios slightly if needed for your specific project")
        instructions.append("• Keep track of your successful mixes for future reference")
        instructions.append("")
        instructions.append("💡 **Custom Volume:** Want to mix a different amount?")
        instructions.append("• For 10ml: Double all measurements above")
        instructions.append("• For 2.5ml: Halve all measurements above")
        instructions.append("• For 1ml: Divide all measurements by 5")
        
        return "\n".join(instructions)
    
    def _calculate_difficulty(self, ratios: List[float]) -> str:
        """Calculate difficulty level based on mixing ratios"""
        if len(ratios) <= 2:
            return "easy"
        elif len(ratios) <= 3:
            return "medium"
        else:
            return "hard"
    
    def _calculate_cost(self, base_colors: List[PaintColor], ratios: List[float]) -> float:
        """Calculate estimated cost of paint mix"""
        # This is a simplified cost calculation
        # In production, you'd have actual paint prices
        base_cost_per_ml = 0.05  # $0.05 per ml
        total_cost = 0
        
        for paint_color, ratio in zip(base_colors, ratios):
            # Assume we're making 100ml total
            paint_volume = ratio * 100  # ml
            paint_cost = paint_volume * base_cost_per_ml
            total_cost += paint_cost
        
        return round(total_cost, 2)
    
    def _load_base_paints(self) -> Dict[str, Dict]:
        """Load base paint colors with their properties"""
        return {
            "Titanium White": {
                "rgb": np.array([255, 255, 255]),
                "hex": "#FFFFFF",
                "hsl": [0, 0, 100],
                "cmyk": [0, 0, 0, 0],
                "brand": "Generic",
                "opacity": 1.0
            },
            "Ivory Black": {
                "rgb": np.array([0, 0, 0]),
                "hex": "#000000",
                "hsl": [0, 0, 0],
                "cmyk": [0, 0, 0, 100],
                "brand": "Generic",
                "opacity": 1.0
            },
            "Cadmium Red": {
                "rgb": np.array([227, 0, 34]),
                "hex": "#E30022",
                "hsl": [350, 100, 44],
                "cmyk": [0, 100, 85, 11],
                "brand": "Generic",
                "opacity": 1.0
            },
            "Cadmium Yellow": {
                "rgb": np.array([255, 246, 0]),
                "hex": "#FFF600",
                "hsl": [58, 100, 50],
                "cmyk": [0, 4, 100, 0],
                "brand": "Generic",
                "opacity": 1.0
            },
            "Ultramarine Blue": {
                "rgb": np.array([18, 10, 143]),
                "hex": "#120A8F",
                "hsl": [244, 87, 30],
                "cmyk": [87, 93, 0, 44],
                "brand": "Generic",
                "opacity": 1.0
            },
            "Phthalo Green": {
                "rgb": np.array([0, 100, 0]),
                "hex": "#006400",
                "hsl": [120, 100, 20],
                "cmyk": [100, 0, 100, 61],
                "brand": "Generic",
                "opacity": 1.0
            },
            "Burnt Sienna": {
                "rgb": np.array([138, 51, 36]),
                "hex": "#8A3324",
                "hsl": [9, 59, 34],
                "cmyk": [0, 63, 74, 46],
                "brand": "Generic",
                "opacity": 1.0
            },
            "Raw Umber": {
                "rgb": np.array([130, 102, 68]),
                "hex": "#826644",
                "hsl": [34, 31, 39],
                "cmyk": [0, 22, 48, 49],
                "brand": "Generic",
                "opacity": 1.0
            },
            "Cobalt Blue": {
                "rgb": np.array([0, 71, 171]),
                "hex": "#0047AB",
                "hsl": [215, 100, 34],
                "cmyk": [100, 58, 0, 33],
                "brand": "Generic",
                "opacity": 1.0
            },
            "Viridian Green": {
                "rgb": np.array([64, 130, 109]),
                "hex": "#40826D",
                "hsl": [161, 34, 38],
                "cmyk": [51, 0, 16, 49],
                "brand": "Generic",
                "opacity": 1.0
            }
        } 