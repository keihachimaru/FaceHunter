from flask import Flask, jsonify, request
import face_recognition
import os
import time
from pymongo import MongoClient
from io import BytesIO
from PIL import Image
import numpy as np
import json
import requests

app = Flask(__name__)
client = MongoClient("mongodb://localhost:27017")

db = client['facehunterDB']

@app.route('/')
def home():
    return "<html><body><h1>Hello world!</h1></body></html>\n"

@app.route('/check-face', methods=['POST'])
def check_face():
    print("Checking face")
    start = time.time()
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    image = Image.open(BytesIO(file.read()))
    image_np = np.array(image)

    face_locations = face_recognition.face_locations(image_np)
    duration = str(time.time() - start)
    print('Face'+(' not 'if len(face_locations)==0 else ' ')+'found in '+str(duration)+' seconds')
    if len(face_locations) > 0:
        return jsonify({"valid": True})
    return jsonify({"valid": False})
    
@app.route('/identify-face', methods=['POST'])
def identify_face():
    start = time.time()

    file = request.files["file"]
    image = np.array(Image.open(file.stream).convert("RGB"))

    faces_json = request.form.get('faces')
    faces = json.loads(faces_json)

    face_encodings = []
    face_names = []
    for face in faces:
        resp = requests.get(face['url'])
        img = np.array(Image.open(BytesIO(resp.content)).convert("RGB"))
        locs = face_recognition.face_locations(img, model="hog")
        encs = face_recognition.face_encodings(img, locs)
        if encs:
            face_encodings.append(encs[0])
            face_names.append(face['playerId'])

    unknown_locs = face_recognition.face_locations(image, model="hog")
    unknown_encs = face_recognition.face_encodings(image, unknown_locs)
    if not unknown_encs:
        return jsonify({"targetId": None}), 200

    result = next(
        (face_names[i] for i, match in enumerate(
            face_recognition.compare_faces(face_encodings, unknown_encs[0])
        ) if match),
        None
    )

    print(f"{time.time() - start:.3f} seconds")
    return jsonify({'targetId': result}), 200
    
if __name__ == '__main__':
    app.run(debug=True)
