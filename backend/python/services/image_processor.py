import cv2
import numpy as np
from typing import Union
import logging
from fastapi import UploadFile

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Handles image preprocessing for color analysis"""
    
    def __init__(self):
        self.max_image_size = (800, 800)  # Max dimensions for processing
        self.supported_formats = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
    
    async def process_image(self, image_file: UploadFile) -> np.ndarray:
        """
        Process uploaded image for color analysis
        
        Args:
            image_file: FastAPI UploadFile object
            
        Returns:
            Preprocessed image as numpy array
        """
        try:
            # Read image data
            image_data = await image_file.read()
            
            # Convert to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("Failed to decode image")
            
            # Resize if too large (for performance)
            height, width = image.shape[:2]
            if height > self.max_image_size[0] or width > self.max_image_size[1]:
                scale = min(self.max_image_size[0] / height, self.max_image_size[1] / width)
                new_width = int(width * scale)
                new_height = int(height * scale)
                image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
                logger.info(f"Resized image from {width}x{height} to {new_width}x{new_height}")
            
            # Apply slight Gaussian blur to reduce noise
            image = cv2.GaussianBlur(image, (3, 3), 0)
            
            # Enhance contrast slightly
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            lab = cv2.merge([l, a, b])
            image = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
            
            logger.info(f"Successfully processed image: {image_file.filename}")
            return image
            
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            raise Exception(f"Failed to process image: {str(e)}")
    
    def validate_image_format(self, filename: str) -> bool:
        """Check if image format is supported"""
        if not filename:
            return False
        
        extension = filename.lower().split('.')[-1]
        return f'.{extension}' in self.supported_formats
    
    def get_image_info(self, image: np.ndarray) -> dict:
        """Get basic information about the processed image"""
        height, width = image.shape[:2]
        channels = image.shape[2] if len(image.shape) > 2 else 1
        
        return {
            "dimensions": {"width": width, "height": height},
            "channels": channels,
            "dtype": str(image.dtype),
            "size_bytes": image.nbytes
        }
