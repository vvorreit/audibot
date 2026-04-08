"""FastAPI — Service OCR PaddleOCR pour AudiBot.

Aucun fichier temporaire sur disque (RGPD).
Aucune connexion sortante (modèles pré-téléchargés au build Docker).
Purge mémoire explicite après chaque requête (minimisation des données).
Warm-up au démarrage pour que la première requête soit rapide.
"""

import gc
import time
import logging
from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from .preprocessing import preprocess
from .postprocessing import postprocess
from .ocr_engine import recognize, get_ocr

logger = logging.getLogger("audibot-ocr")

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 Mo


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm-up : charge le modèle PaddleOCR + une inférence à vide au démarrage."""
    logger.info("Warm-up : chargement du modèle PaddleOCR...")
    start = time.monotonic()
    ocr = get_ocr()
    dummy = np.ones((100, 300, 3), dtype=np.uint8) * 255
    ocr.ocr(dummy, cls=True)
    del dummy
    logger.info(f"Warm-up terminé en {time.monotonic() - start:.1f}s")
    yield


app = FastAPI(
    title="AudiBot OCR Service",
    version="2.0.0",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    return {"status": "ok", "engine": "PaddleOCR v4", "version": "2.0.0"}


@app.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...)):
    raw_bytes = None
    image = None
    text = None

    try:
        raw_bytes = await file.read()

        if len(raw_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=422, detail={
                "error": "Fichier trop volumineux (max 10 Mo)",
                "code": "FILE_TOO_LARGE",
            })

        if not file.content_type or not file.content_type.startswith("image/"):
            if file.content_type != "application/pdf":
                raise HTTPException(status_code=422, detail={
                    "error": f"Type de fichier non supporté : {file.content_type}",
                    "code": "INVALID_IMAGE",
                })

        start = time.monotonic()

        image, preprocess_meta = preprocess(raw_bytes)
        t_preprocess = time.monotonic() - start

        text, confidence = recognize(image)
        t_ocr = time.monotonic() - start - t_preprocess

        text = postprocess(text)
        t_post = time.monotonic() - start - t_preprocess - t_ocr

        processing_time_ms = round((time.monotonic() - start) * 1000)

        return JSONResponse(content={
            "text": text,
            "confidence": confidence,
            "pages": 1,
            "processing_time_ms": processing_time_ms,
            "preprocessing": preprocess_meta,
            "timing": {
                "preprocess_ms": round(t_preprocess * 1000),
                "ocr_ms": round(t_ocr * 1000),
                "postprocess_ms": round(t_post * 1000),
            },
        })

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail={
            "error": str(e),
            "code": "INVALID_IMAGE",
        })
    except Exception as e:
        logger.exception("OCR failed")
        raise HTTPException(status_code=500, detail={
            "error": f"Erreur OCR interne : {str(e)}",
            "code": "OCR_FAILED",
        })
    finally:
        del raw_bytes
        del image
        del text
        gc.collect()
