import fs from "node:fs";

const raw = fs.readFileSync("./data/wordpress/mirrors/pages/services__website-development-amc.json", "utf8");
const data = JSON.parse(raw);
const body = data.body;

const formStart = body.indexOf('<div class="form-glass" id="website-project-form">');
const formEnd = body.indexOf('</div></div></div>', formStart);

console.log("Form start:", formStart);
console.log("Form end:", formEnd);

// Let's verify by finding the closing </div> of form-glass
// form-glass contains: h3, p, div.wdgs-fluent-form
const formHtml = body.substring(formStart);
const closeIdx = formHtml.indexOf('</section>');
const exactFormGlass = formHtml.substring(0, closeIdx).trim();

fs.writeFileSync("./scripts/exact_form6_glass.html", exactFormGlass);
console.log("Extracted exact form glass, length:", exactFormGlass.length);
