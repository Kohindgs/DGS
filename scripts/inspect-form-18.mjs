import fs from "fs";

const content = fs.readFileSync("data/wordpress/mirrors/pages/seo-pricing.json", "utf8");
const start = content.indexOf("fluentform_wrapper_18");
const end = content.indexOf("</form>", start);
const html = content.slice(start, end + 7);

const inputs = [...html.matchAll(/name=['"]([^'"]+)['"]/g)].map((m) => m[1]);
console.log("Inputs in Form 18:", [...new Set(inputs)]);

// Also check form classes, id, action
console.log("Form opening tag:", html.slice(0, 300));
