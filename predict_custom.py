import sys
import json
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' # Suppress TF log warnings

try:
    import numpy as np
    from PIL import Image
    import tensorflow as tf
except ImportError as e:
    print(json.dumps({"status": "error", "error": f"Missing python package: {str(e)}"}))
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "error": "No image path provided."}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    model_path = 'crop_disease_model.h5'
    
    if not os.path.exists(model_path):
        print(json.dumps({"status": "error", "error": f"Model file {model_path} not found."}))
        sys.exit(1)
        
    if not os.path.exists(image_path):
        print(json.dumps({"status": "error", "error": f"Image file {image_path} not found."}))
        sys.exit(1)
        
    try:
        # Load model using keras
        model = tf.keras.models.load_model(model_path, compile=False)
        
        # Load and preprocess image
        img = Image.open(image_path).convert('RGB')
        img = img.resize((128, 128))
        img_array = np.array(img, dtype=np.float32)
        
        # Normalize to [-1.0, 1.0]
        img_array = (img_array - 127.5) / 127.5
        img_array = np.expand_dims(img_array, axis=0)
        
        # Run prediction
        predictions = model.predict(img_array, verbose=0)
        
        print(json.dumps({
            "status": "success", 
            "predictions": predictions[0].tolist()
        }))
    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
