from time import process_time
try:
    from PIL import Image
except ImportError:
    pass
    # import Image
import pytesseract

def ocr_core(file):
    """
    This function will handle the core OCR processing of images.
    """
    start = process_time()
    text = pytesseract.image_to_string(Image.open(file))
    print("image_to_string in {time:.3f}s".format(time = process_time()-start))
    print("boxes "+pytesseract.image_to_boxes(Image.open(file)))
    print("image_to_boxes in {time:.3f}s".format(time = process_time()-start))
    return text

# print(ocr_core('images/ocr_example_1.png'))
