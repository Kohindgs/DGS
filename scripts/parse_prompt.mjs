import fs from 'node:fs';

const raw = fs.readFileSync('scripts/found_line.txt', 'utf8');
const lines = raw.split('\n');
let bestContent = '';
for (const line of lines) {
  if (line.includes('WEBSITE DEVELOPMENT PAGE REBUILD')) {
    const jsonStart = line.indexOf('{"step_index":');
    if (jsonStart !== -1) {
      try {
        const obj = JSON.parse(line.slice(jsonStart));
        if (obj.content && obj.content.length > bestContent.length) {
          bestContent = obj.content;
        }
      } catch (e) {
      }
    }
  }
}
if (bestContent) {
  fs.writeFileSync('scripts/last_user_prompt.md', bestContent);
  console.log('Saved best content, length:', bestContent.length);
}
