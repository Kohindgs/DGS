import fs from "node:fs";

const vids = JSON.parse(fs.readFileSync("scripts/_verified_27_videos.json", "utf8"));

async function checkUrls() {
  console.log("Checking URLs for 27 videos on live production...");
  let failed = 0;
  for (const v of vids) {
    try {
      const resV = await fetch(v.contentUrl, { method: "HEAD" });
      const resT = await fetch(v.thumbnailUrl, { method: "HEAD" });
      if (resV.status !== 200 || resT.status !== 200) {
        console.log(`ISSUE: #${v.index} ${v.name} -> Video: ${resV.status}, Thumb: ${resT.status}`);
        failed++;
      } else {
        console.log(`✓ #${v.index} ${v.name.substring(0, 25)} -> Video: 200, Thumb: 200`);
      }
    } catch (e) {
      console.log(`ERROR: #${v.index} ${v.name}: ${e.message}`);
      failed++;
    }
  }
  console.log(`\nFinished checking. Failed: ${failed}/${vids.length}`);
}

checkUrls().catch(console.error);
