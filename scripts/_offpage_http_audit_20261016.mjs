import fs from "node:fs";
const raw=JSON.parse(fs.readFileSync("scripts/_offpage_readonly_snapshot_20261016.json","utf8"));
const a=raw.priorityCandidates.filter(x=>x.status==="QUALIFIED").slice(0,20);
const results=[];
for(const o of a){
 const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),13000);
 try{
  const r=await fetch(o.exact_submission_url,{method:"GET",redirect:"follow",signal:ctrl.signal,headers:{"User-Agent":"Mozilla/5.0 (compatible; DGSOpportunityAudit/1.0)"}});
  const text=await r.text().catch(()=>"");
  const title=text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g," ").slice(0,110)||"";
  const item={site:o.site_name,orig:o.exact_submission_url,status:r.status,finalUrl:r.url,title,valid:r.status>=200&&r.status<300&&!/404|not found|page does not exist/i.test(title),date:o.last_checked_at};
  results.push(item);console.log(JSON.stringify(item));
 }catch(e){const item={site:o.site_name,orig:o.exact_submission_url,error:String(e).slice(0,150),date:o.last_checked_at};results.push(item);console.log(JSON.stringify(item))}
 finally{clearTimeout(timer);}
}
fs.writeFileSync("scripts/_offpage_http_20261016.json",JSON.stringify(results,null,2));
