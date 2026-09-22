import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

function loadEnvFile(file) {
  return fs.readFile(file,"utf8").then((text)=>{
    for (const raw of text.split(/\r?\n/)) {
      const match=raw.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if(match && !process.env[match[1]]) process.env[match[1]]=match[2];
    }
  }).catch(()=>{});
}

await loadEnvFile(path.join(process.cwd(),".env.production"));
await loadEnvFile(path.join(process.cwd(),".env.local"));

function connectionOptions() {
  const uri=process.env.DGS_DATABASE_URL||process.env.DATABASE_URL;
  if(uri) {
    const url=new URL(uri);
    return {
      host:url.hostname,
      port:Number(url.port||3306),
      user:decodeURIComponent(url.username),
      password:decodeURIComponent(url.password),
      database:url.pathname.replace(/^\//,""),
      ssl:url.searchParams.get("ssl")==="true" ? {} : undefined,
      multipleStatements:true,
    };
  }

  if(!process.env.DGS_MYSQL_HOST||!process.env.DGS_MYSQL_USER||!process.env.DGS_MYSQL_DATABASE) {
    throw new Error("CMS database configuration is missing");
  }
  return {
    host:process.env.DGS_MYSQL_HOST,
    port:Number(process.env.DGS_MYSQL_PORT||3306),
    user:process.env.DGS_MYSQL_USER,
    password:process.env.DGS_MYSQL_PASSWORD||"",
    database:process.env.DGS_MYSQL_DATABASE,
    multipleStatements:true,
  };
}

const schema=await fs.readFile(path.join(process.cwd(),"db","schema.sql"),"utf8");
const connection=await mysql.createConnection(connectionOptions());
try {
  await connection.query(schema);
  const [rows]=await connection.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('career_jobs','leads','form_submissions','portfolio_items','assessment_assignments','assessment_attempts','media_assets','media_usage') ORDER BY TABLE_NAME"
  );
  const names=rows.map((row)=>row.TABLE_NAME);
  console.log(JSON.stringify({ok:true,tables:names},null,2));
  if(names.length!==8) throw new Error("CMS schema verification failed");
} finally {
  await connection.end();
}
