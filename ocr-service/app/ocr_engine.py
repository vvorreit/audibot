"""PaddleOCR wrapper — singleton lazy-loaded, CPU uniquement, paramètres optimisés santé."""

import threading
import numpy as np

_ocr_instance = None
_lock = threading.Lock()


def get_ocr():
    """Retourne l'instance PaddleOCR (créée au premier appel, thread-safe).

    Paramètres optimisés pour les documents de santé français :
    - det_db_thresh abaissé pour capter le texte fin des cartes mutuelle
    - det_limit_side_len augmenté pour les images haute résolution
    - rec_batch_num élevé pour traiter toutes les lignes en un seul batch
    """
    global _ocr_instance
    if _ocr_instance is None:
        with _lock:
            if _ocr_instance is None:
                from paddleocr import PaddleOCR
                _ocr_instance = PaddleOCR(
                    lang="fr",
                    use_angle_cls=True,
                    use_gpu=False,
                    show_log=False,
                    det_db_thresh=0.2,
                    det_db_box_thresh=0.4,
                    det_db_unclip_ratio=1.8,
                    det_limit_side_len=1920,
                    rec_batch_num=16,
                    cls_thresh=0.9,
                    drop_score=0.3,
                )
    return _ocr_instance


def recognize(image: np.ndarray) -> tuple[str, float]:
    """Exécute l'OCR avec reconstruction spatiale du texte.

    Les résultats PaddleOCR sont triés par position (Y puis X)
    pour reconstruire l'ordre de lecture naturel du document.
    Retourne (texte_extrait, confiance_moyenne 0-100).
    """
    ocr = get_ocr()
    results = ocr.ocr(image, cls=True)

    if not results or not results[0]:
        return "", 0.0

    entries = []
    for line_result in results[0]:
        box = line_result[0]
        text = line_result[1][0]
        confidence = line_result[1][1]

        y_center = (box[0][1] + box[2][1]) / 2
        x_left = box[0][0]
        box_height = abs(box[2][1] - box[0][1])

        entries.append({
            "text": text,
            "confidence": confidence,
            "y": y_center,
            "x": x_left,
            "h": box_height,
        })

    if not entries:
        return "", 0.0

    median_h = sorted(e["h"] for e in entries)[len(entries) // 2] if entries else 20
    line_threshold = median_h * 0.6

    entries.sort(key=lambda e: (e["y"], e["x"]))

    lines: list[list[dict]] = []
    current_line: list[dict] = [entries[0]]

    for entry in entries[1:]:
        if abs(entry["y"] - current_line[0]["y"]) < line_threshold:
            current_line.append(entry)
        else:
            lines.append(current_line)
            current_line = [entry]
    lines.append(current_line)

    text_lines = []
    confidences = []
    for line in lines:
        line.sort(key=lambda e: e["x"])
        line_text = "  ".join(e["text"] for e in line)
        text_lines.append(line_text)
        confidences.extend(e["confidence"] for e in line)

    full_text = "\n".join(text_lines)
    avg_confidence = (sum(confidences) / len(confidences) * 100) if confidences else 0.0

    return full_text, round(avg_confidence, 1)
