import io
import numpy as np
from PIL import Image
from typing import Optional


class ImageLoader:
    @staticmethod
    def from_bytes(data: bytes) -> Optional[np.ndarray]:
        try:
            return np.array(Image.open(io.BytesIO(data)).convert("RGB"))
        except Exception as e:
            print(f"Failed to decode image from bytes: {e}")
            return None

    @staticmethod
    def from_path(path: str) -> Optional[np.ndarray]:
        try:
            return np.array(Image.open(path).convert("RGB"))
        except Exception as e:
            print(f"Failed to load image from {path}: {e}")
            return None

    @staticmethod
    def from_url(url: str, timeout: int = 10) -> Optional[np.ndarray]:
        import requests
        try:
            resp = requests.get(url, timeout=timeout)
            resp.raise_for_status()
            return ImageLoader.from_bytes(resp.content)
        except Exception as e:
            print(f"Failed to fetch image from {url}: {e}")
            return None

    @staticmethod
    def from_flask_file(file_storage) -> Optional[np.ndarray]:
        return ImageLoader.from_bytes(file_storage.read())
