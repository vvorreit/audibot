import type { MutuelleData, OrdonnanceData } from "@/lib/parsers";

export interface OcrDataPayload {
  mutuelle?: MutuelleData;
  ordonnance?: OrdonnanceData;
  images?: { mutuelle?: string; ordonnance?: string };
}

export interface FrameMatch {
  id: string; brand: string; model: string; shape: string;
  material: string; priceRange: string; style: string;
  imageUrl: string | null; score: number;
}

export interface AddrSug { label: string; name: string; postcode: string; city: string; }
