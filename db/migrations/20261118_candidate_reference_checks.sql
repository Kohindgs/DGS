-- ============================================================================
-- DGS CANDIDATE REFERENCE CHECK SYSTEM TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS candidate_reference_checks (
  id VARCHAR(64) PRIMARY KEY,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255) NULL,
  candidate_phone VARCHAR(64) NULL,
  candidate_position VARCHAR(255) NULL,
  last_company VARCHAR(255) NOT NULL,
  last_designation VARCHAR(255) NOT NULL,
  last_employment_dates VARCHAR(255) NULL,
  cv_filename VARCHAR(255) NULL,
  cv_text_summary TEXT NULL,
  claimed_responsibilities JSON NULL,
  claimed_achievements JSON NULL,
  poc_name VARCHAR(255) NOT NULL,
  poc_designation VARCHAR(255) NOT NULL,
  poc_email VARCHAR(255) NOT NULL,
  poc_phone VARCHAR(64) NULL,
  secure_token VARCHAR(128) UNIQUE NOT NULL,
  token_expires_at DATETIME NULL,
  status ENUM('pending', 'submitted', 'expired') DEFAULT 'pending',
  questions JSON NOT NULL,
  responses JSON NULL,
  comparison_feedback JSON NULL,
  sent_at DATETIME NULL,
  submitted_at DATETIME NULL,
  created_by VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_crc_status (status),
  INDEX idx_crc_token (secure_token),
  INDEX idx_crc_candidate (candidate_name),
  INDEX idx_crc_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
