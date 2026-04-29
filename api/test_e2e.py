"""
End-to-end tests using real images from assets/.

Naming convention:
  - filename contains 'k'       -> Kei is in the image
  - filename contains 't' (excluding leading 'T' of "Test") -> Tai is in the image
  - testkt*.jpg                  -> both Kei and Tai present
  - testpm1.jpg                  -> ignored

Starts a temporary HTTP server to serve reference images
(since /identify-face fetches them via URL).
"""

import os
import json
import time
import threading
import http.server
import socketserver

import pytest

os.environ["FACEHUNTER_API_KEY"] = "e2e-test-key"

from app import app
from storage import ImageLoader
from face import FaceEngine

ASSETS = os.path.join(os.path.dirname(__file__), "assets")
REFERENCE_PORT = 9876

IMAGE_EXPECTED = {
    "kei.jpg":     {"persons": ["kei"], "identify": "kei"},
    "tai.jpg":     {"persons": ["tai"], "identify": "tai"},
    "testk1.jpg":  {"persons": ["kei"], "identify": "kei"},
    "testk2.jpg":  {"persons": ["kei"], "identify": "kei"},
    "testk3.jpg":  {"persons": ["kei"], "identify": "kei"},
    "testkt1.jpg": {"persons": ["kei", "tai"], "identify": None},
    "testkt2.jpg": {"persons": ["kei", "tai"], "identify": None},
    "testkt3.jpg": {"persons": ["kei", "tai"], "identify": None},
    "testt1.jpg":  {"persons": ["tai"], "identify": "tai"},
    "testt2.jpg":  {"persons": ["tai"], "identify": "tai"},
}


@pytest.fixture(scope="session")
def reference_server():
    handler = http.server.SimpleHTTPRequestHandler

    class SilentHandler(handler):
        def log_message(self, format, *args):
            pass

    old_cwd = os.getcwd()
    os.chdir(ASSETS)
    httpd = socketserver.TCPServer(("", REFERENCE_PORT), SilentHandler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.2)
    yield f"http://localhost:{REFERENCE_PORT}"
    httpd.shutdown()
    os.chdir(old_cwd)


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


@pytest.fixture
def auth():
    return {"X-API-Key": "e2e-test-key"}


REFERENCE_URLS = json.dumps([
    {"url": f"http://localhost:{REFERENCE_PORT}/kei.jpg", "playerId": "kei"},
    {"url": f"http://localhost:{REFERENCE_PORT}/tai.jpg", "playerId": "tai"},
])


# ---------- check-face ----------


class TestCheckFaceE2E:
    @pytest.mark.parametrize("filename", sorted(IMAGE_EXPECTED))
    def test_face_detected(self, client, auth, filename):
        path = os.path.join(ASSETS, filename)
        if not os.path.exists(path):
            pytest.skip(f"{filename} not found")
        with open(path, "rb") as f:
            resp = client.post(
                "/check-face", headers=auth,
                data={"file": (f, filename)},
            )
        assert resp.status_code == 200, resp.get_json()
        assert resp.get_json()["valid"] is True, f"{filename} should contain a face"


# ---------- identify-face ----------


class TestIdentifyFaceE2E:
    @pytest.mark.parametrize("filename", sorted(IMAGE_EXPECTED))
    def test_identify(self, client, auth, reference_server, filename):
        expected = IMAGE_EXPECTED[filename]
        path = os.path.join(ASSETS, filename)
        if not os.path.exists(path):
            pytest.skip(f"{filename} not found")

        with open(path, "rb") as f:
            resp = client.post(
                "/identify-face", headers=auth,
                data={"file": (f, filename), "faces": REFERENCE_URLS},
            )
        assert resp.status_code == 200, resp.get_json()
        target = resp.get_json()["targetId"]

        if expected["identify"] is not None:
            assert target == expected["identify"], (
                f"{filename}: expected {expected['identify']}, got {target}"
            )
        else:
            assert target in ("kei", "tai"), (
                f"{filename}: expected 'kei' or 'tai', got {target}"
            )

    @pytest.mark.parametrize("filename", sorted(IMAGE_EXPECTED))
    def test_identify_via_image_url(self, client, auth, reference_server, filename):
        expected = IMAGE_EXPECTED[filename]
        path = os.path.join(ASSETS, filename)
        if not os.path.exists(path):
            pytest.skip(f"{filename} not found")

        resp = client.post(
            "/identify-face", headers=auth,
            data={"image_url": f"http://localhost:{REFERENCE_PORT}/{filename}",
                  "faces": REFERENCE_URLS},
        )
        assert resp.status_code == 200, resp.get_json()
        target = resp.get_json()["targetId"]

        if expected["identify"] is not None:
            assert target == expected["identify"], (
                f"{filename} (via URL): expected {expected['identify']}, got {target}"
            )
        else:
            assert target in ("kei", "tai"), (
                f"{filename} (via URL): expected 'kei' or 'tai', got {target}"
            )


# ---------- benchmark ----------


class TestBenchmark:
    """Speed test — run locally to compare performance."""

    @pytest.mark.parametrize("filename", sorted(IMAGE_EXPECTED))
    def test_local_speed(self, engine: FaceEngine, filename):
        engine = FaceEngine()  # real model
        path = os.path.join(ASSETS, filename)
        if not os.path.exists(path):
            pytest.skip(f"{filename} not found")

        img = ImageLoader.from_path(path)
        t0 = time.time()
        faces = engine.detect(img)
        detect_ms = (time.time() - t0) * 1000
        assert len(faces) > 0, f"{filename}: no face detected"

        t0 = time.time()
        enc = engine.get_encoding(img)
        encode_ms = (time.time() - t0) * 1000
        assert enc is not None

        print(f"\n  {filename:15s} detect={detect_ms:6.1f}ms  encode={encode_ms:6.1f}ms")

    def test_benchmark_endpoint(self, client, auth):
        files = {}
        for fname in sorted(IMAGE_EXPECTED):
            path = os.path.join(ASSETS, fname)
            if os.path.exists(path):
                files[fname] = (open(path, "rb"), fname)

        if not files:
            pytest.skip("No test images found")

        resp = client.post("/benchmark", headers=auth, data=files)
        assert resp.status_code == 200
        data = resp.get_json()
        print(f"\nBenchmark results:")
        for name, stats in data.items():
            if "error" in stats:
                print(f"  {name:15s} ERROR: {stats['error']}")
            elif not stats["face_found"]:
                print(f"  {name:15s} detect={stats['detect_ms']:>6.1f}ms  NO FACE")
            else:
                print(f"  {name:15s} detect={stats['detect_ms']:>6.1f}ms  encode={stats['encode_ms']:>6.1f}ms")

        for f in files.values():
            f[0].close()
