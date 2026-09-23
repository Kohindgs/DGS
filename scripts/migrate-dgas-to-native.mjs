#!/usr/bin/env node
import mysql from "mysql2/promise";
import crypto from "node:crypto";

const DB_CONFIG = {
  host: process.env.DGS_MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.DGS_MYSQL_PORT || 3306),
  user: process.env.DGS_MYSQL_USER || "u188101251_nodtii",
  password: process.env.DGS_MYSQL_PASSWORD || "Yh5_S_6iTd",
  database: process.env.DGS_MYSQL_DATABASE || "u188101251_nodtii",
};

async function run() {
  console.log("=== MIGRATING ARCHIVED DGAS DATA TO NATIVE ASSESSMENT & HR PIPELINE ===");
  const conn = await mysql.createConnection(DB_CONFIG);

  // 1. JDs
  const [jds] = await conn.query("SELECT * FROM wpcl_dgas_jds");
  console.log(`Found ${jds.length} JDs in wpcl_dgas_jds`);
  let jdsMigrated = 0;
  for (const jd of jds) {
    const jdId = String(jd.id);
    const [exists] = await conn.query("SELECT id FROM assessment_jds WHERE id = ?", [jdId]);
    if (!exists || exists.length === 0) {
      await conn.query(
        `INSERT INTO assessment_jds (id, role_title, role_level, department, jd_text, status, created_at)
         VALUES (?, ?, ?, 'Operations', ?, 'active', ?)`,
        [jdId, jd.title || "Untitled Role", jd.role_level || "mid", jd.content || "", jd.created_at || new Date()]
      );
      jdsMigrated++;
    }
  }
  console.log(`Migrated ${jdsMigrated} JDs into assessment_jds`);

  // 2. Versions
  const [versions] = await conn.query("SELECT * FROM wpcl_dgas_versions");
  console.log(`Found ${versions.length} versions in wpcl_dgas_versions`);
  let verMigrated = 0;
  for (const v of versions) {
    const vId = String(v.id);
    const [exists] = await conn.query("SELECT id FROM assessment_versions WHERE id = ?", [vId]);
    if (!exists || exists.length === 0) {
      const focusAreas = v.note_focus_areas ? JSON.stringify(v.note_focus_areas) : null;
      const promptNotes = JSON.stringify({
        difficulty: v.note_difficulty,
        mcq_count: v.note_mcq_count,
        short_count: v.note_short_count,
        long_count: v.note_long_count,
        free_text: v.note_free_text,
      });

      await conn.query(
        `INSERT INTO assessment_versions (id, jd_id, version_number, difficulty, status, focus_areas, admin_prompt_notes, test_data, approved_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vId,
          String(v.jd_id),
          v.version_number || 1,
          v.note_difficulty || "mid",
          v.status || "draft",
          focusAreas,
          promptNotes,
          typeof v.test_data === "string" ? v.test_data : JSON.stringify(v.test_data || {}),
          v.approved_at || null,
          v.created_at || new Date(),
        ]
      );
      verMigrated++;
    }
  }
  console.log(`Migrated ${verMigrated} versions into assessment_versions`);

  // 3. Candidates and HR Pipeline
  const [candidates] = await conn.query("SELECT * FROM wpcl_dgas_candidates");
  console.log(`Found ${candidates.length} candidates in wpcl_dgas_candidates`);
  let candMigrated = 0;
  let hrMigrated = 0;

  for (const c of candidates) {
    const cId = String(c.id);
    const [exists] = await conn.query("SELECT id FROM assessment_candidates WHERE id = ?", [cId]);

    const answersObj = {
      psychometric: c.psychometric_answers,
      mcq: c.mcq_answers,
      short: c.short_answers,
      long: c.long_answers,
    };

    const evalNotes = {
      psychometric_profile: c.psychometric_profile,
      overall_recommendation: c.overall_recommendation,
      role_match_summary: c.role_match_summary,
      cv_url: c.cv_url,
    };

    if (!exists || exists.length === 0) {
      await conn.query(
        `INSERT INTO assessment_candidates (
          id, assignment_id, answers, objective_score, objective_total,
          role_match_score, evaluation_notes, started_at, submitted_at,
          review_status, reviewer_notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cId,
          String(c.assignment_id || c.test_version_id || cId),
          JSON.stringify(answersObj),
          c.mcq_score || 0,
          c.mcq_total || 0,
          c.role_match_score || 0,
          JSON.stringify(evalNotes),
          c.submitted_at || new Date(),
          c.submitted_at || new Date(),
          c.hr_status || "pending",
          c.hr_notes || null,
          c.submitted_at || new Date(),
        ]
      );
      candMigrated++;
    }

    // Populate HR Pipeline
    const [hrExists] = await conn.query("SELECT id FROM hr_pipeline WHERE id = ?", [cId]);
    if (!hrExists || hrExists.length === 0) {
      // Map hr_status to standard stages
      let stage = "called";
      const s = String(c.hr_status || "").toLowerCase();
      if (s.includes("shortlist")) stage = "shortlisted";
      else if (s.includes("interview")) stage = "interview_done";
      else if (s.includes("select")) stage = "selected";
      else if (s.includes("offer")) stage = "offer_sent";
      else if (s.includes("reject")) stage = "rejected";
      else if (s.includes("onboard")) stage = "onboarded";
      else stage = "test_created";

      await conn.query(
        `INSERT INTO hr_pipeline (
          id, candidate_name, candidate_email, candidate_phone,
          stage, interview_notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          cId,
          c.name || "Candidate",
          c.email || "candidate@example.com",
          c.phone || "N/A",
          stage,
          c.hr_notes || `Imported from DGAS Assessment version #${c.test_version_id}. Score: ${c.mcq_score}/${c.mcq_total}.`,
          c.submitted_at || new Date(),
        ]
      );
      hrMigrated++;
    }
  }

  console.log(`Migrated ${candMigrated} candidates and ${hrMigrated} HR pipeline entries`);
  await conn.end();
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
