import { getBrand } from "./brand";

export function getTrackingPixel(token: string): string {
  const base = getBrand().appUrl;
  return `<img src="${base}/api/track/open?t=${encodeURIComponent(token)}" width="1" height="1" alt="" style="display:none;" />`;
}

export function getTrackingLink(token: string, destination: string): string {
  const base = getBrand().appUrl;
  return `${base}/api/track/click?t=${encodeURIComponent(token)}&url=${encodeURIComponent(destination)}`;
}

export function getUnsubscribeLink(token: string): string {
  const base = getBrand().appUrl;
  return `${base}/unsubscribe?t=${encodeURIComponent(token)}`;
}

export function getUnsubscribeFooter(token: string): string {
  const brand = getBrand();
  const link = getUnsubscribeLink(token);
  return `<p style="font-size:11px;color:#999;margin-top:24px;text-align:center;">Vous recevez cet email car vous \u00eates ${brand.lexicon.profession.toLowerCase()} ind\u00e9pendant. <a href="${link}" style="color:#999;text-decoration:underline;">Me d\u00e9sinscrire</a></p>`;
}
