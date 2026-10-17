import fs from "node:fs";
import readline from "node:readline";

async function checkStep18724() {
  const fileStream = fs.createReadStream(
    "C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/.system_generated/logs/transcript_full.jsonl"
  );
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.includes('"step_index": 18724') || line.includes('"step_index":18724')) {
      const obj = JSON.parse(line);
      console.log(obj.content);
      break;
    }
  }
}
checkStep18724();
