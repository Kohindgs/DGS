import sharp from "sharp";
import fs from "node:fs";
const root="scripts/_preview_scroll_diagnostics_20261015/";
const sources=[
  ["better", "public/wp-content/uploads/case-studies/betterceasons-full.webp"],
  ["katherine", "public/wp-content/uploads/2025/12/katherinesgallery-scaled.webp"]
];
for(const [key,file] of sources){
 const m=await sharp(file).metadata();
 const width=m.width;
 const height=m.height;
 const viewport=Math.min(Math.round(width*.625),height);
 const offsets=[0,.2,.4,.6,.8,1].map(v=>Math.round(v*(height-viewport)));
 const parts=[];
 for(let i=0;i<offsets.length;i++){
  const b=await sharp(file).extract({left:0,top:offsets[i],width,height:viewport}).resize(480,300,{fit:"contain",background:"#fff"}).jpeg({quality:80}).toBuffer();
  parts.push({input:b,left:(i%2)*480,top:Math.floor(i/2)*300});
 }
 await sharp({create:{width:960,height:900,channels:3,background:"#cccccc"}}).composite(parts).jpeg({quality:85}).toFile(root+key+"_contact.jpg");
 console.log("OUTPUT",key,root+key+"_contact.jpg","natural",m.width,m.height,"scrollable",height-viewport,"offsets",offsets.join(","));
}
