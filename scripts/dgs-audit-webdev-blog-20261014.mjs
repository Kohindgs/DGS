import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
const base = 'https://www.dgeniussolutions.com';
const outDir = path.join('scripts','_audit_webdev_blog_20261014');
fs.mkdirSync(outDir,{recursive:true});
const browser = await chromium.launch({headless:true});
const routes=['/blogs/','/services/website-development-amc/'];
for(const route of routes){
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  const badResponses=[],failedRequests=[],errors=[];
  page.on('response',r=>{if(r.status()>=400 && /image|jpg|png|webp|avif|jpeg|gif|uploads|media/.test(r.url())) badResponses.push({status:r.status(),url:r.url()});});
  page.on('requestfailed',r=>{if(/image|jpg|png|webp|avif|jpeg|gif/.test(r.url())) failedRequests.push({url:r.url(),failure:r.failure()?.errorText});});
  page.on('pageerror',e=>errors.push(e.message.slice(0,300)));
  let status, gotoErr;
  try{const res=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:40000});status=res?.status(); await page.waitForTimeout(1800);}catch(e){gotoErr=String(e);}
  const steps=Math.min(26,Math.ceil(await page.evaluate(()=>document.documentElement.scrollHeight)/850));
  for(let i=0;i<steps;i++){await page.evaluate(y=>window.scrollTo(0,y),i*850);await page.waitForTimeout(180);}
  await page.waitForTimeout(1600);
  const dom=await page.evaluate(()=>{
    const imgs=[...document.images].map((im,i)=>({
      index:i,alt:im.alt,src:im.getAttribute('src'),currentSrc:im.currentSrc,
      complete:im.complete,naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight,
      loading:im.loading,visible:(im.getBoundingClientRect().width>0&&im.getBoundingClientRect().height>0),
      article:im.closest('article')?.querySelector('a[href]')?.getAttribute('href'),
      parentClass:im.parentElement?.className?.toString().slice(0,100)
    }));
    const sections=[...document.querySelectorAll('main section')].map((s,i)=>({index:i,id:s.id,cls:typeof s.className==='string'?s.className.slice(0,110):'',heading:s.querySelector('h1,h2,h3')?.textContent.trim().slice(0,120),height:Math.round(s.getBoundingClientRect().height)}));
    return {title:document.title,h1:[...document.querySelectorAll('h1')].map(x=>x.textContent.trim()),h2:[...document.querySelectorAll('h2')].map(x=>x.textContent.trim()),canonical:document.querySelector('link[rel=canonical]')?.href,description:document.querySelector('meta[name=description]')?.content,formCount:document.querySelectorAll('form').length,ctaLinks:[...document.querySelectorAll('a[href]')].filter(a=>/start|quote|project|audit|contact|book|request/i.test(a.textContent)).slice(0,20).map(a=>({text:a.textContent.trim(),href:a.href})),images:imgs,sections,bodyText:document.body.innerText.slice(0,6000)};
  });
  const key=route.includes('blogs')?'blogs':'webdev';
  const result={route,status,gotoErr,badResponses,failedRequests,errors,...dom};
  fs.writeFileSync(path.join(outDir,key+'.json'),JSON.stringify(result,null,2));
  console.log('ROUTE',route,'STATUS',status,'IMG',dom.images.length,'BROKEN',dom.images.filter(x=>x.visible&&x.complete&&x.naturalWidth===0).length,'ERR_HTTP',badResponses.length,'JSERR',errors.length);
  console.log('BROKEN IMAGES',JSON.stringify(dom.images.filter(x=>x.visible&&x.complete&&x.naturalWidth===0).slice(0,30)));
  console.log('BAD RESPONSES',JSON.stringify(badResponses.slice(0,30)));
  console.log('HEADINGS',JSON.stringify(dom.h2.slice(0,60)));
  await page.close();
}
const mirror='data/wordpress/mirrors/pages/services__website-development-amc.json';
const item=JSON.parse(fs.readFileSync(mirror,'utf8'));const $=cheerio.load(item.body||'');
const report={keys:Object.keys(item),bodyLength:(item.body||'').length,stylesLength:(item.styles||'').length,
  sectionHeadings:$('section').map((i,s)=>({i,id:$(s).attr('id'),cls:$(s).attr('class'),text:$(s).find('h1,h2,h3').first().text().trim().slice(0,120)})).get(),
  headingCounts:{h1:$('h1').length,h2:$('h2').length,h3:$('h3').length},
  forms:$('form').map((i,x)=>({i,id:$(x).attr('id'),cls:$(x).attr('class')})).get(),
  placeholderMatches:[...String(item.body||'').matchAll(/(?:Use this section|Add your strongest client logos|The Critical Challenge|Trusted By|Frequently Asked Questions|Website Development)/gi)].map(m=>({text:m[0],index:m.index})).slice(0,70)};
fs.writeFileSync(path.join(outDir,'webdev-source.json'),JSON.stringify(report,null,2));
console.log('SOURCE',JSON.stringify(report));
await browser.close();