"""Pré-traitement d'image pour l'OCR santé — pipeline optimisé qualité.

Toutes les opérations sont en mémoire (numpy arrays), aucun fichier temporaire.
Pipeline : décodage → détourage auto → upscale → débruitage → CLAHE → deskew → binarisation conditionnelle.
"""

import cv2
import numpy as np


def decode_image(raw_bytes: bytes) -> np.ndarray:
    """Décode des bytes bruts (JPEG/PNG) en image BGR numpy."""
    arr = np.frombuffer(raw_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Impossible de décoder l'image (format non supporté ou fichier corrompu)")
    return img


def auto_crop(image: np.ndarray) -> np.ndarray:
    """Détecte et recadre le document (carte/ordonnance) dans l'image.

    Cherche le plus grand contour rectangulaire pour éliminer le fond
    (bureau, main, etc.). Garde l'image originale si aucun contour net.
    """
    h, w = image.shape[:2]
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 50, 150)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    edged = cv2.dilate(edged, kernel, iterations=2)

    contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return image

    contours = sorted(contours, key=cv2.contourArea, reverse=True)

    for cnt in contours[:5]:
        area = cv2.contourArea(cnt)
        if area < (h * w * 0.15):
            continue

        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

        if len(approx) == 4:
            pts = approx.reshape(4, 2).astype(np.float32)
            rect = _order_points(pts)
            warped = _four_point_transform(image, rect)
            if warped.shape[0] > 100 and warped.shape[1] > 100:
                return warped

        x, y, rw, rh = cv2.boundingRect(cnt)
        aspect = rw / rh if rh > 0 else 0
        if 0.4 < aspect < 3.0 and area > (h * w * 0.25):
            margin = 5
            x1 = max(0, x - margin)
            y1 = max(0, y - margin)
            x2 = min(w, x + rw + margin)
            y2 = min(h, y + rh + margin)
            return image[y1:y2, x1:x2]

    return image


def _order_points(pts: np.ndarray) -> np.ndarray:
    """Ordonne 4 points : top-left, top-right, bottom-right, bottom-left."""
    rect = np.zeros((4, 2), dtype=np.float32)
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    d = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(d)]
    rect[3] = pts[np.argmax(d)]
    return rect


def _four_point_transform(image: np.ndarray, rect: np.ndarray) -> np.ndarray:
    """Transformation perspective pour redresser un quadrilatère détecté."""
    (tl, tr, br, bl) = rect
    width_a = np.linalg.norm(br - bl)
    width_b = np.linalg.norm(tr - tl)
    max_w = int(max(width_a, width_b))
    height_a = np.linalg.norm(tr - br)
    height_b = np.linalg.norm(tl - bl)
    max_h = int(max(height_a, height_b))

    dst = np.array([
        [0, 0], [max_w - 1, 0],
        [max_w - 1, max_h - 1], [0, max_h - 1],
    ], dtype=np.float32)

    M = cv2.getPerspectiveTransform(rect, dst)
    return cv2.warpPerspective(image, M, (max_w, max_h))


def upscale(image: np.ndarray, min_width: int = 1500) -> np.ndarray:
    """Agrandit les images basse résolution pour améliorer la reconnaissance.

    Les photos mobiles en basse résolution bénéficient d'un x2.
    Cap à 3000px de large pour rester sous les 7s.
    """
    h, w = image.shape[:2]
    if w >= min_width:
        return image

    scale = min(min_width / w, 2.0)
    new_w = int(w * scale)
    new_h = int(h * scale)
    if new_w > 3000:
        scale = 3000 / w
        new_w = 3000
        new_h = int(h * scale)

    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)


def denoise(image: np.ndarray) -> np.ndarray:
    """Débruitage léger pour photos en basse lumière.

    Paramètres conservateurs pour ne pas flouter le texte.
    """
    return cv2.fastNlMeansDenoisingColored(image, None, h=6, hForColoredComponents=6,
                                            templateWindowSize=7, searchWindowSize=21)


def enhance_contrast(image: np.ndarray) -> np.ndarray:
    """CLAHE (Contrast Limited Adaptive Histogram Equalization).

    Améliore le contraste local — crucial pour texte clair sur fond coloré
    (cartes mutuelle bleues, vertes, etc.) sans écraser les détails.
    """
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l_channel)
    lab_enhanced = cv2.merge([l_enhanced, a, b])
    return cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)


def deskew(image: np.ndarray) -> tuple[np.ndarray, float]:
    """Redresse une image inclinée.

    Retourne (image_redressée, angle_détecté).
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    coords = np.column_stack(np.where(thresh > 0))
    if len(coords) < 50:
        return image, 0.0

    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    if abs(angle) < 0.5:
        return image, angle

    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h),
                              flags=cv2.INTER_CUBIC,
                              borderMode=cv2.BORDER_REPLICATE)
    return rotated, angle


def adaptive_binarize(image: np.ndarray) -> np.ndarray:
    """Binarisation adaptative — uniquement pour images très dégradées."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    binary = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=31,
        C=15,
    )
    return cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)


def _needs_binarization(image: np.ndarray) -> bool:
    """Détecte si l'image a un contraste trop faible pour l'OCR sans binarisation."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    std_dev = np.std(gray)
    return std_dev < 40


def preprocess(raw_bytes: bytes) -> tuple[np.ndarray, dict]:
    """Pipeline complet de pré-traitement optimisé pour documents santé.

    Ordre : décodage → détourage → upscale → débruitage → CLAHE → deskew → binarisation conditionnelle.
    Retourne l'image traitée et les métadonnées.
    """
    image = decode_image(raw_bytes)
    original_shape = image.shape[:2]

    cropped = auto_crop(image)
    was_cropped = cropped.shape[:2] != original_shape

    image = upscale(cropped)

    image = denoise(image)

    image = enhance_contrast(image)

    image, deskew_angle = deskew(image)

    binarized = False
    if _needs_binarization(image):
        image = adaptive_binarize(image)
        binarized = True

    meta = {
        "deskew_angle": round(deskew_angle, 2),
        "binarization": "adaptive" if binarized else "none",
        "contrast_enhancement": "CLAHE",
        "auto_crop": was_cropped,
        "upscaled": cropped.shape[1] < 1500,
        "denoised": True,
        "original_size": f"{original_shape[1]}x{original_shape[0]}",
        "processed_size": f"{image.shape[1]}x{image.shape[0]}",
    }

    return image, meta
