"use client";

import { useEffect } from "react";
import { serializeJsonLd, type JsonLdValue } from "@/lib/schema/jsonld";

export function JsonLd({ value, id }: { value: JsonLdValue; id?: string }) {
  useEffect(() => {
    if (id) {
      const scripts = document.querySelectorAll(`script#${id}`);
      if (scripts.length > 1) {
        for (let i = 1; i < scripts.length; i++) {
          scripts[i].remove();
        }
      }
    }
  }, [id]);

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(value) }}
    />
  );
}
