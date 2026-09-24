CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'editor',
  password_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media (
  id CHAR(36) PRIMARY KEY,
  storage_key VARCHAR(512) NOT NULL UNIQUE,
  url TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  alt_text TEXT,
  width INT,
  height INT,
  source VARCHAR(100) NOT NULL DEFAULT 'native',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS authors (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  bio TEXT,
  avatar_media_id CHAR(36),  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_authors_avatar FOREIGN KEY (avatar_media_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(512) NOT NULL,
  excerpt TEXT,
  content JSON NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  author_id CHAR(36),
  featured_media_id CHAR(36),
  featured_image_url VARCHAR(512) NULL,
  seo_title VARCHAR(255) NULL,
  seo_description TEXT NULL,
  focus_keyword VARCHAR(255) NULL,
  word_count INT NOT NULL DEFAULT 0,
  reading_time_minutes INT NOT NULL DEFAULT 3,
  needs_review BOOLEAN NOT NULL DEFAULT TRUE,
  scheduled_for DATETIME NULL,
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL,
  CONSTRAINT fk_blog_featured_media FOREIGN KEY (featured_media_id) REFERENCES media(id) ON DELETE SET NULL,
  INDEX idx_blog_posts_status (status),
  INDEX idx_blog_posts_published_at (published_at),
  INDEX idx_blog_posts_scheduled (scheduled_for),
  INDEX idx_blog_posts_needs_review (needs_review)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_revisions (
  id CHAR(36) PRIMARY KEY,
  blog_post_id CHAR(36) NOT NULL,
  snapshot JSON NOT NULL,
  created_by CHAR(36),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_revision_blog FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_revision_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_post_categories (
  blog_post_id CHAR(36) NOT NULL,
  category_id CHAR(36) NOT NULL,
  PRIMARY KEY (blog_post_id, category_id),
  CONSTRAINT fk_bpc_blog FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_bpc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_post_tags (
  blog_post_id CHAR(36) NOT NULL,
  tag_id CHAR(36) NOT NULL,
  PRIMARY KEY (blog_post_id, tag_id),
  CONSTRAINT fk_bpt_blog FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,  CONSTRAINT fk_bpt_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id CHAR(36) PRIMARY KEY,
  source_form_key VARCHAR(255),
  source_route VARCHAR(512),
  name VARCHAR(255),
  email VARCHAR(320),
  phone VARCHAR(100),
  company VARCHAR(255),
  payload JSON NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_leads_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_submissions (
  id CHAR(36) PRIMARY KEY,
  form_key VARCHAR(255) NOT NULL,
  source_route VARCHAR(512),
  payload JSON NOT NULL,
  lead_id CHAR(36),
  provider VARCHAR(100) NOT NULL DEFAULT 'native',
  provider_submission_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_form_submissions_created_at (created_at),
  CONSTRAINT fk_form_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS seo_metadata (
  id CHAR(36) PRIMARY KEY,
  entity_type VARCHAR(100) NOT NULL,
  entity_id CHAR(36) NOT NULL,
  title VARCHAR(512),
  description TEXT,
  canonical_url TEXT,
  robots_index BOOLEAN NOT NULL DEFAULT TRUE,
  robots_follow BOOLEAN NOT NULL DEFAULT TRUE,
  schema_json JSON,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_seo_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id CHAR(36),
  details JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_logs_created_at (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS career_jobs (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(512) NOT NULL,
  summary TEXT NOT NULL,
  employment_type VARCHAR(50) NOT NULL DEFAULT 'FULL_TIME',
  employment_label VARCHAR(100) NOT NULL DEFAULT 'Full-time',
  location VARCHAR(255) NOT NULL,
  workplace_type VARCHAR(100) NOT NULL DEFAULT 'On-site',
  schedule VARCHAR(255) NOT NULL,
  experience VARCHAR(255) NOT NULL,
  compensation VARCHAR(255) NOT NULL,
  overview TEXT NOT NULL,
  responsibilities JSON NOT NULL,
  requirements JSON NOT NULL,
  benefits JSON NOT NULL,
  creative_requirements JSON NULL,
  date_posted DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_career_jobs_active_date (active, date_posted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio_items (
  id CHAR(36) PRIMARY KEY,
  source_item_id VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(512),
  alt_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_portfolio_active_order (active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assessment_assignments (
  id CHAR(36) PRIMARY KEY,
  assessment_key VARCHAR(100) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(320) NOT NULL,
  candidate_phone VARCHAR(100) NOT NULL,
  experience VARCHAR(255),
  notice_period VARCHAR(255),
  expires_at DATETIME NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assessment_assignments_key (assessment_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id CHAR(36) PRIMARY KEY,
  assignment_id CHAR(36) NOT NULL,
  assessment_key VARCHAR(100) NOT NULL,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(320) NOT NULL,
  candidate_phone VARCHAR(100) NOT NULL,
  experience VARCHAR(255),
  notice_period VARCHAR(255),
  objective_score INT NOT NULL DEFAULT 0,
  objective_total INT NOT NULL DEFAULT 0,
  answers JSON NOT NULL,
  activity JSON NOT NULL,
  review_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT,
  started_at DATETIME NOT NULL,
  submitted_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assessment_attempts_key_date (assessment_key, created_at),
  INDEX idx_assessment_attempts_status (review_status),
  CONSTRAINT fk_assessment_attempt_assignment FOREIGN KEY (assignment_id) REFERENCES assessment_assignments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_assets (
  id CHAR(36) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  storage_path VARCHAR(512) NOT NULL,
  public_url VARCHAR(512) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  media_type VARCHAR(50) NOT NULL DEFAULT 'image',
  extension VARCHAR(20) NOT NULL,
  width INT NULL,
  height INT NULL,
  duration_seconds DECIMAL(10,2) NULL,
  file_size BIGINT NOT NULL,
  original_file_size BIGINT NOT NULL,
  optimised_file_size BIGINT NULL,
  alt_text TEXT NULL,
  is_decorative BOOLEAN NOT NULL DEFAULT FALSE,
  alt_source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
  title VARCHAR(255) NULL,
  caption TEXT NULL,
  description TEXT NULL,
  conversion_status VARCHAR(50) NOT NULL DEFAULT 'ready',
  conversion_error TEXT NULL,
  source VARCHAR(100) NOT NULL DEFAULT 'upload',
  source_id VARCHAR(255) NULL,
  checksum VARCHAR(64) NOT NULL,
  poster_url VARCHAR(512) NULL,
  original_storage_path VARCHAR(512) NULL,
  original_url VARCHAR(512) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_media_type (media_type),
  INDEX idx_media_checksum (checksum),
  INDEX idx_media_created_at (created_at),
  INDEX idx_media_category (category),
  INDEX idx_media_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_usage (
  id CHAR(36) PRIMARY KEY,
  media_id CHAR(36) NOT NULL,
  usage_type VARCHAR(50) NOT NULL DEFAULT 'page',
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  route VARCHAR(512) NOT NULL,
  field VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_usage_media (media_id),
  INDEX idx_media_usage_route (route),
  CONSTRAINT fk_media_usage_asset FOREIGN KEY (media_id) REFERENCES media_assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS google_search_updates (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  source VARCHAR(255) NOT NULL,
  source_url VARCHAR(1024) NOT NULL,
  published_at DATETIME NOT NULL,
  detected_at DATETIME NOT NULL,
  category VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  summary TEXT NOT NULL,
  impact_analysis TEXT NOT NULL,
  recommended_actions JSON NOT NULL,
  affected_dgs_areas JSON NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  assessment_status VARCHAR(50) NOT NULL DEFAULT 'NOT ASSESSED',
  assessment_date DATETIME NULL,
  evidence TEXT NULL,
  affected_pages JSON NULL,
  checks_performed JSON NULL,
  issues_found JSON NULL,
  recommendations JSON NULL,
  assessed_by VARCHAR(255) NULL,
  assessment_mode VARCHAR(50) DEFAULT 'automated',
  confidence DECIMAL(5,2) NULL,
  notified_at DATETIME NULL,
  reviewed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gsu_published (published_at),
  INDEX idx_gsu_severity_status (severity, status),
  INDEX idx_gsu_assessment_status (assessment_status),
  INDEX idx_gsu_source_url (source_url(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pagespeed_cache (
  id VARCHAR(64) PRIMARY KEY,
  url VARCHAR(512) NOT NULL,
  strategy VARCHAR(20) NOT NULL,
  performance_score INT NULL,
  accessibility_score INT NULL,
  best_practices_score INT NULL,
  seo_score INT NULL,
  fcp_ms INT NULL,
  lcp_ms INT NULL,
  cls_score DECIMAL(5,3) NULL,
  tbt_ms INT NULL,
  speed_index_ms INT NULL,
  field_inp_ms INT NULL,
  field_ttfb_ms INT NULL,
  field_lcp_ms INT NULL,
  field_cls DECIMAL(5,3) NULL,
  diagnostics JSON NULL,
  opportunities JSON NULL,
  tested_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_psi_url_strat (url(255), strategy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gsc_page_query_metrics (
  id VARCHAR(64) PRIMARY KEY,
  metric_date DATE NOT NULL,
  period_type VARCHAR(50) DEFAULT '28d',
  page_url VARCHAR(512) NOT NULL,
  query_text VARCHAR(512) NOT NULL,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  country VARCHAR(10) NULL,
  device VARCHAR(50) NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_gsc_pq_page (page_url(255)),
  INDEX idx_gsc_pq_query (query_text(255)),
  UNIQUE KEY uq_gsc_pq (metric_date, period_type, page_url(255), query_text(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS target_keywords (
  id VARCHAR(64) PRIMARY KEY,
  page_url VARCHAR(512) NOT NULL,
  keyword VARCHAR(512) NOT NULL,
  keyword_group VARCHAR(100) DEFAULT 'primary',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_target_page_kw (page_url(255), keyword(255)),
  INDEX idx_tk_page (page_url(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_audit_missing_alts (
  id VARCHAR(64) PRIMARY KEY,
  audit_run_id VARCHAR(64) NULL,
  page_url VARCHAR(512) NOT NULL,
  image_src TEXT NOT NULL,
  media_asset_id CHAR(36) NULL,
  filename VARCHAR(255) NOT NULL,
  current_alt TEXT NULL,
  surrounding_context TEXT NULL,
  alt_status VARCHAR(50) NOT NULL DEFAULT 'MISSING_ALT_ATTRIBUTE',
  is_decorative BOOLEAN DEFAULT FALSE,
  suggested_alt TEXT NULL,
  fixed_alt TEXT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  source_type VARCHAR(50) NOT NULL DEFAULT 'MIRRORED PAGE HTML',
  source_identifier VARCHAR(255) NULL,
  source_location TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sama_page (page_url(255)),
  INDEX idx_sama_resolved (resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_audit_runs (
  id VARCHAR(64) PRIMARY KEY,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  trigger_type VARCHAR(50) NOT NULL DEFAULT 'manual',
  total_pages INT NOT NULL DEFAULT 0,
  crawled_pages INT NOT NULL DEFAULT 0,
  discovered_url_count INT NOT NULL DEFAULT 0,
  crawled_url_count INT NOT NULL DEFAULT 0,
  failed_url_count INT NOT NULL DEFAULT 0,
  sitemap_error TEXT NULL,
  overall_score INT NOT NULL DEFAULT 0,
  technical_score INT NOT NULL DEFAULT 0,
  indexability_score INT NOT NULL DEFAULT 0,
  content_score INT NOT NULL DEFAULT 0,
  schema_score INT NOT NULL DEFAULT 0,
  media_score INT NOT NULL DEFAULT 0,
  performance_score INT NULL,
  links_score INT NOT NULL DEFAULT 0,
  critical_count INT NOT NULL DEFAULT 0,
  high_count INT NOT NULL DEFAULT 0,
  medium_count INT NOT NULL DEFAULT 0,
  low_count INT NOT NULL DEFAULT 0,
  info_count INT NOT NULL DEFAULT 0,
  started_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_runs_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_audit_pages (
  id VARCHAR(64) PRIMARY KEY,
  audit_run_id VARCHAR(64) NOT NULL,
  url VARCHAR(512) NOT NULL,
  status_code INT NOT NULL DEFAULT 200,
  response_time_ms INT NOT NULL DEFAULT 0,
  title TEXT NULL,
  meta_description TEXT NULL,
  canonical_url TEXT NULL,
  robots_meta VARCHAR(255) NULL,
  h1_count INT NOT NULL DEFAULT 1,
  h1_text TEXT NULL,
  schema_types JSON NULL,
  og_tags JSON NULL,
  images_count INT NOT NULL DEFAULT 0,
  missing_alt_count INT NOT NULL DEFAULT 0,
  internal_links_count INT NOT NULL DEFAULT 0,
  external_links_count INT NOT NULL DEFAULT 0,
  is_indexable TINYINT(1) NOT NULL DEFAULT 1,
  page_score INT NOT NULL DEFAULT 100,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_pages_run (audit_run_id),
  INDEX idx_audit_pages_url (url(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_audit_issues (
  id VARCHAR(64) PRIMARY KEY,
  audit_run_id VARCHAR(64) NOT NULL,
  page_id VARCHAR(64) NULL,
  url VARCHAR(512) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  issue_code VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_issues_run (audit_run_id),
  INDEX idx_audit_issues_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS gsc_query_metrics (
  id VARCHAR(64) PRIMARY KEY,
  query_text VARCHAR(512) NOT NULL,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  prev_position DECIMAL(5,2) NULL,
  prev_clicks INT DEFAULT 0,
  prev_impressions INT DEFAULT 0,
  period_type VARCHAR(50) DEFAULT '28d',
  updated_at DATETIME NOT NULL,
  INDEX idx_gsc_qm_clicks (clicks DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gsc_page_metrics (
  id VARCHAR(64) PRIMARY KEY,
  page_url VARCHAR(512) NOT NULL,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  prev_position DECIMAL(5,2) NULL,
  prev_clicks INT DEFAULT 0,
  prev_impressions INT DEFAULT 0,
  period_type VARCHAR(50) DEFAULT '28d',
  updated_at DATETIME NOT NULL,
  INDEX idx_gsc_pm_clicks (clicks DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gsc_page_query_metrics (
  id VARCHAR(64) PRIMARY KEY,
  metric_date DATE NOT NULL,
  period_type VARCHAR(50) DEFAULT '28d',
  page_url VARCHAR(512) NOT NULL,
  query_text VARCHAR(512) NOT NULL,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  prev_position DECIMAL(5,2) NULL,
  prev_clicks INT DEFAULT 0,
  prev_impressions INT DEFAULT 0,
  country VARCHAR(10) NULL,
  device VARCHAR(50) NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_gsc_pq_page (page_url(255)),
  INDEX idx_gsc_pq_query (query_text(255)),
  UNIQUE KEY uq_gsc_pq (metric_date, period_type, page_url(255), query_text(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gsc_ranking_snapshots (
  id VARCHAR(64) PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  entity_type VARCHAR(32) NOT NULL,
  identifier VARCHAR(512) NOT NULL,
  page_url VARCHAR(512) NULL,
  query_text VARCHAR(512) NULL,
  period_type VARCHAR(50) DEFAULT '28d',
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  created_at DATETIME NOT NULL,
  INDEX idx_snap_entity (entity_type, identifier(255)),
  INDEX idx_snap_date (snapshot_date),
  INDEX idx_snap_period (period_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
