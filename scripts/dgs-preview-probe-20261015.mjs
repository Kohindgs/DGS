import { chromium } from "playwright";
const items=[
{key:"humanxt",url:"https://humanxt.com/"},
{key:"weavings",url:"https://www.weavings.in/"},
{key:"katherines-gallery",url:"https://katherinesgallery.in/"},
{key:"better-ceasons",url:"https://betterceasons.com/"}
];
const browser=await chromium.launch({headless:true});
for(const item of items){
 const context=await browser.newContext({viewport:{width:1440,height:900},ignoreHTTPSErrors:true,reducedMotion:"reduce"});
 const page=await context.newPage();
 let status=0,error="";
 try{
  const response=await page.goto(item.url,{waitUntil:"domcontentloaded",timeout:35000});
  status=response?.status()||0;
  await page.waitForTimeout(1900);
  const h=await page.evaluate(()=>({scrollHeight:document.documentElement.scrollHeight,bodyHeight:document.body.scrollHeight,title:document.title,imgs:document.images.length,links:document.querySelectorAll("a").length}));
  console.log(JSON.stringify({key:item.key,url:page.url(),status,...h}));
 }catch(e){error=String(e.message||e).slice(0,280);console.log(JSON.stringify({key:item.key,status,error}));}
 await context.close();
}
await browser.close();