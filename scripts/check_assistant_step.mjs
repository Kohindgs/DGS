import fs from 'node:fs';
import readline from 'node:readline';

async function checkAssistantStep() {
  const fileStream = fs.createReadStream('C:/Users/Kohin/.gemini/antigravity/brain/534291cc-4b59-4e18-aeca-75b1c4a803e7/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.includes('"step_index": 73379') || line.includes('"step_index":73379')) {
      const obj = JSON.parse(line);
      console.log('Step 73379 thinking length:', obj.thinking?.length);
      console.log('Step 73379 tool calls:', obj.tool_calls?.map(t => t.function?.name || t.name));
      console.log('Thinking snippet:', obj.thinking?.slice(0, 1000));
      break;
    }
  }
}
checkAssistantStep();
