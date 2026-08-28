import { verifiedOrganization } from "@/lib/schema/entity";

const body = `# ${verifiedOrganization.name}

> Full-service digital marketing agency in Mumbai.

${verifiedOrganization.url}/

## Services

- ${verifiedOrganization.url}/services/seo-services-in-mumbai/
- ${verifiedOrganization.url}/services/aeo-services-in-mumbai/
- ${verifiedOrganization.url}/services/geo/
- ${verifiedOrganization.url}/services/llm-seo-service/
- ${verifiedOrganization.url}/services/ai-video-production-agency/

## Contact

- Email: ${verifiedOrganization.email}
- Phone: ${verifiedOrganization.telephone.join(", ")}
- Address: ${verifiedOrganization.address.streetAddress}, ${verifiedOrganization.address.addressLocality} ${verifiedOrganization.address.postalCode}

## Optional

- ${verifiedOrganization.url}/llms-full.txt
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
