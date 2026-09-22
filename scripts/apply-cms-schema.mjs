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

  // Column migration for blog_posts
  const [cols] = await connection.query("DESCRIBE blog_posts");
  const existingCols = new Set(cols.map((c) => c.Field));

  const migrations = [
    { col: "scheduled_for", sql: "ALTER TABLE blog_posts ADD COLUMN scheduled_for DATETIME NULL" },
    { col: "featured_image_url", sql: "ALTER TABLE blog_posts ADD COLUMN featured_image_url VARCHAR(512) NULL" },
    { col: "seo_title", sql: "ALTER TABLE blog_posts ADD COLUMN seo_title VARCHAR(255) NULL" },
    { col: "seo_description", sql: "ALTER TABLE blog_posts ADD COLUMN seo_description TEXT NULL" },
    { col: "focus_keyword", sql: "ALTER TABLE blog_posts ADD COLUMN focus_keyword VARCHAR(255) NULL" },
    { col: "word_count", sql: "ALTER TABLE blog_posts ADD COLUMN word_count INT NOT NULL DEFAULT 0" },
    { col: "reading_time_minutes", sql: "ALTER TABLE blog_posts ADD COLUMN reading_time_minutes INT NOT NULL DEFAULT 3" },
    { col: "needs_review", sql: "ALTER TABLE blog_posts ADD COLUMN needs_review BOOLEAN NOT NULL DEFAULT TRUE" },
  ];

  for (const m of migrations) {
    if (!existingCols.has(m.col)) {
      await connection.query(m.sql);
      console.log(`Applied column migration: ${m.col}`);
    }
  }

  // Column migration for career_jobs
  const [careerCols] = await connection.query("DESCRIBE career_jobs");
  const careerExistingCols = new Set(careerCols.map((c) => c.Field));
  if (!careerExistingCols.has("creative_requirements")) {
    await connection.query("ALTER TABLE career_jobs ADD COLUMN creative_requirements JSON NULL");
    console.log("Applied column migration: career_jobs.creative_requirements");
  }

  const expectedTables = [
    "assessment_assignments",
    "assessment_attempts",
    "authors",
    "blog_post_categories",
    "blog_post_tags",
    "blog_posts",
    "blog_revisions",
    "career_jobs",
    "categories",
    "form_submissions",
    "google_search_updates",
    "leads",
    "media_assets",
    "media_usage",
    "portfolio_items",
    "seo_metadata",
    "tags"
  ];

  const [rows]=await connection.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN (${expectedTables.map(() => "?").join(",")}) ORDER BY TABLE_NAME`,
    expectedTables
  );
  const names=rows.map((row)=>row.TABLE_NAME);
  console.log(JSON.stringify({ok:true,tables:names,count:names.length},null,2));
  if(names.length!==expectedTables.length) {
    const missing = expectedTables.filter(t => !names.includes(t));
    throw new Error(`CMS schema verification failed. Missing: ${missing.join(", ")}`);
  }
} finally {
  await connection.end();
}
