"""Unit tests for FaceEngine — all insightface calls are mocked."""

import numpy as np
import pytest
from unittest.mock import patch, MagicMock

from face import FaceEngine


@pytest.fixture
def engine():
    return FaceEngine(threshold=0.4)


class FakeFace:
    """Mimics insightface's Face object."""

    def __init__(self, embedding=None):
        self.normed_embedding = embedding if embedding is not None else np.ones(512, dtype=np.float32) * 0.1


class TestDetect:
    def test_empty_image_returns_empty_list(self, engine):
        assert engine.detect(np.array([], dtype=np.uint8)) == []

    def test_detect_calls_model_get(self, engine):
        fake = FakeFace()
        with patch.object(engine.model, "get", return_value=[fake]):
            result = engine.detect(np.zeros((100, 100, 3), dtype=np.uint8))
        assert result == [fake]

    def test_detect_no_faces(self, engine):
        with patch.object(engine.model, "get", return_value=[]):
            result = engine.detect(np.zeros((100, 100, 3), dtype=np.uint8))
        assert result == []


class TestGetEncoding:
    def test_no_faces_returns_none(self, engine):
        with patch.object(engine.model, "get", return_value=[]):
            assert engine.get_encoding(np.zeros((100, 100, 3), dtype=np.uint8)) is None

    def test_returns_normed_embedding(self, engine):
        emb = np.array([0.5] * 512, dtype=np.float32)
        fake = FakeFace(embedding=emb)
        with patch.object(engine.model, "get", return_value=[fake]):
            result = engine.get_encoding(np.zeros((100, 100, 3), dtype=np.uint8))
        assert result is not None
        assert np.array_equal(result, emb)


class TestCompare:
    def test_empty_known_returns_empty(self, engine):
        assert engine.compare([], np.zeros(512)) == []

    def test_none_unknown_returns_empty(self, engine):
        assert engine.compare([np.zeros(512)], None) == []

    @pytest.mark.parametrize("similarity,threshold,expected", [
        (1.0, 0.4, [True]),
        (0.0, 0.4, [False]),
        (0.4, 0.4, [True]),   # exactly at threshold → match
    ])
    def test_threshold(self, engine, similarity, threshold, expected):
        engine.threshold = threshold
        known = [np.ones(512, dtype=np.float32)]
        unknown = np.ones(512, dtype=np.float32) * similarity
        # dot(known, unknown) = 512 * similarity ≈ 512 * similarity
        # normalize by 512 to get actual similarity
        unknown_scaled = unknown / np.linalg.norm(unknown)
        known_norm = [k / np.linalg.norm(k) for k in known]
        result = engine.compare(known_norm, unknown_scaled)
        assert result == expected


class TestIdentify:
    def test_match_returns_name(self, engine):
        known = [np.ones(512, dtype=np.float32)]
        names = ["kei"]
        unknown = np.ones(512, dtype=np.float32)
        known_norm = [k / np.linalg.norm(k) for k in known]
        unknown_norm = unknown / np.linalg.norm(unknown)
        assert engine.identify(unknown_norm, known_norm, names) == "kei"

    def test_no_match_returns_none(self, engine):
        engine.threshold = 0.99
        known = [np.zeros(512, dtype=np.float32)]
        names = ["kei"]
        unknown = np.ones(512, dtype=np.float32)
        known_norm = [k / np.linalg.norm(k) if np.linalg.norm(k) > 0 else k for k in known]
        unknown_norm = unknown / np.linalg.norm(unknown)
        assert engine.identify(unknown_norm, known_norm, names) is None

    def test_empty_known_returns_none(self, engine):
        assert engine.identify(np.ones(512), [], []) is None
