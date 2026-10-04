import { cmsExecute, cmsQuery, isCmsDatabaseConfigured } from "@/lib/cms/db";

let tablesEnsured = false;

export async function ensureOffPageTablesExist(): Promise<void> {
  if (tablesEnsured || !isCmsDatabaseConfigured()) return;

  try {
    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_opportunities (
        id VARCHAR(64) PRIMARY KEY,
        site_name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) NOT NULL,
        exact_submission_url TEXT NOT NULL,
        region VARCHAR(50) NOT NULL DEFAULT 'GLOBAL',
        country VARCHAR(100) NULL,
        category VARCHAR(100) NOT NULL,
        free_status VARCHAR(50) NOT NULL DEFAULT 'FREE',
        free_tier_details TEXT NULL,
        requires_account BOOLEAN NOT NULL DEFAULT FALSE,
        requires_editorial_review BOOLEAN NOT NULL DEFAULT TRUE,
        submission_type VARCHAR(100) NOT NULL DEFAULT 'FORM',
        recommended_dgs_target_page VARCHAR(512) NOT NULL,
        recommended_service VARCHAR(255) NOT NULL,
        recommended_content TEXT NULL,
        recommended_anchor_strategy VARCHAR(255) NOT NULL DEFAULT 'BRANDED',
        link_type VARCHAR(50) NOT NULL DEFAULT 'EDITORIAL',
        dofollow_status VARCHAR(50) NOT NULL DEFAULT 'DOFOLLOW',
        estimated_quality VARCHAR(30) NOT NULL DEFAULT 'HIGH',
        topical_relevance INT NOT NULL DEFAULT 80,
        geo_relevance INT NOT NULL DEFAULT 85,
        traffic_potential INT NOT NULL DEFAULT 70,
        editorial_quality INT NOT NULL DEFAULT 80,
        spam_risk INT NOT NULL DEFAULT 10,
        acceptance_probability INT NOT NULL DEFAULT 75,
        value_score INT NOT NULL DEFAULT 80,
        difficulty_score INT NOT NULL DEFAULT 40,
        priority_score INT NOT NULL DEFAULT 80,
        priority_tier VARCHAR(10) NOT NULL DEFAULT 'P1',
        authority_score INT NOT NULL DEFAULT 75,
        spam_status VARCHAR(30) NOT NULL DEFAULT 'SAFE',
        verification_date DATE NULL,
        last_verified DATETIME NULL,
        source VARCHAR(100) NOT NULL DEFAULT 'CURATED',
        status VARCHAR(50) NOT NULL DEFAULT 'NEW',
        assigned_to VARCHAR(255) NULL,
        notes TEXT NULL,
        evidence TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_opo_domain (domain),
        INDEX idx_opo_region (region),
        INDEX idx_opo_category (category),
        INDEX idx_opo_free_status (free_status),
        INDEX idx_opo_status (status),
        INDEX idx_opo_priority (priority_tier),
        INDEX idx_opo_spam (spam_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_backlinks (
        id VARCHAR(64) PRIMARY KEY,
        source_domain VARCHAR(255) NOT NULL,
        source_url VARCHAR(1024) NOT NULL,
        source_page_title VARCHAR(512) NULL,
        target_url VARCHAR(1024) NOT NULL,
        target_page_type VARCHAR(100) NOT NULL,
        anchor_text VARCHAR(512) NOT NULL,
        anchor_classification VARCHAR(50) NOT NULL DEFAULT 'BRANDED',
        link_rel VARCHAR(255) NOT NULL DEFAULT 'dofollow',
        dofollow BOOLEAN NOT NULL DEFAULT TRUE,
        nofollow BOOLEAN NOT NULL DEFAULT FALSE,
        ugc BOOLEAN NOT NULL DEFAULT FALSE,
        sponsored BOOLEAN NOT NULL DEFAULT FALSE,
        unknown_link_type BOOLEAN NOT NULL DEFAULT FALSE,
        first_seen_at DATETIME NOT NULL,
        last_seen_at DATETIME NOT NULL,
        last_checked_at DATETIME NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'LIVE',
        http_status INT NOT NULL DEFAULT 200,
        redirect_chain TEXT NULL,
        source_indexable BOOLEAN NOT NULL DEFAULT TRUE,
        source_canonical VARCHAR(1024) NULL,
        source_country VARCHAR(100) NULL,
        source_region VARCHAR(50) NOT NULL DEFAULT 'GLOBAL',
        source_language VARCHAR(50) NOT NULL DEFAULT 'en',
        topical_category VARCHAR(100) NOT NULL DEFAULT 'Digital Marketing',
        topical_relevance_score INT NOT NULL DEFAULT 80,
        editorial_quality_score INT NOT NULL DEFAULT 80,
        geo_relevance_score INT NOT NULL DEFAULT 85,
        spam_risk_score INT NOT NULL DEFAULT 5,
        authority_score INT NOT NULL DEFAULT 80,
        placement_type VARCHAR(100) NOT NULL DEFAULT 'CONTENT',
        link_location VARCHAR(100) NOT NULL DEFAULT 'BODY',
        referral_sessions INT NOT NULL DEFAULT 0,
        referral_leads INT NOT NULL DEFAULT 0,
        campaign_id VARCHAR(64) NULL,
        outreach_id VARCHAR(64) NULL,
        evidence_url VARCHAR(1024) NULL,
        screenshot_path VARCHAR(512) NULL,
        notes TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_opb_domain (source_domain),
        INDEX idx_opb_status (status),
        INDEX idx_opb_target (target_url(255)),
        INDEX idx_opb_region (source_region),
        INDEX idx_opb_anchor (anchor_classification)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_competitor_domains (
        id VARCHAR(64) PRIMARY KEY,
        competitor_name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) NOT NULL,
        region VARCHAR(50) NOT NULL,
        primary_niche VARCHAR(255) NOT NULL,
        tracked_since DATETIME NOT NULL,
        estimated_referring_domains INT NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_opcd_region (region),
        INDEX idx_opcd_domain (domain)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_competitor_gaps (
        id VARCHAR(64) PRIMARY KEY,
        competitor_id VARCHAR(64) NOT NULL,
        competitor_domain VARCHAR(255) NOT NULL,
        source_domain VARCHAR(255) NOT NULL,
        source_url VARCHAR(1024) NOT NULL,
        target_page_type VARCHAR(100) NOT NULL,
        gap_type VARCHAR(100) NOT NULL,
        region VARCHAR(50) NOT NULL,
        relevance_score INT NOT NULL DEFAULT 80,
        quality_score INT NOT NULL DEFAULT 80,
        difficulty_score INT NOT NULL DEFAULT 50,
        opportunity_id VARCHAR(64) NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'IDENTIFIED',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_opcg_comp (competitor_domain),
        INDEX idx_opcg_src (source_domain),
        INDEX idx_opcg_region (region),
        INDEX idx_opcg_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_brand_mentions (
        id VARCHAR(64) PRIMARY KEY,
        brand_query VARCHAR(255) NOT NULL,
        mention_url VARCHAR(1024) NOT NULL,
        mention_title VARCHAR(512) NULL,
        snippet TEXT NULL,
        is_linked BOOLEAN NOT NULL DEFAULT FALSE,
        linked_url VARCHAR(1024) NULL,
        mention_type VARCHAR(50) NOT NULL DEFAULT 'UNLINKED_MENTION',
        sentiment VARCHAR(50) NOT NULL DEFAULT 'POSITIVE',
        authority_signals JSON NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'NEW',
        detected_at DATETIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_opbm_type (mention_type),
        INDEX idx_opbm_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_outreach (
        id VARCHAR(64) PRIMARY KEY,
        opportunity_id VARCHAR(64) NULL,
        contact_name VARCHAR(255) NULL,
        publication VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        linkedin VARCHAR(512) NULL,
        contact_url VARCHAR(1024) NULL,
        assigned_staff VARCHAR(255) NULL,
        stage VARCHAR(50) NOT NULL DEFAULT 'NEW',
        pitch_type VARCHAR(100) NOT NULL DEFAULT 'RESOURCE_SUGGESTION',
        pitch_subject VARCHAR(512) NULL,
        pitch_body TEXT NULL,
        response TEXT NULL,
        first_contact DATETIME NULL,
        last_contact DATETIME NULL,
        next_follow_up DATETIME NULL,
        submission_url VARCHAR(1024) NULL,
        live_url VARCHAR(1024) NULL,
        target_page VARCHAR(512) NOT NULL,
        result VARCHAR(255) NULL,
        proof TEXT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_opo_stage (stage),
        INDEX idx_opo_opp (opportunity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_citations (
        id VARCHAR(64) PRIMARY KEY,
        platform_name VARCHAR(255) NOT NULL,
        listing_url VARCHAR(1024) NULL,
        region VARCHAR(50) NOT NULL,
        country VARCHAR(100) NOT NULL,
        business_name_displayed VARCHAR(255) NULL,
        website_displayed VARCHAR(512) NULL,
        phone_displayed VARCHAR(100) NULL,
        location_displayed VARCHAR(512) NULL,
        nap_status VARCHAR(50) NOT NULL DEFAULT 'CONSISTENT',
        nap_issues TEXT NULL,
        last_audited_at DATETIME NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_opc_region (region),
        INDEX idx_opc_nap (nap_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_reviews (
        id VARCHAR(64) PRIMARY KEY,
        platform_name VARCHAR(255) NOT NULL,
        profile_url VARCHAR(1024) NOT NULL,
        region VARCHAR(50) NOT NULL,
        review_count INT NOT NULL DEFAULT 0,
        rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
        last_review_date DATE NULL,
        profile_status VARCHAR(50) NOT NULL DEFAULT 'CLAIMED',
        reply_status VARCHAR(50) NOT NULL DEFAULT 'ALL_REPLIED',
        notes TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_opr_region (region)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_monthly_reports (
        id VARCHAR(64) PRIMARY KEY,
        report_month VARCHAR(7) NOT NULL,
        report_title VARCHAR(255) NOT NULL,
        report_type VARCHAR(100) NOT NULL DEFAULT 'MONTHLY_EXECUTIVE',
        summary_metrics JSON NOT NULL,
        regional_metrics JSON NOT NULL,
        target_page_metrics JSON NOT NULL,
        outreach_metrics JSON NOT NULL,
        pr_metrics JSON NOT NULL,
        aeo_geo_llm_metrics JSON NOT NULL,
        competitor_gap_metrics JSON NOT NULL,
        risk_metrics JSON NOT NULL,
        next_month_plan JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_opmr_month (report_month)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_alerts (
        id VARCHAR(64) PRIMARY KEY,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        entity_type VARCHAR(50) NULL,
        entity_id VARCHAR(64) NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_opa_type (alert_type),
        INDEX idx_opa_read (is_read),
        INDEX idx_opa_created (created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_target_pages (
        id VARCHAR(64) PRIMARY KEY,
        page_url VARCHAR(512) NOT NULL UNIQUE,
        page_title VARCHAR(255) NOT NULL,
        target_page_type VARCHAR(100) NOT NULL,
        primary_focus VARCHAR(255) NOT NULL,
        priority_tier VARCHAR(10) NOT NULL DEFAULT 'P0',
        target_backlinks_goal INT NOT NULL DEFAULT 50,
        status VARCHAR(50) NOT NULL DEFAULT 'HEALTHY',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_optp_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_settings (
        id VARCHAR(64) PRIMARY KEY,
        key_name VARCHAR(100) NOT NULL UNIQUE,
        key_value TEXT NOT NULL,
        description VARCHAR(255) NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_automation_runs (
        id VARCHAR(64) PRIMARY KEY,
        run_type VARCHAR(50) NOT NULL,
        status VARCHAR(30) NOT NULL,
        started_at DATETIME NOT NULL,
        completed_at DATETIME NULL,
        summary JSON NULL,
        error_message TEXT NULL,
        INDEX idx_opar_type (run_type),
        INDEX idx_opar_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_vector_documents (
        id VARCHAR(64) PRIMARY KEY,
        vector_id BIGINT UNSIGNED NOT NULL,
        entity_type VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64) NOT NULL,
        content_hash VARCHAR(64) NOT NULL,
        embedding_model VARCHAR(64) NOT NULL,
        embedding_model_version VARCHAR(32) NOT NULL,
        embedding_dimension INT NOT NULL,
        index_name VARCHAR(64) NOT NULL,
        index_version INT NOT NULL DEFAULT 1,
        region VARCHAR(32) NULL,
        category VARCHAR(64) NULL,
        target_page VARCHAR(512) NULL,
        indexed_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        deleted_at DATETIME NULL,
        UNIQUE KEY uq_opvd_idx_vec (index_name, vector_id),
        UNIQUE KEY uq_opvd_idx_entity (index_name, entity_type, entity_id),
        INDEX idx_opvd_entity (entity_type, entity_id),
        INDEX idx_opvd_hash (content_hash),
        INDEX idx_opvd_region (region),
        INDEX idx_opvd_category (category),
        INDEX idx_opvd_deleted (deleted_at),
        INDEX idx_opvd_version (index_version)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Discovery runs history table (Section 13)
    await cmsExecute(`
      CREATE TABLE IF NOT EXISTS off_page_discovery_runs (
        run_id VARCHAR(64) PRIMARY KEY,
        provider VARCHAR(100) NOT NULL,
        started_at DATETIME NOT NULL,
        completed_at DATETIME NULL,
        queries_run INT NOT NULL DEFAULT 0,
        results_returned INT NOT NULL DEFAULT 0,
        valid_candidates INT NOT NULL DEFAULT 0,
        duplicates_rejected INT NOT NULL DEFAULT 0,
        spam_rejected INT NOT NULL DEFAULT 0,
        inserted_count INT NOT NULL DEFAULT 0,
        errors TEXT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
        details JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_opdr_started (started_at DESC),
        INDEX idx_opdr_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Column migrations on off_page_opportunities
    try {
      const { rows: cols } = await cmsQuery<{ Field: string }>(`SHOW COLUMNS FROM off_page_opportunities`);
      const colNames = new Set(cols.map(c => c.Field));

      if (!colNames.has("discovery_provider")) {
        await cmsExecute(`ALTER TABLE off_page_opportunities ADD COLUMN discovery_provider VARCHAR(100) NULL AFTER source`);
      }
      if (!colNames.has("discovery_query")) {
        await cmsExecute(`ALTER TABLE off_page_opportunities ADD COLUMN discovery_query VARCHAR(512) NULL AFTER discovery_provider`);
      }
      if (!colNames.has("http_status")) {
        await cmsExecute(`ALTER TABLE off_page_opportunities ADD COLUMN http_status INT NULL AFTER discovery_query`);
      }
      if (!colNames.has("verification_status")) {
        await cmsExecute(`ALTER TABLE off_page_opportunities ADD COLUMN verification_status VARCHAR(50) NULL AFTER http_status`);
      }
      if (!colNames.has("last_verified_at")) {
        await cmsExecute(`ALTER TABLE off_page_opportunities ADD COLUMN last_verified_at DATETIME NULL AFTER last_verified`);
      }
    } catch (colErr) {
      console.warn("Notice: Column migration warning on off_page_opportunities:", colErr);
    }

    // Default settings initialization if empty
    try {
      const { rows: countSettings } = await cmsQuery<{ total: number }>(`SELECT COUNT(*) as total FROM off_page_settings`);
      if (Number(countSettings[0]?.total || 0) === 0) {
        const defaultSettings = [
          ["set_daily_discovery_enabled", "daily_discovery_enabled", "true", "Enable daily automated discovery"],
          ["set_auto_revalidation_enabled", "auto_revalidation_enabled", "true", "Enable automated live URL verification"],
          ["set_discovery_provider", "discovery_provider", "GOOGLE_NEWS_RSS", "Active automated discovery provider"],
          ["set_primary_regions", "primary_regions", "INDIA,UAE,USA,GLOBAL", "Active geographic target regions"],
          ["set_free_only_enforcement", "free_only_enforcement", "true", "Strictly enforce free tier for opportunities"],
          ["set_spam_risk_threshold", "spam_risk_threshold", "40", "Maximum tolerable spam risk score"],
          ["set_exact_match_alert_pct", "exact_match_alert_pct", "20", "Penguin exact-match anchor concentration alert %"],
          ["set_default_outreach_followup_days", "default_outreach_followup_days", "5", "Default outreach follow-up cadence"],
        ];
        for (const [id, key, val, desc] of defaultSettings) {
          await cmsExecute(
            `INSERT INTO off_page_settings (id, key_name, key_value, description, updated_at) VALUES (?, ?, ?, ?, NOW())`,
            [id, key, val, desc]
          );
        }
      }
    } catch (settErr) {
      console.warn("Notice: Settings initialization warning:", settErr);
    }

    tablesEnsured = true;
  } catch (err) {
    console.error("Failed ensuring off_page tables exist:", err);
  }
}
