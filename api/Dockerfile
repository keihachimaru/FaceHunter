FROM python:3.12-slim

# InsightFace + ONNX Runtime CPU — no compilation needed
RUN pip install --no-cache-dir --upgrade pip

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python3 -c "from insightface.app import FaceAnalysis; FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider']).prepare(ctx_id=-1)" && \
    echo "Model pre-cached"

COPY . .

ENV FLASK_DEBUG=0
EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "60", "app:app"]
