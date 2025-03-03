from PIL import Image
import numpy as np
from typing import Tuple, Optional
import logging

class ImagePaddingRemover:
    """
    A high-performance utility for removing padding from images using advanced
    edge detection and content analysis algorithms.
    """
    
    def __init__(self, threshold: float = 0.99, min_content_ratio: float = 0.1):
        """
        Initialize the padding remover with configurable parameters.
        
        Args:
            threshold: Similarity threshold for identifying padding (0.0-1.0)
            min_content_ratio: Minimum ratio of content to preserve
        """
        self.threshold = threshold
        self.min_content_ratio = min_content_ratio
        self._configure_logging()

    def _configure_logging(self) -> None:
        """Configure logging for debugging and performance monitoring."""
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def _compute_edge_boundaries(self, img_array: np.ndarray) -> Tuple[int, int, int, int]:
        """
        Compute content boundaries using advanced edge detection.
        
        Args:
            img_array: numpy array representation of image
            
        Returns:
            Tuple of (top, bottom, left, right) content boundaries
        """
        if len(img_array.shape) == 3:
            # Convert to grayscale for more efficient processing
            gray_array = np.mean(img_array, axis=2)
        else:
            gray_array = img_array

        # Compute row and column variations for edge detection
        row_vars = np.var(gray_array, axis=1)
        col_vars = np.var(gray_array, axis=0)

        # Identify content boundaries using statistical analysis
        row_threshold = np.max(row_vars) * (1 - self.threshold)
        col_threshold = np.max(col_vars) * (1 - self.threshold)

        top = np.argmax(row_vars > row_threshold)
        bottom = len(row_vars) - np.argmax(row_vars[::-1] > row_threshold)
        left = np.argmax(col_vars > col_threshold)
        right = len(col_vars) - np.argmax(col_vars[::-1] > col_threshold)

        return top, bottom, left, right

    def remove_padding(self, image_path: str, output_path: Optional[str] = None) -> Image.Image:
        """
        Remove padding from an image while preserving essential content.
        
        Args:
            image_path: Path to input image
            output_path: Optional path to save processed image
            
        Returns:
            Processed PIL Image object
        """
        self.logger.info(f"Processing image: {image_path}")
        
        # Load and convert image to numpy array for efficient processing
        img = Image.open(image_path)
        img_array = np.array(img)

        # Compute content boundaries
        top, bottom, left, right = self._compute_edge_boundaries(img_array)
        
        # Validate content boundaries
        height, width = img_array.shape[:2]
        content_height = bottom - top
        content_width = right - left
        
        if (content_height / height < self.min_content_ratio or 
            content_width / width < self.min_content_ratio):
            self.logger.warning("Content boundaries may be too aggressive, adjusting...")
            # Apply content preservation logic
            margin = int(min(height, width) * 0.05)  # 5% margin
            top = max(0, top - margin)
            bottom = min(height, bottom + margin)
            left = max(0, left - margin)
            right = min(width, right + margin)

        # Crop image to content boundaries
        cropped_img = img.crop((left, top, right, bottom))
        
        if output_path:
            cropped_img.save(output_path)
            self.logger.info(f"Saved processed image to: {output_path}")
            
        return cropped_img

    def process_batch(self, image_paths: list, output_dir: str) -> None:
        """
        Process multiple images in batch mode for optimal performance.
        
        Args:
            image_paths: List of input image paths
            output_dir: Directory for processed images
        """
        for idx, path in enumerate(image_paths):
            output_path = f"{output_dir}/processed_{idx}.png"
            self.remove_padding(path, output_path)

# Example usage
if __name__ == "__main__":
    # Initialize the processor with custom parameters
    processor = ImagePaddingRemover(threshold=0.98, min_content_ratio=0.15)

    # Process a single image
    processed_img = processor.remove_padding("input.png", "output.png")

    # Process multiple images
    processor.process_batch(["img1.png", "img2.png"], "output_directory")
