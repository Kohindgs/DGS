import fs from "fs";

function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, "utf8");
  const targetPrefix = '<div class=\\"ffph\\"><p>Replace with your Fluent Form shortcode:</p><code>';
  const targetSuffix = '</code></div>';

  if (!content.includes(targetPrefix)) {
    console.log(`Target prefix not found in ${filePath}`);
    return;
  }

  // Replace targetPrefix with empty string
  content = content.replace(targetPrefix, "");
  // Find the matching targetSuffix after the form
  const formEnd = content.indexOf("</form>");
  if (formEnd !== -1) {
    const suffixPos = content.indexOf(targetSuffix, formEnd);
    if (suffixPos !== -1 && suffixPos - formEnd < 500) {
      content = content.slice(0, suffixPos) + content.slice(suffixPos + targetSuffix.length);
      console.log(`Successfully removed prefix and suffix from ${filePath}`);
      fs.writeFileSync(filePath, content, "utf8");
      return;
    }
  }
  console.log(`Could not find matching suffix in ${filePath}`);
}

cleanFile("data/wordpress/mirrors/pages/seo-pricing.json");
cleanFile("data/archive/seo-pricing/seo-pricing.json");
