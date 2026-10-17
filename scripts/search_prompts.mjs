import fs from 'node:fs';
import readline from 'node:readline';

async function searchPrompts() {
  const fileStream = fs.createReadStream('C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.includes('"type":"USER_INPUT"') || line.includes('"type": "USER_INPUT"')) {
      if (line.includes('WEBSITE DEVELOPMENT')) {
        const obj = JSON.parse(line);
        console.log('Found user step:', obj.step_index, 'length:', obj.content?.length);
      }
    }
  }
}
searchPrompts();
