import os
import numpy as np
from typing import Optional

# Lazy import so the module can be imported without insightface installed
_face_analysis = None


def _get_model(model_name: str = "buffalo_l", providers: Optional[list] = None):
    global _face_analysis
    if _face_analysis is None:
        from insightface.app import FaceAnalysis
        _face_analysis = FaceAnalysis(
            name=model_name,
            providers=providers or ["CPUExecutionProvider"],
        )
        _face_analysis.prepare(ctx_id=-1)
        model_dir = _face_analysis.model_dir
        if model_dir:
            print(f"InsightFace model loaded from {model_dir}")
    return _face_analysis


class FaceEngine:
    def __init__(self, model_name: str = "buffalo_l", threshold: float = 0.4):
        self.model_name = model_name
        self.threshold = threshold
        self._model = None

    @property
    def model(self):
        if self._model is None:
            self._model = _get_model(self.model_name)
        return self._model

    def detect(self, image: np.ndarray) -> list:
        if image is None or image.size == 0:
            return []
        return self.model.get(image)

    def get_encoding(self, image: np.ndarray) -> Optional[np.ndarray]:
        faces = self.detect(image)
        if not faces:
            return None
        return faces[0].normed_embedding

    def compare(self, known_encodings: list[np.ndarray], unknown_encoding: np.ndarray) -> list[bool]:
        if not known_encodings or unknown_encoding is None:
            return []
        return [
            float(np.dot(known, unknown_encoding)) >= self.threshold
            for known in known_encodings
        ]

    def identify(self, unknown_encoding: np.ndarray, known_encodings: list[np.ndarray], known_names: list[str]) -> Optional[str]:
        matches = self.compare(known_encodings, unknown_encoding)
        for i, match in enumerate(matches):
            if match:
                return known_names[i]
        return None
