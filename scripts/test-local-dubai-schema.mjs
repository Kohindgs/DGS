import { getRouteByPath } from "../lib/nextjs/routes";
import { loadContentBlocks } from "../lib/nextjs/content-blocks";
import { buildRouteSchemas } from "../lib/schema/page-schemas";

async function testSchemas() {
  const path = "/services/ai-production-dubai-page/";
  const route = await getRouteByPath(path);
  const blocks = (await loadContentBlocks())[path]?.blocks || [];
  const schemas = buildRouteSchemas({ route, path, blocks, breadcrumbs: [] });
  
  const faq = schemas.find(s => s['@type'] === 'FAQPage');
  console.log("FAQPage schema generated:", !!faq);
  console.log("mainEntity count:", faq?.mainEntity?.length);
  console.log("Questions:", faq?.mainEntity?.map(q => q.name));
}

testSchemas().catch(console.error);
