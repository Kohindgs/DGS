"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CareerApplicationForm.module.css";

export type CareerApplicationFormProps = {
  positions: string[];
  initialPosition?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CareerApplicationForm({
  positions,
  initialPosition = "",
}: CareerApplicationFormProps) {
  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // CV File State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Portfolio State
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  // Read URL query parameter "?position=..." on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const posParam = params.get("position");
      if (posParam) {
        const found = positions.find(
          (p) => p.toLowerCase() === posParam.toLowerCase(),
        );
        if (found) {
          setSelectedPosition(found);
        } else if (positions.some((p) => p.toLowerCase().includes(posParam.toLowerCase()))) {
          const match = positions.find((p) =>
            p.toLowerCase().includes(posParam.toLowerCase()),
          );
          if (match) setSelectedPosition(match);
        }
      }
    }
  }, [positions]);

  // Is creative requirement active for the chosen role?
  const isCreativeRole =
    selectedPosition.toLowerCase().includes("generative ai artist") ||
    selectedPosition.toLowerCase().includes("artist") ||
    selectedPosition.toLowerCase().includes("creative");

  function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage("CV file exceeds the 5 MB limit.");
        setStatus("error");
        return;
      }
      setResumeFile(file);
      setMessage("");
    }
  }

  function handlePortfolioFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setMessage("Portfolio PDF exceeds the 15 MB limit.");
        setStatus("error");
        return;
      }
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setMessage("Portfolio must be a PDF file.");
        setStatus("error");
        return;
      }
      setPortfolioFile(file);
      setMessage("");
    }
  }

  function removeResume() {
    setResumeFile(null);
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  }

  function removePortfolioFile() {
    setPortfolioFile(null);
    if (portfolioInputRef.current) portfolioInputRef.current.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    // CV validation
    if (!resumeFile) {
      setStatus("error");
      setMessage("Please attach your CV.");
      return;
    }

    // Role-specific creative requirement validation
    if (isCreativeRole) {
      const hasUrl = Boolean(portfolioUrl.trim());
      const hasFile = Boolean(portfolioFile);
      if (!hasUrl && !hasFile) {
        setStatus("error");
        setMessage("Please provide a portfolio link or upload your portfolio PDF.");
        return;
      }
    }

    // Explicitly attach files from state
    if (resumeFile) {
      formData.set("resume", resumeFile);
    }
    if (portfolioFile) {
      formData.set("portfolioFile", portfolioFile);
    }
    if (portfolioUrl.trim()) {
      formData.set("portfolioUrl", portfolioUrl.trim());
    }

    try {
      const response = await fetch("/api/career/apply", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        setStatus("error");
        setMessage(payload?.message || "Unable to submit your application.");
        return;
      }

      form.reset();
      setResumeFile(null);
      setPortfolioFile(null);
      setPortfolioUrl("");
      if (resumeInputRef.current) resumeInputRef.current.value = "";
      if (portfolioInputRef.current) portfolioInputRef.current.value = "";

      setStatus("success");
      setMessage(
        payload.message ||
          "Thank you! Your application and files have been securely received. Our recruitment team will review your profile.",
      );
    } catch (err) {
      console.error("Submission failed:", err);
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        {/* First & Last Name */}
        <label>
          First Name *
          <input
            name="firstName"
            placeholder="e.g. Priya"
            autoComplete="given-name"
            required
          />
        </label>
        <label>
          Last Name *
          <input
            name="lastName"
            placeholder="e.g. Shah"
            autoComplete="family-name"
            required
          />
        </label>

        {/* Email & Phone */}
        <label>
          Email Address *
          <input
            name="email"
            type="email"
            placeholder="e.g. priya@example.com"
            autoComplete="email"
            required
          />
        </label>
        <label>
          Phone Number *
          <input
            name="phone"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            autoComplete="tel"
            required
          />
        </label>

        {/* Position */}
        <label className={styles.fullWidth}>
          Position *
          <select
            name="position"
            required
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
          >
            <option value="" disabled>
              Select a position
            </option>
            {positions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
            <option value="General Application">General Application</option>
          </select>
        </label>

        {/* Location & Current Employer */}
        <label>
          Current Location *
          <input
            name="location"
            placeholder="e.g. Khar West / Mumbai"
            required
          />
        </label>
        <label>
          Current Company / Employer
          <input
            name="company"
            placeholder="e.g. Previous Agency / Fresher"
          />
        </label>

        {/* Experience & Education */}
        <label>
          Relevant Experience *
          <input
            name="experience"
            placeholder="e.g. 1 Year 6 Months"
            required
          />
        </label>
        <label>
          Highest Education *
          <select name="education" required defaultValue="12th Pass">
            <option value="12th Pass">12th Pass</option>
            <option value="Diploma">Diploma / Vocational</option>
            <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
            <option value="Master's Degree">Master&apos;s Degree</option>
            <option value="Other">Other</option>
          </select>
        </label>

        {/* Salary Expectation & Notice Period */}
        <label>
          Current Monthly Salary (INR)
          <input
            name="currentSalary"
            placeholder="e.g. ₹12,000 / month"
          />
        </label>
        <label>
          Expected Monthly Salary (INR)
          <input
            name="expectedSalary"
            placeholder="e.g. ₹15,000 / month"
          />
        </label>
        <label className={styles.fullWidth}>
          Notice Period
          <input
            name="noticePeriod"
            placeholder="e.g. Immediate / 15 Days / 1 Month"
          />
        </label>

        {/* Dynamic Creative Requirement Section */}
        {isCreativeRole ? (
          <div className={styles.creativeBox}>
            <div className={styles.creativeHeader}>
              <div>
                <span className={styles.creativeBadge}>Mandatory Requirement</span>
                <h3 className={styles.creativeTitle}>Portfolio Submission</h3>
                <p className={styles.creativeSub}>
                  Please provide examples of your AI-generated image and/or AI-generated video work.
                </p>
              </div>
            </div>

            <p className={styles.creativeRuleAlert}>
              Please provide a portfolio link or upload your portfolio PDF.
            </p>

            <div className={styles.optionsRow}>
              {/* Option A: URL */}
              <div className={styles.optionCard}>
                <span className={styles.optionLabel}>Option A &bull; Portfolio Link</span>
                <input
                  type="url"
                  placeholder="https://behance.net/... or ArtStation, Drive, Notion"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                />
              </div>

              <div className={styles.orDivider}>OR</div>

              {/* Option B: PDF File Upload */}
              <div className={styles.optionCard}>
                <span className={styles.optionLabel}>Option B &bull; Upload Portfolio PDF</span>
                {portfolioFile ? (
                  <div className={styles.fileCard}>
                    <div className={styles.fileMeta}>
                      <span className={styles.fileName}>{portfolioFile.name}</span>
                      <span className={styles.fileSize}>
                        {formatFileSize(portfolioFile.size)} &bull; PDF
                      </span>
                    </div>
                    <div className={styles.fileActions}>
                      <button
                        type="button"
                        className={styles.fileBtn}
                        onClick={() => portfolioInputRef.current?.click()}
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        className={`${styles.fileBtn} ${styles.fileBtnDanger}`}
                        onClick={removePortfolioFile}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={styles.dropzoneButton}>
                    <span>Choose PDF File (up to 15 MB)</span>
                  </label>
                )}
                <input
                  ref={portfolioInputRef}
                  type="file"
                  accept=".pdf"
                  className={styles.dropzoneInput}
                  onChange={handlePortfolioFileChange}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* CV Upload */}
        <div className={styles.fullWidth}>
          <label>Attach Resume / CV *</label>
          {resumeFile ? (
            <div className={styles.fileCard}>
              <div className={styles.fileMeta}>
                <span className={styles.fileName}>{resumeFile.name}</span>
                <span className={styles.fileSize}>
                  {formatFileSize(resumeFile.size)} &bull; {resumeFile.name.split(".").pop()?.toUpperCase()}
                </span>
              </div>
              <div className={styles.fileActions}>
                <button
                  type="button"
                  className={styles.fileBtn}
                  onClick={() => resumeInputRef.current?.click()}
                >
                  Replace
                </button>
                <button
                  type="button"
                  className={`${styles.fileBtn} ${styles.fileBtnDanger}`}
                  onClick={removeResume}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className={styles.dropzoneButton}>
              <span>Upload CV (.pdf, .doc, .docx &bull; max 5 MB)</span>
            </label>
          )}
          <input
            ref={resumeInputRef}
            name="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            className={styles.dropzoneInput}
            onChange={handleResumeChange}
          />
        </div>
      </div>

      {/* Consent */}
      <label className={styles.consent}>
        <input name="consent" type="checkbox" value="yes" required />
        <span>
          I consent to D&apos;Genius Solutions storing my submitted details and files
          for recruitment evaluation and contacting me about this application.
        </span>
      </label>

      {/* Submit Button */}
      <button
        className={styles.submit}
        type="submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Submitting Application..." : "Submit Application"}
      </button>

      {/* Status Messages */}
      {message ? (
        <p
          className={status === "success" ? styles.success : styles.error}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
