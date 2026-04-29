import os
import time
import json
from functools import wraps
from concurrent.futures import ThreadPoolExecutor, as_completed

from flask import Flask, jsonify, request
import numpy as np

from face import FaceEngine
from storage import ImageLoader

app = Flask(__name__)

API_KEY = os.environ.get("FACEHUNTER_API_KEY")
if not API_KEY:
    raise RuntimeError("FACEHUNTER_API_KEY environment variable is required")

face_engine = FaceEngine()
loader = ImageLoader()
executor = ThreadPoolExecutor(max_workers=10)


def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        key = request.headers.get("X-API-Key")
        if not key or key != API_KEY:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated


def _download_and_encode(face: dict):
    img = loader.from_url(face["url"])
    if img is None:
        return None
    enc = face_engine.get_encoding(img)
    if enc is not None:
        return (enc, face["playerId"])
    return None


@app.route("/")
def home():
    return "<html><body><h1>Hello world!</h1></body></html>\n"


@app.route("/check-face", methods=["POST"])
@require_api_key
def check_face():
    start = time.time()
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    img = loader.from_flask_file(request.files["file"])
    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    faces = face_engine.detect(img)
    duration = time.time() - start
    print(f"Face {'found' if faces else 'not found'} in {duration:.3f}s")
    return jsonify({"valid": len(faces) > 0})


@app.route("/identify-face", methods=["POST"])
@require_api_key
def identify_face():
    start = time.time()

    img = None
    if "file" in request.files:
        img = loader.from_flask_file(request.files["file"])
    elif "image_url" in request.form:
        img = loader.from_url(request.form["image_url"])

    if img is None:
        return jsonify({"error": "No image provided (upload file or send image_url)"}), 400

    faces_json = request.form.get("faces")
    if not faces_json:
        return jsonify({"error": "Missing faces data"}), 400
    faces = json.loads(faces_json)

    known_encodings = []
    known_names = []

    futures = {executor.submit(_download_and_encode, face): face for face in faces}
    for future in as_completed(futures):
        result = future.result()
        if result:
            enc, pid = result
            known_encodings.append(enc)
            known_names.append(pid)

    if not known_encodings:
        return jsonify({"targetId": None}), 200

    unknown_enc = face_engine.get_encoding(img)
    if unknown_enc is None:
        return jsonify({"targetId": None}), 200

    target = face_engine.identify(unknown_enc, known_encodings, known_names)
    print(f"identify-face took {time.time() - start:.3f}s")
    return jsonify({"targetId": target}), 200


@app.route("/benchmark", methods=["POST"])
@require_api_key
def benchmark():
    results = {}
    for filename in request.files:
        img = loader.from_flask_file(request.files[filename])
        if img is None:
            results[filename] = {"error": "invalid image"}
            continue
        t0 = time.time()
        faces = face_engine.detect(img)
        detect_ms = (time.time() - t0) * 1000
        if not faces:
            results[filename] = {"detect_ms": detect_ms, "face_found": False}
            continue
        t0 = time.time()
        enc = face_engine.get_encoding(img)
        encode_ms = (time.time() - t0) * 1000
        results[filename] = {
            "detect_ms": round(detect_ms, 1),
            "encode_ms": round(encode_ms, 1),
            "face_found": True,
        }
    return jsonify(results), 200


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug, host="0.0.0.0", port=5000)
