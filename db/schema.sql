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
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL,
  CONSTRAINT fk_blog_featured_media FOREIGN KEY (featured_media_id) REFERENCES media(id) ON DELETE SET NULL,
  INDEX idx_blog_posts_status (status),
  INDEX idx_blog_posts_published_at (published_at)
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
