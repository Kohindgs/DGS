import { verifiedOrganization } from "@/lib/schema/entity";

function cdata(value: string) {
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

/** Build /locations.kml from verifiedOrganization — no invented coordinates. */
export function buildLocationsKml() {
  const { name, url, telephone, address } = verifiedOrganization;
  const addressLine = [
    address.streetAddress,
    address.addressLocality,
    address.addressRegion,
    address.postalCode,
    address.addressCountry,
  ].join(", ");
  const primaryPhone = telephone[0]?.replace(/[^\d+]/g, "") ?? telephone[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
  <Document>
    <name>Locations for ${cdata(name)}</name>
    <open>1</open>
    <Folder>
      <atom:link href="${url}" />
      <Placemark>
        <name><![CDATA[${cdata(name)}]]></name>
        <description><![CDATA[${cdata(name)} - Creative & Digital Marketing Agency In India]]></description>
        <address><![CDATA[${cdata(addressLine)}]]></address>
        <phoneNumber><![CDATA[${cdata(primaryPhone)}]]></phoneNumber>
        <atom:link href="${url}"/>
      </Placemark>
    </Folder>
  </Document>
</kml>
`;
}
