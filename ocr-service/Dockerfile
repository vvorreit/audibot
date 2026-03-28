FROM python:3.12-slim

WORKDIR /app

# Dépendances système pour OpenCV et PaddlePaddle
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Pré-télécharger les modèles PaddleOCR au build (aucune connexion réseau au runtime)
RUN python -c "from paddleocr import PaddleOCR; PaddleOCR(lang='fr', use_angle_cls=True, use_gpu=False, show_log=False)"

COPY app/ ./app/

ENV PORT=8000

# Utilisateur non-root avec home directory pour les modèles PaddleOCR
RUN adduser --system --uid 1001 --home /home/ocruser ocruser
RUN cp -r /root/.paddleocr /home/ocruser/.paddleocr && chown -R ocruser /home/ocruser/.paddleocr
USER ocruser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
