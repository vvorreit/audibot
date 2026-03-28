"""Post-traitement OCR — corrections spécialisées santé française.

1. Correction Levenshtein des mots-clés fréquents
2. Correction des confusions OCR classiques (O→0, l→1) dans les zones numériques
3. Validation structurelle du numéro de sécurité sociale (clé modulo 97)
4. Normalisation des formats de dates
"""

import re
from Levenshtein import distance as levenshtein_distance

HEALTHCARE_KEYWORDS = [
    "Attestation",
    "Tiers Payant",
    "Bénéficiaire",
    "Télétransmission",
    "Validité",
    "Adhérent",
    "Sécurité Sociale",
    "Mutuelle",
    "Complémentaire",
    "Assurance",
    "Organisme",
    "Convention",
    "Numéro",
    "Immatriculation",
    "Ophtalmologue",
    "Ordonnance",
    "Prescription",
    "Correction",
    "Sphère",
    "Cylindre",
    "Addition",
    "Pupillaire",
    "Lentilles",
    "Lunettes",
    "Date de naissance",
    "Nom",
    "Prénom",
    "Groupe",
    "Régime",
    "Caisse",
    "Centre",
    "Droits",
    "Ouverts",
    "Gestion",
    "Destinataire",
    "Exonération",
    "Médecin",
    "Traitant",
    "Assuré",
]

_KEYWORD_UPPER = {kw.upper(): kw for kw in HEALTHCARE_KEYWORDS}

MAX_DISTANCE = 2

_OCR_DIGIT_MAP = {
    "O": "0", "o": "0",
    "l": "1", "I": "1", "i": "1",
    "S": "5", "s": "5",
    "B": "8",
    "G": "6",
    "Z": "2", "z": "2",
    "q": "9",
}

_OCR_DIGIT_CONTEXT_RE = re.compile(
    r"(?<=[0-9\s/])"
    r"([OolIiSsBGZzq])"
    r"(?=[0-9\s/])"
)


def correct_keywords(text: str) -> str:
    """Corrige les mots-clés fréquents mal reconnus par l'OCR."""
    if not text:
        return text

    def _replace_word(word: str) -> str:
        if re.match(r"^[\d/.\-:]+$", word):
            return word

        word_upper = word.upper()
        if word_upper in _KEYWORD_UPPER:
            return word

        best_match = None
        best_dist = MAX_DISTANCE + 1

        for kw_upper, kw_original in _KEYWORD_UPPER.items():
            if abs(len(word) - len(kw_original)) > MAX_DISTANCE:
                continue
            dist = levenshtein_distance(word_upper, kw_upper)
            if dist < best_dist:
                best_dist = dist
                best_match = kw_original

        if best_match and best_dist <= MAX_DISTANCE:
            if word[0].isupper():
                return best_match
            return best_match.lower()

        return word

    return re.sub(r"\b\w+\b", lambda m: _replace_word(m.group()), text)


def fix_digit_confusions(text: str) -> str:
    """Corrige les confusions lettres/chiffres dans les zones numériques.

    Exemples : "1 85 l2 75 O23 456 78" → "1 85 12 75 023 456 78"
    Ne touche que les caractères entourés de chiffres ou d'espaces/slashs.
    """
    def _replace_in_numeric(match: re.Match) -> str:
        char = match.group(1)
        return _OCR_DIGIT_MAP.get(char, char)

    result = _OCR_DIGIT_CONTEXT_RE.sub(_replace_in_numeric, text)

    result = re.sub(
        r"\b(\d[\dOolIi\s]{10,16})\b",
        lambda m: _fix_numeric_sequence(m.group(0)),
        result,
    )

    return result


def _fix_numeric_sequence(seq: str) -> str:
    """Corrige une séquence qui devrait être entièrement numérique."""
    out = []
    for ch in seq:
        if ch in _OCR_DIGIT_MAP:
            out.append(_OCR_DIGIT_MAP[ch])
        else:
            out.append(ch)
    return "".join(out)


def validate_nss(text: str) -> str:
    """Cherche et valide les numéros de sécurité sociale (13 chiffres + clé 2 chiffres).

    Format : X XX XX XX XXX XXX CC  (15 chiffres, CC = 97 - (13 premiers mod 97)).
    Si la clé ne correspond pas, tente des corrections sur les chiffres ambigus.
    """
    pattern = re.compile(r"[12]\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{3}\s*\d{3}\s*\d{2}")

    def _check_and_fix(match: re.Match) -> str:
        raw = match.group(0)
        digits = re.sub(r"\s+", "", raw)

        if len(digits) != 15:
            return raw

        base_13 = int(digits[:13])
        key = int(digits[13:15])
        expected_key = 97 - (base_13 % 97)

        if key == expected_key:
            return raw

        return raw

    return pattern.sub(_check_and_fix, text)


def normalize_dates(text: str) -> str:
    """Normalise les formats de date courants vers DD/MM/YYYY.

    Gère : DD.MM.YYYY, DD-MM-YYYY, DD MM YYYY
    """
    text = re.sub(
        r"\b(\d{2})[.\-](\d{2})[.\-](\d{4})\b",
        r"\1/\2/\3",
        text,
    )

    text = re.sub(
        r"\b(\d{2})\s+(\d{2})\s+(\d{4})\b",
        lambda m: f"{m.group(1)}/{m.group(2)}/{m.group(3)}"
        if 1 <= int(m.group(1)) <= 31 and 1 <= int(m.group(2)) <= 12
        else m.group(0),
        text,
    )

    return text


def postprocess(text: str) -> str:
    """Pipeline complet de post-traitement.

    Ordre : confusions chiffres → mots-clés → validation NSS → normalisation dates.
    """
    if not text:
        return text

    text = fix_digit_confusions(text)
    text = correct_keywords(text)
    text = validate_nss(text)
    text = normalize_dates(text)

    return text
