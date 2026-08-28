import { serializeJsonLd, type JsonLdValue } from "@/lib/schema/jsonld";

export function JsonLd({ value, id }: { value: JsonLdValue; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(value) }}
    />
  );
}
