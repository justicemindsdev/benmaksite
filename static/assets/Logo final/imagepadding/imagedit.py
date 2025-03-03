from PIL import Image
import numpy as np
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImageProcessor:
    def __init__(self):
        self.base_path = '/Users/infiniteintelligence/Indian Genius/benmak/31 leveldisplay/FInal website/assets/Logo final'
        
    def remove_padding(self, input_path, output_filename=None):
        """
        Removes padding from an image and saves the result
        """
        try:
            logger.info(f"Processing image: {input_path}")
            
            # Check if input file exists
            if not os.path.exists(input_path):
                raise FileNotFoundError(f"Input file not found: {input_path}")
            
            # Open and process image
            img = Image.open(input_path)
            
            # Convert image to RGBA if it isn't already
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Convert image to numpy array
            img_data = np.array(img)
            
            # Create mask for non-transparent pixels
            mask = img_data[:,:,3] > 0
            
            if mask.any():
                # Find content boundaries
                rows = np.any(mask, axis=1)
                cols = np.any(mask, axis=0)
                ymin, ymax = np.where(rows)[0][[0, -1]]
                xmin, xmax = np.where(cols)[0][[0, -1]]
                
                # Crop image
                cropped = img.crop((xmin, ymin, xmax + 1, ymax + 1))
            else:
                cropped = img
            
            # Generate output filename if not provided
            if output_filename is None:
                base_name = os.path.basename(input_path)
                output_filename = f"processed_{base_name}"
            
            # Construct output path
            output_path = os.path.join(self.base_path, output_filename)
            
            # Save processed image
            cropped.save(output_path, 'PNG', optimize=True)
            logger.info(f"Saved processed image to: {output_path}")
            
            return cropped
            
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            raise

def main():
    # List of image files to process
    image_files = [
        'download.png',
        'Logo_of_United_Kingdom_Department_of_Health_and_Social_Care.svg.png',
        'UK-Parliament-Logo-1536x864.png',
        'png-clipart-brand-logo-university-of-the-arts-london-product-design-telford-college-of-arts-and-technology-text-london-thumbnail.png',
        'OBE-GOLD-Effect-logo.png',
        'Untitled (Sticker (76x37mm)).png',
        'nspsc.png',
        'lliverpool collehe .png',
        'justice .png',
        '1.png',
        '11.png',
        '12.png',
        '13.png',
        '14.png',
        'city westminster.png',
        'house commons.png',
        'lpool city counil .png'
    ]
    
    try:
        # Initialize processor
        processor = ImageProcessor()
        
        # Process each image
        for filename in image_files:
            input_path = os.path.join(processor.base_path, filename)
            if os.path.exists(input_path):
                processor.remove_padding(input_path, f"processed_{filename}")
                logger.info(f"Successfully processed {filename}")
            else:
                logger.warning(f"File not found: {filename}")
                
    except Exception as e:
        logger.error(f"Main execution error: {str(e)}")

if __name__ == "__main__":
    main()