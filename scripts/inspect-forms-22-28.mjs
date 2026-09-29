import fs from "fs";

for (const f of ["seo-services-mumbai-google-ads-landing-page.json", "services__website-development-pune-page.json"]) {
  const d = JSON.parse(fs.readFileSync("data/wordpress/mirrors/pages/" + f, "utf8"));
  const inputs = [...d.body.matchAll(/name="([^"]+)"/g)].map((m) => m[1]);
  console.log(f, inputs);
}
