"use client";

import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/analytics";

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (metric.label === "web-vital") {
      track("web_vital", {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
      });
    }
  });

  return null;
}
