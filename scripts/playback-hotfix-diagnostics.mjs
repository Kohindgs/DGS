import {chromium} from "playwright";
const browser=await chromium.launch({headless:true});
for(const route of ["/","/services/ai-video-production-agency/","/services/ai-production-dubai-page/","/portfolio/"]){
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const events=[];
 page.on("pageerror",e=>events.push("PAGEERROR "+e.message));
 page.on("console",m=>{if(m.type()==="error") events.push("CONSOLE "+m.text().slice(0,230))});
 page.on("response",r=>{if(r.status()>=400&&(/\.mp4|\.webm|portfolio|video/i).test(r.url()))events.push("HTTP "+r.status()+" "+r.url().slice(0,160))});
 try{
 const r=await page.goto("https://www.dgeniussolutions.com"+route,{waitUntil:"domcontentloaded",timeout:25000});
 await page.waitForTimeout(2500);
 const info=await page.evaluate(()=>({title:document.title,videoCount:document.querySelectorAll("video").length,videoSources:[...document.querySelectorAll("video")].slice(0,5).map(x=>({src:x.currentSrc||x.src,readyState:x.readyState,networkState:x.networkState,error:x.error?.message})),galleryCount:document.querySelectorAll(".portfolio-item,.portfolio-card,[data-video-url],[data-video-src]").length,lightbox:!!document.querySelector("#lightbox"),loadMore:!!document.querySelector("#load-more-btn")}));
 const loc=page.locator("#portfolio-gallery video, #portfolio-gallery .portfolio-card, #portfolio-gallery .portfolio-item, #portfolio-gallery img").first();
 if(await loc.count()){try{await loc.click({timeout:3500});await page.waitForTimeout(1200);info.afterClick=await page.evaluate(()=>({videos:[...document.querySelectorAll("video")].slice(0,8).map(v=>({id:v.id,src:v.currentSrc||v.src,paused:v.paused,readyState:v.readyState,error:v.error?.message})),lightboxClass:document.querySelector("#lightbox")?.className}));}catch(e){events.push("CLICK_ERROR "+String(e).slice(0,200))}}
 console.log("ROUTE "+route+" "+JSON.stringify({status:r?.status(),...info,events:events.slice(0,12)}));
 }catch(e){console.log("ROUTE_ERROR "+route+" "+String(e).slice(0,350))}
 await page.close();
}
for(const u of ["https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Makar-Sankranti-And-Pongal-Final-1.mp4","https://www.dgeniussolutions.com/media/portfolio/videos/hyundai_creta_1.mp4"]){
 try{const h=await fetch(u,{method:"HEAD"});const v=await fetch(u,{headers:{Range:"bytes=0-1023"}});console.log("ASSET "+JSON.stringify({url:u,head:h.status,type:h.headers.get("content-type"),length:h.headers.get("content-length"),range:v.status,contentRange:v.headers.get("content-range"),rangeType:v.headers.get("content-type"),rangeSize:(await v.arrayBuffer()).byteLength}));}catch(e){console.log("ASSET_ERR "+u+" "+String(e))}
}
await browser.close();