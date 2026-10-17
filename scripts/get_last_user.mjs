import fs from 'node:fs';
import readline from 'node:readline';

async function getLastUserRequest() {
  const fileStream = fs.createReadStream('C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let userSteps = [];
  for await (const line of rl) {
    if (line.includes('"type":"USER_INPUT"') || line.includes('"type": "USER_INPUT"')) {
      try {
        const obj = JSON.parse(line);
        userSteps.push({ step_index: obj.step_index, content: obj.content });
      } catch (e) {}
    }
  }
  console.log('Total user steps:', userSteps.length);
  const last = userSteps[userSteps.length - 1];
  console.log('Last step index:', last.step_index);
  console.log('Content preview:');
  console.log(last.content?.slice(0, 500));
  fs.writeFileSync('scripts/actual_last_user_prompt.md', last.content || '');
  console.log('Saved to scripts/actual_last_user_prompt.md (length ' + (last.content?.length || 0) + ')');
}
getLastUserRequest();
