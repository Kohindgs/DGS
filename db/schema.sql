CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  password_hash text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key text NOT NULL UNIQUE,
  url text NOT NULL,
  mime_type text NOT NULL,
  alt_text text,
  width integer,
  height integer,
  source text NOT NULL DEFAULT 'native',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE authors
  ADD COLUMN IF NOT EXISTS avatar_media_id uuid REFERENCES media(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',  author_id uuid REFERENCES authors(id) ON DELETE SET NULL,
  featured_media_id uuid REFERENCES media(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  snapshot jsonb NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_post_categories (
  blog_post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, category_id)
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  blog_post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, tag_id)
);
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_form_key text,
  source_route text,
  name text,
  email text,
  phone text,
  company text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_key text NOT NULL,
  source_route text,
  payload jsonb NOT NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'native',
  provider_submission_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);
CREATE TABLE IF NOT EXISTS seo_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  title text,
  description text,
  canonical_url text,
  robots_index boolean NOT NULL DEFAULT true,
  robots_follow boolean NOT NULL DEFAULT true,
  schema_json jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);