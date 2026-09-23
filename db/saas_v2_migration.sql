-- DGS CMS SaaS V2 Schema Migration
-- Idempotent, safe table creation

-- 1. Multi-User Authentication & RBAC
CREATE TABLE IF NOT EXISTS cms_users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(512) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'manager',
  avatar_url VARCHAR(512) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cms_users_role (role),
  INDEX idx_cms_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_roles (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_permissions (
  id VARCHAR(64) PRIMARY KEY,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT NULL,
  UNIQUE KEY uq_cms_res_act (resource, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_role_permissions (
  role_id VARCHAR(64) NOT NULL,
  permission_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  session_token_hash CHAR(64) NOT NULL UNIQUE,
  ip_address VARCHAR(100) NULL,
  user_agent VARCHAR(512) NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cms_sessions_user (user_id),
  INDEX idx_cms_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_password_resets (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  reset_token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cms_resets_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Superadmin-only Immutable Audit Log
CREATE TABLE IF NOT EXISTS cms_audit_log (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  actor_email VARCHAR(320) NOT NULL,
  role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255) NULL,
  summary TEXT NOT NULL,
  before_state JSON NULL,
  after_state JSON NULL,
  ip_address VARCHAR(100) NULL,
  user_agent VARCHAR(512) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cms_audit_created (created_at),
  INDEX idx_cms_audit_resource (resource, resource_id),
  INDEX idx_cms_audit_email (actor_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Top-Bar Notifications
CREATE TABLE IF NOT EXISTS cms_notifications (
  id VARCHAR(64) PRIMARY KEY,
  recipient_id VARCHAR(64) NULL,
  recipient_role VARCHAR(50) NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  link VARCHAR(512) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cms_notif_read (is_read, created_at),
  INDEX idx_cms_notif_role (recipient_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Google Connections (GSC & GA4)
CREATE TABLE IF NOT EXISTS google_connections (
  id VARCHAR(64) PRIMARY KEY,
  service VARCHAR(50) NOT NULL UNIQUE,
  property_id VARCHAR(255) NULL,
  account_email VARCHAR(320) NULL,
  encrypted_tokens TEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'disconnected',
  last_sync_at DATETIME NULL,
  last_successful_sync_at DATETIME NULL,
  last_error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gsc_sync_runs (
  id VARCHAR(64) PRIMARY KEY,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  started_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  error_message TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gsc_daily_metrics (
  id VARCHAR(64) PRIMARY KEY,
  metric_date DATE NOT NULL UNIQUE,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gsc_query_metrics (
  id VARCHAR(64) PRIMARY KEY,
  query_text VARCHAR(512) NOT NULL,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
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
  period_type VARCHAR(50) DEFAULT '28d',
  updated_at DATETIME NOT NULL,
  INDEX idx_gsc_pm_clicks (clicks DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ga4_sync_runs (
  id VARCHAR(64) PRIMARY KEY,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  started_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  error_message TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ga4_daily_metrics (
  id VARCHAR(64) PRIMARY KEY,
  metric_date DATE NOT NULL UNIQUE,
  active_users INT DEFAULT 0,
  sessions INT DEFAULT 0,
  engaged_sessions INT DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0,
  views INT DEFAULT 0,
  key_events INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ga4_page_metrics (
  id VARCHAR(64) PRIMARY KEY,
  page_path VARCHAR(512) NOT NULL,
  views INT DEFAULT 0,
  sessions INT DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0,
  period_type VARCHAR(50) DEFAULT '28d',
  updated_at DATETIME NOT NULL,
  INDEX idx_ga4_pm_views (views DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 15-Day Automated Website Audit Engine
CREATE TABLE IF NOT EXISTS site_audit_runs (
  id VARCHAR(64) PRIMARY KEY,
  status VARCHAR(50) NOT NULL DEFAULT 'running',
  trigger_type VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  total_pages INT NOT NULL DEFAULT 0,
  crawled_pages INT NOT NULL DEFAULT 0,
  overall_score INT NOT NULL DEFAULT 0,
  technical_score INT NOT NULL DEFAULT 0,
  indexability_score INT NOT NULL DEFAULT 0,
  content_score INT NOT NULL DEFAULT 0,
  schema_score INT NOT NULL DEFAULT 0,
  media_score INT NOT NULL DEFAULT 0,
  performance_score INT NOT NULL DEFAULT 0,
  links_score INT NOT NULL DEFAULT 0,
  critical_count INT NOT NULL DEFAULT 0,
  high_count INT NOT NULL DEFAULT 0,
  medium_count INT NOT NULL DEFAULT 0,
  low_count INT NOT NULL DEFAULT 0,
  info_count INT NOT NULL DEFAULT 0,
  started_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_created (created_at DESC)
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

-- 6. Google Update Compliance Engine
CREATE TABLE IF NOT EXISTS google_update_compliance (
  id VARCHAR(64) PRIMARY KEY,
  update_id VARCHAR(64) NOT NULL,
  site_component VARCHAR(100) NOT NULL,
  check_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'COMPLIANT',
  findings JSON NOT NULL,
  recommendation TEXT NULL,
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  last_checked_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_guc_update (update_id),
  INDEX idx_guc_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Assessment & HR Pipeline (Full port of 1.3.3)
CREATE TABLE IF NOT EXISTS assessment_jds (
  id VARCHAR(64) PRIMARY KEY,
  role_title VARCHAR(255) NOT NULL,
  role_level VARCHAR(50) NOT NULL DEFAULT 'mid',
  department VARCHAR(100) NOT NULL DEFAULT 'Engineering',
  jd_text MEDIUMTEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_jds_role (role_title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assessment_versions (
  id VARCHAR(64) PRIMARY KEY,
  jd_id VARCHAR(64) NOT NULL,
  version_number INT NOT NULL DEFAULT 1,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'mid',
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  focus_areas JSON NULL,
  admin_prompt_notes JSON NULL,
  test_data MEDIUMTEXT NOT NULL,
  approved_at DATETIME NULL,
  approved_by VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_versions_jd (jd_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assessment_candidates (
  id VARCHAR(64) PRIMARY KEY,
  assignment_id VARCHAR(64) NOT NULL,
  answers MEDIUMTEXT NOT NULL,
  objective_score INT NOT NULL DEFAULT 0,
  objective_total INT NOT NULL DEFAULT 0,
  role_match_score INT NOT NULL DEFAULT 0,
  evaluation_notes JSON NULL,
  activity_log JSON NULL,
  started_at DATETIME NOT NULL,
  submitted_at DATETIME NULL,
  review_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_candidates_assignment (assignment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hr_positions (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL DEFAULT 'General',
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  target_hire_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hr_pipeline (
  id VARCHAR(64) PRIMARY KEY,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(320) NOT NULL,
  candidate_phone VARCHAR(100) NOT NULL,
  position_id VARCHAR(64) NULL,
  stage VARCHAR(50) NOT NULL DEFAULT 'called',
  interview_notes TEXT NULL,
  offer_details JSON NULL,
  appointment_details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_hr_pipeline_stage (stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hr_documents (
  id VARCHAR(64) PRIMARY KEY,
  pipeline_id VARCHAR(64) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  storage_key VARCHAR(512) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hr_docs_pipeline (pipeline_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Media Categories and Tags
CREATE TABLE IF NOT EXISTS media_categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_tags (
  id VARCHAR(64) PRIMARY KEY,
  media_id VARCHAR(64) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_tags_media (media_id),
  INDEX idx_media_tags_tag (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
