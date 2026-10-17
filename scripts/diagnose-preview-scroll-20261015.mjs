import { chromium } from "playwright";
import fs from "node:fs";
const dir="scripts/_preview_scroll_diagnostics_20261015";
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errs=[];
page.on("pageerror",e=>errs.push("JS: "+e.message));
page.on("response",r=>{if(r.status()>=400 && (/case-studies|katherine/i).test(r.url())) errs.push(r.status()+" "+r.url());});
await page.goto("https://www.dgeniussolutions.com/services/website-development-amc/",{waitUntil:"domcontentloaded",timeout:40000});
await page.waitForTimeout(2500);
const selector="#recent-work .work-project-row";
const rows=page.locator(selector);
console.log("ROW COUNT",await rows.count());
for(let i=0;i<await rows.count();i++){
 const row=rows.nth(i),img=row.locator(".w-img img.live-preview-image"),frame=row.locator(".w-img");
 await frame.scrollIntoViewIfNeeded();await page.waitForTimeout(700);
 const get=()=>img.evaluate(el=>{
   const f=el.closest(".w-img"), ir=el.getBoundingClientRect(),fr=f.getBoundingClientRect();
   return {
      title:el.closest(".work-project-row")?.querySelector(".work-client-name")?.textContent,
      imageSrc:el.currentSrc, naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,
      complete:el.complete,
      frameRect:{x:fr.x,y:fr.y,width:fr.width,height:fr.height},
      imageRect:{x:ir.x,y:ir.y,width:ir.width,height:ir.height},
      transform:getComputedStyle(el).transform,transitionDuration:getComputedStyle(el).transitionDuration,
      objectFit:getComputedStyle(el).objectFit,objectPosition:getComputedStyle(el).objectPosition,
      rootActive:document.body.classList.contains("dgs-webdev-active"),
      imageVisible:ir.width>0&&ir.height>0,
      assetScrollDistance:ir.height-fr.height,
      frameIsHovered:f.matches(":hover"), rowHovered:f.closest(".work-project-row").matches(":hover"),
      hasPreviewButton:!!f.querySelector(".preview-scroll-pill")
   };
 });
 const pre=await get();
 await frame.hover();await page.waitForTimeout(800);
 const start=await get();
 await page.waitForTimeout(2500);const mid=await get();
 await page.waitForTimeout(2000);const later=await get();
 await page.screenshot({path:dir+"/card_"+(i+1)+"_hover.png"});
 await page.mouse.move(0,0);await page.waitForTimeout(650);const out=await get();
 console.log("PROJECT",JSON.stringify({i,title:pre.title,pre,start,mid,later,out},null,2));
}
for(const url of ["https://betterceasons.com/","https://katherinesgallery.in/","https://www.katherinesgallery.in/"]){
 const p=await browser.newPage({viewport:{width:1440,height:900},ignoreHTTPSErrors:true});
 try{
 const r=await p.goto(url,{waitUntil:"domcontentloaded",timeout:23000});await p.waitForTimeout(1500);
 const info=await p.evaluate(()=>({
  title:document.title,height:document.documentElement.scrollHeight,bodyHeight:document.body.scrollHeight,
  canonical:document.querySelector('link[rel="canonical"]')?.href||null,
  h1s:[...document.querySelectorAll("h1")].map(x=>x.innerText).slice(0,3),
  imgStats:{total:document.images.length,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length},
  text:document.body.innerText.slice(0,280)
 }));
 console.log("CLIENT SITE",JSON.stringify({url,finalUrl:p.url(),status:r?.status(),...info}));
 }catch(e){console.log("CLIENT ERROR",url,String(e).slice(0,400));}
 await p.close();
}
console.log("ERRORS",JSON.stringify(errs));
await browser.close();