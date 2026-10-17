import { execFileSync } from "node:child_process";
import fs from "node:fs";
const REMOTE = String.raw`
const fs = require("node:fs");
const mysql = require("mysql2/promise");
(async () => {
const file="/home/u188101251/production-app/shared/.env.production";
const cfg={};
for(const line of fs.readFileSync(file,"utf8").split(/\r?\n/)){
 const m=line.match(/^([A-Za-z0-9_]+)=(.*)$/);
 if(m){let v=m[2].trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);cfg[m[1]]=v;}
}
const db=await mysql.createConnection({
 host:cfg.DGS_MYSQL_HOST||"127.0.0.1",port:Number(cfg.DGS_MYSQL_PORT||3306),
 user:cfg.DGS_MYSQL_USER,password:cfg.DGS_MYSQL_PASSWORD,database:cfg.DGS_MYSQL_DATABASE
});
const query=async(name,sql,params=[])=>{try {const [rows]=await db.execute(sql,params);return rows;}catch(e){return {error:e.message};}};
const out={createdAt:new Date().toISOString(),
 statusCounts:await query("status","SELECT status,verification_status,COUNT(*) as n, SUM(http_status=404) as recorded404, SUM(http_status=410) as recorded410, SUM(last_checked_at IS NULL) as neverChecked, SUM(assigned_to IS NULL) as unassigned FROM off_page_opportunities GROUP BY status,verification_status ORDER BY n DESC"),
 sourceCounts:await query("source","SELECT source,source_type,status,COUNT(*) n FROM off_page_opportunities GROUP BY source,source_type,status ORDER BY n DESC LIMIT 35"),
 active404:await query("active404","SELECT id,site_name,domain,exact_submission_url,status,verification_status,http_status,CAST(last_checked_at AS CHAR) last_checked_at,source_type,qualification_reason FROM off_page_opportunities WHERE (http_status IN(404,410) OR http_status>=500) AND status IN('NEW','DISCOVERED','QUALIFIED','MANAGER_REVIEW','APPROVED') ORDER BY last_checked_at DESC LIMIT 45"),
 priorityCandidates:await query("priorityCandidates","SELECT id,site_name,domain,exact_submission_url,status,verification_status,http_status,CAST(last_checked_at AS CHAR) last_checked_at,CAST(last_verified_at AS CHAR) last_verified_at,source,source_type,category,priority_score,assigned_to,qualification_reason FROM off_page_opportunities WHERE assigned_to IS NULL AND (status IN('QUALIFIED','MANAGER_REVIEW','APPROVED') OR verification_status='VERIFIED_ACTIVE') ORDER BY priority_score DESC LIMIT 65"),
 discoveryRuns:await query("discoveryRuns","SELECT provider,status,CAST(started_at AS CHAR) started_at,CAST(completed_at AS CHAR) completed_at, qualified_count, rejected_count FROM off_page_discovery_runs ORDER BY started_at DESC LIMIT 12"),
 automatedRuns:await query("automatedRuns","SELECT run_type,status,CAST(started_at AS CHAR) started_at,CAST(completed_at AS CHAR) completed_at FROM off_page_automation_runs ORDER BY started_at DESC LIMIT 12")
};
await db.end();
console.log("DGS_OFFPAGE_READONLY_JSON="+JSON.stringify(out));
})().catch(e=>{console.error("AUDIT_ERROR "+e.message);process.exitCode=1;});
`;
const out=execFileSync("ssh",[
 "-i","C:/Users/Kohin/.ssh/id_ed25519","-o","BatchMode=yes","-o","ConnectTimeout=20",
 "-p","65002","u188101251@147.93.100.126",
 "cd /home/u188101251/production-app/current && node -"
],{input:REMOTE,encoding:"utf8",maxBuffer:1024*1024*6,timeout:60000});
const marker="DGS_OFFPAGE_READONLY_JSON=";
const index=out.lastIndexOf(marker);
if(index<0)throw Error("No expected response from remote. "+out.slice(0,1200));
const data=JSON.parse(out.slice(index+marker.length).trim());
fs.writeFileSync("scripts/_offpage_readonly_snapshot_20261016.json",JSON.stringify(data,null,2));
console.log("CREATED "+data.createdAt);
for(const field of ["statusCounts","sourceCounts","active404","discoveryRuns","automatedRuns"]){
 console.log("=="+field+"==",JSON.stringify(data[field]).slice(0,9000));
}
const a=data.priorityCandidates;
console.log("Priority candidates",Array.isArray(a)?a.length:JSON.stringify(a));
if(Array.isArray(a)) for(const p of a.slice(0,35)){
 console.log([p.site_name,p.exact_submission_url,p.status,p.verification_status,p.http_status,p.last_checked_at,p.source_type,p.category].join(" | "));
}
