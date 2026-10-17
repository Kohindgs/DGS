const r = await fetch('https://www.dgeniussolutions.com/services/ai-video-production-agency/');
const html = await r.text();
const s = html.indexOf('var allVideos = [');
const e = html.indexOf('];', s);
const snippet = html.slice(s, e + 2);
const unescaped = snippet.replace(/^var allVideos = /, '').replace(/;$/, '').replace(/\\"/g, '"').replace(/\\u0026/g, '&');
const videos = JSON.parse(unescaped);
console.log('Live allVideos length:', videos.length);
console.log('Categories:', videos.map((v, i) => `${i+1}. [${v.category || v.cat}] ${v.title}`));
