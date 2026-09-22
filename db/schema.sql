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
  notified_at DATETIME NULL,
  reviewed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gsu_published (published_at),
  INDEX idx_gsu_severity_status (severity, status),
  INDEX idx_gsu_source_url (source_url(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

