import sys
import types

# 1. Mock tensorflow_hub completely to bypass the estimator compatibility crash
mock_hub = types.ModuleType('tensorflow_hub')
sys.modules['tensorflow_hub'] = mock_hub

# 2. Monkeypatch NumPy to fix legacy tensorflowjs compatibility with newer NumPy
import numpy as np
np.object = object
np.bool = bool

# Now import the tensorflowjs converter entrypoint safely
from tensorflowjs.converters.converter import main

if __name__ == '__main__':
    # Pass the standard CLI args to the converter entrypoint
    sys.argv = [
        'tensorflowjs_converter',
        '--input_format=keras',
        'crop_disease_model.h5',
        './model_custom'
    ]
    print("Starting Keras model conversion to TFJS format...")
    main(["--input_format=keras crop_disease_model.h5 ./model_custom"])
    print("Conversion complete!")
