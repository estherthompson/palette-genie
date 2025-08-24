import cv2
import numpy as np
from PIL import Image
import io
from fastapi import UploadFile, HTTPException
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Handles image processing and preprocessing for color analysis"""
    
    def __init__(self):
        self.supported_formats = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.max_dimensions = (4000, 4000)  # Max width/height
        
    async def process_image(self, image_file: UploadFile) -> np.ndarray:
        """
        Process uploaded image for color analysis
        
        Args:
            image_file: Uploaded image file
            
        Returns:
            Processed image as numpy array
        """
        try:
            # Validate file
            await self._validate_image(image_file)
            
            # Read image data
            image_data = await image_file.read()
            
            # Convert to PIL Image
            pil_image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Resize if too large
            pil_image = self._resize_image(pil_image)
            
            # Convert to numpy array
            image_array = np.array(pil_image)
            
            # Convert RGB to BGR for OpenCV
            image_bgr = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
            
            logger.info(f"Successfully processed image: {image_file.filename}")
            return image_bgr
            
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")
    
    async def _validate_image(self, image_file: UploadFile) -> None:
        """Validate uploaded image file"""
        # Check file size
        if image_file.size and image_file.size > self.max_file_size:
            raise HTTPException(
                status_code=400, 
                detail=f"File size {image_file.size} bytes exceeds maximum {self.max_file_size} bytes"
            )
        
        # Check content type
        if not image_file.content_type or not image_file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, 
                detail="File must be an image"
            )
        
        # Check file extension
        if image_file.filename:
            file_ext = image_file.filename.lower().split('.')[-1]
            if f'.{file_ext}' not in self.supported_formats:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file format. Supported: {', '.join(self.supported_formats)}"
                )
    
    def _resize_image(self, image: Image.Image) -> Image.Image:
        """Resize image if it's too large while maintaining aspect ratio"""
        width, height = image.size
        
        if width > self.max_dimensions[0] or height > self.max_dimensions[1]:
            # Calculate new dimensions maintaining aspect ratio
            ratio = min(self.max_dimensions[0] / width, self.max_dimensions[1] / height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            
            # Resize image
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            logger.info(f"Resized image from {width}x{height} to {new_width}x{new_height}")
        
        return image
    
    def preprocess_for_analysis(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess image for better color analysis
        
        Args:
            image: Input image as numpy array (BGR format)
            
        Returns:
            Preprocessed image
        """
        try:
            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Apply slight Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(image_rgb, (5, 5), 0)
            
            # Enhance contrast slightly
            lab = cv2.cvtColor(blurred, cv2.COLOR_RGB2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            enhanced = cv2.merge([l, a, b])
            enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
            
            return enhanced
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            return image  # Return original if preprocessing fails
    
    def extract_color_samples(self, image: np.ndarray, sample_size: int = 1000) -> np.ndarray:
        """
        Extract random color samples from image for analysis
        
        Args:
            image: Input image
            sample_size: Number of color samples to extract
            
        Returns:
            Array of color samples
        """
        try:
            # Reshape image to 2D array of pixels
            pixels = image.reshape(-1, 3)
            
            # Randomly sample pixels
            if len(pixels) > sample_size:
                indices = np.random.choice(len(pixels), sample_size, replace=False)
                samples = pixels[indices]
            else:
                samples = pixels
            
            return samples
            
        except Exception as e:
            logger.error(f"Error extracting color samples: {str(e)}")
            return image.reshape(-1, 3)  # Return all pixels if sampling fails
    
    def get_image_info(self, image: np.ndarray) -> dict:
        """Get basic information about the processed image"""
        height, width = image.shape[:2]
        channels = image.shape[2] if len(image.shape) > 2 else 1
        
        return {
            "dimensions": {"width": width, "height": height},
            "channels": channels,
            "total_pixels": width * height,
            "aspect_ratio": round(width / height, 2)
        } 