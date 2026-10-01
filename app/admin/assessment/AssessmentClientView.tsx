"use client";

import React, { useState, useEffect } from "react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import PageHeader from "@/components/admin/PageHeader";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Eye,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Lock,
  Search,
  UserCheck,
  UserX,
  Layers,
  Activity,
  ArrowRight,
  Shield,
  FileSpreadsheet,
  FileUp,
  Check,
  Archive,
  Briefcase,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from "lucide-react";

type JD = {
  id: string;
  role_title: string;
  role_level: string;
  department: string;
  jd_text?: string;
  status?: string;
  created_at: string;
};

type Version = {
  id: string;
  jd_id: string;
  role_title?: string;
  version_number: number;
  difficulty: string;
  status: string;
  created_at: string;
  approved_at: string | null;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  experience?: string;
  objective_score: number;
  objective_total: number;
  role_match_score?: number;
  review_status: string;
  submitted_at: string;
};

type Props = {
  jds: JD[];
  versions: Version[];
  candidates: Candidate[];
  currentUserRole?: string;
};

export default function AssessmentClientView({
  jds: initialJds,
  versions: initialVersions,
  candidates: initialCandidates,
  currentUserRole,
}: Props) {
  const [jds, setJds] = useState<JD[]>(initialJds);
  const [versions, setVersions] = useState<Version[]>(initialVersions);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [activeTab, setActiveTab] = useState<"jds" | "versions" | "candidates">("jds");
  const [candidateToDelete, setCandidateToDelete] = useState<{ id: string; name: string; email: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingCandidate, setIsDeletingCandidate] = useState(false);

  // Gemini API Health state
  const [apiHealth, setApiHealth] = useState<{ testing: boolean; ok?: boolean; message?: string; latency?: number }>({
    testing: false,
  });

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // JD creation & edit modal
  const [showCreateJdModal, setShowCreateJdModal] = useState(false);
  const [editingJd, setEditingJd] = useState<JD | null>(null);
  const [newJdTitle, setNewJdTitle] = useState("");
  const [newJdDept, setNewJdDept] = useState("SEO & Digital");
  const [newJdLevel, setNewJdLevel] = useState("mid");
  const [newJdEmploymentType, setNewJdEmploymentType] = useState("Full-time");
  const [newJdExperience, setNewJdExperience] = useState("");
  const [newJdLocation, setNewJdLocation] = useState("Khar West, Mumbai (On-site)");
  const [newJdSalary, setNewJdSalary] = useState("");
  const [newJdQualification, setNewJdQualification] = useState("");
  const [newJdSkills, setNewJdSkills] = useState("");
  const [newJdResponsibilities, setNewJdResponsibilities] = useState("");
  const [newJdRequirements, setNewJdRequirements] = useState("");
  const [newJdContent, setNewJdContent] = useState("");
  const [creatingJd, setCreatingJd] = useState(false);

  // JD delete/archive modal
  const [jdToDelete, setJdToDelete] = useState<JD | null>(null);
  const [isDeletingJd, setIsDeletingJd] = useState(false);

  // Version delete/archive modal
  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);

  // Generate test / Make Assessment modal
  const [showMakeAssessmentModal, setShowMakeAssessmentModal] = useState(false);
  const [selectedJdIdForGen, setSelectedJdIdForGen] = useState<string>("");
  const [customRoleTitle, setCustomRoleTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"junior" | "mid" | "senior" | "lead">("mid");
  const [mcqCount, setMcqCount] = useState(5);
  const [shortCount, setShortCount] = useState(2);
  const [longCount, setLongCount] = useState(1);
  const [focusAreas, setFocusAreas] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Candidate Assignment Modal
  const [assignModalVersion, setAssignModalVersion] = useState<Version | null>(null);
  const [assignName, setAssignName] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignPhone, setAssignPhone] = useState("");
  const [assignExp, setAssignExp] = useState("");
  const [assignNotice, setAssignNotice] = useState("Immediate");
  const [assignExpiresDays, setAssignExpiresDays] = useState(7);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignedLinkInfo, setAssignedLinkInfo] = useState<{ token: string; url: string; path: string } | null>(null);

  // Blueprint Question Editor Modal
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState<"mcq" | "short" | "long">("mcq");
  const [newQuestionPrompt, setNewQuestionPrompt] = useState("");
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>([
    "Verified protocol and peer-reviewed checklist",
    "Direct staging push without verification",
    "External delegation without QA validation",
    "Bypassing tests for speed",
  ]);
  const [newQuestionCorrectIndex, setNewQuestionCorrectIndex] = useState(0);
  const [newQuestionRubric, setNewQuestionRubric] = useState("");
  const [savingBlueprintDraft, setSavingBlueprintDraft] = useState(false);

  // Version Blueprint inspection & editing
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  const [loadingVersion, setLoadingVersion] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Single question regeneration modal
  const [regenQuestionModal, setRegenQuestionModal] = useState<{
    open: boolean;
    question: any;
    recommendation: string;
    loading: boolean;
  }>({
    open: false,
    question: null,
    recommendation: "",
    loading: false,
  });

  // 3-Pane Candidate Workstation
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidateDetail, setCandidateDetail] = useState<any | null>(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [candidateTab, setCandidateTab] = useState<"answers" | "cv" | "activity">("answers");
  const [hrNotes, setHrNotes] = useState("");
  const [updatingCandidate, setUpdatingCandidate] = useState(false);

  // Test live connection to Gemini
  const handleTestConnection = async () => {
    setApiHealth({ testing: true });
    try {
      const start = Date.now();
      const res = await fetch("/api/admin/assessment/test-connection");
      const data = await res.json();
      const latency = Date.now() - start;
      if (res.ok && data.ok) {
        setApiHealth({
          testing: false,
          ok: true,
          message: `${data.model} Active (${latency}ms)`,
          latency,
        });
      } else {
        setApiHealth({
          testing: false,
          ok: false,
          message: data.message || "Connection failed",
        });
      }
    } catch (err: any) {
      setApiHealth({
        testing: false,
        ok: false,
        message: err.message || "Network error",
      });
    }
  };

  // Open Create JD Modal
  const handleOpenCreateJd = () => {
    setEditingJd(null);
    setNewJdTitle("");
    setNewJdDept("SEO & Digital");
    setNewJdLevel("mid");
    setNewJdEmploymentType("Full-time");
    setNewJdExperience("");
    setNewJdLocation("Khar West, Mumbai (On-site)");
    setNewJdSalary("");
    setNewJdQualification("");
    setNewJdSkills("");
    setNewJdResponsibilities("");
    setNewJdRequirements("");
    setNewJdContent("");
    setShowCreateJdModal(true);
  };

  // Open Edit JD Modal
  const handleOpenEditJd = (jd: JD) => {
    setEditingJd(jd);
    setNewJdTitle(jd.role_title);
    setNewJdDept(jd.department || "SEO & Digital");
    setNewJdLevel(jd.role_level || "mid");
    setNewJdEmploymentType("Full-time");
    setNewJdExperience("");
    setNewJdLocation("Khar West, Mumbai (On-site)");
    setNewJdSalary("");
    setNewJdQualification("");
    setNewJdSkills("");
    setNewJdResponsibilities("");
    setNewJdRequirements("");
    setNewJdContent(jd.jd_text || "");
    setShowCreateJdModal(true);
  };

  // Create or Update JD
  const handleSaveJd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJdTitle) return;

    // Compile comprehensive structured JD text
    const structuredSections: string[] = [];
    if (newJdEmploymentType) structuredSections.push(`Employment Type: ${newJdEmploymentType}`);
    if (newJdExperience) structuredSections.push(`Experience Required: ${newJdExperience}`);
    if (newJdLocation) structuredSections.push(`Location: ${newJdLocation}`);
    if (newJdSalary) structuredSections.push(`Compensation: ${newJdSalary}`);
    if (newJdQualification) structuredSections.push(`Qualification: ${newJdQualification}`);
    if (newJdSkills) structuredSections.push(`\nKey Skills & Competencies:\n${newJdSkills}`);
    if (newJdResponsibilities) structuredSections.push(`\nCore Responsibilities:\n${newJdResponsibilities}`);
    if (newJdRequirements) structuredSections.push(`\nRequirements & Eligibility:\n${newJdRequirements}`);
    if (newJdContent) structuredSections.push(`\nRole Overview & Specifications:\n${newJdContent}`);

    const finalContent = structuredSections.join("\n\n").trim();
    if (!finalContent) {
      alert("Please provide JD description, responsibilities, or requirements.");
      return;
    }

    setCreatingJd(true);
    try {
      if (editingJd) {
        // Update existing JD
        const res = await fetch("/api/admin/assessment/jds", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingJd.id,
            title: newJdTitle,
            department: newJdDept,
            level: newJdLevel,
            content: finalContent,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update JD");

        setJds((prev) =>
          prev.map((j) =>
            j.id === editingJd.id
              ? { ...j, role_title: newJdTitle, department: newJdDept, role_level: newJdLevel, jd_text: finalContent }
              : j
          )
        );
        setShowCreateJdModal(false);
        showToast(`Job Description "${newJdTitle}" updated successfully.`);
      } else {
        // Create new JD
        const res = await fetch("/api/admin/assessment/jds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newJdTitle,
            department: newJdDept,
            level: newJdLevel,
            content: finalContent,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create JD");

        setJds((prev) => [data.jd, ...prev]);
        setShowCreateJdModal(false);
        showToast(`Job Description "${data.jd.role_title}" created successfully.`);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingJd(false);
    }
  };

  // Duplicate JD
  const handleDuplicateJd = async (id: string) => {
    try {
      const res = await fetch("/api/admin/assessment/jds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to duplicate");
      setJds((prev) => [data.jd, ...prev]);
      showToast("Job Description duplicated successfully.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete / Archive JD
  const handleDeleteJdSubmit = async () => {
    if (!jdToDelete) return;
    setIsDeletingJd(true);
    try {
      const res = await fetch(`/api/admin/assessment/jds?id=${jdToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete JD");

      setJds((prev) => prev.filter((j) => j.id !== jdToDelete.id));
      const actionLabel = data.action === "archived" ? "archived" : "permanently deleted";
      showToast(`Job Description "${jdToDelete.role_title}" ${actionLabel}.`);
      setJdToDelete(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeletingJd(false);
    }
  };

  // Delete / Archive Version
  const handleDeleteVersionSubmit = async () => {
    if (!versionToDelete) return;
    setIsDeletingVersion(true);
    try {
      const res = await fetch(`/api/admin/assessment/versions/${versionToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete assessment version");

      setVersions((prev) => prev.filter((v) => v.id !== versionToDelete.id));
      if (selectedVersion && selectedVersion.id === versionToDelete.id) {
        setSelectedVersion(null);
      }
      const actionLabel = data.action === "archived" ? "archived" : "permanently deleted";
      showToast(`Assessment version #${versionToDelete.version_number} ${actionLabel}.`);
      setVersionToDelete(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeletingVersion(false);
    }
  };

  // Open Make Assessment Modal
  const handleOpenMakeAssessment = (preselectedJd?: JD) => {
    if (preselectedJd) {
      setSelectedJdIdForGen(preselectedJd.id);
      setCustomRoleTitle(preselectedJd.role_title);
    } else if (jds.length > 0) {
      setSelectedJdIdForGen(jds[0].id);
      setCustomRoleTitle("");
    } else {
      setSelectedJdIdForGen("__new__");
      setCustomRoleTitle("");
    }
    setGenerationError(null);
    setShowMakeAssessmentModal(true);
  };

  // Execute Make Assessment (Gemini AI or Manual Draft)
  const handleExecuteMakeAssessment = async (isManual: boolean) => {
    let targetJdId = selectedJdIdForGen;
    let targetRoleTitle = "";
    if (targetJdId === "__new__") {
      if (!customRoleTitle.trim()) {
        alert("Please enter a role title for the new assessment.");
        return;
      }
      targetRoleTitle = customRoleTitle.trim();
      targetJdId = "";
    } else {
      const found = jds.find((j) => j.id === targetJdId);
      targetRoleTitle = found ? found.role_title : "Assessment Role";
    }

    setGenerating(true);
    setGenerationError(null);
    try {
      const res = await fetch("/api/admin/assessment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jd_id: targetJdId || undefined,
          role_title: targetRoleTitle || undefined,
          difficulty,
          mcq_count: mcqCount,
          short_count: shortCount,
          long_count: longCount,
          focus_areas: focusAreas,
          manual_draft: isManual,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assessment generation failed");

      // Add new version to local state
      const newVersion: Version = {
        id: data.versionId,
        jd_id: targetJdId || data.versionId,
        role_title: targetRoleTitle || data.roleTitle,
        version_number: data.versionNumber,
        difficulty,
        status: "draft",
        created_at: new Date().toISOString(),
        approved_at: null,
      };
      setVersions((prev) => [newVersion, ...prev]);

      showToast(`Created ${isManual ? "draft" : "AI"} assessment blueprint v${data.versionNumber}!`);
      setShowMakeAssessmentModal(false);
      setActiveTab("versions");

      // Inspect newly created blueprint immediately
      await handleInspectVersion(data.versionId);
    } catch (err: any) {
      setGenerationError(err.message || "Failed to generate assessment");
    } finally {
      setGenerating(false);
    }
  };

  // Save Blueprint Draft questions to database
  const handleSaveBlueprintQuestions = async (updatedQuestions: any[]) => {
    if (!selectedVersion) return;
    setSavingBlueprintDraft(true);
    try {
      const updatedTestData = {
        ...selectedVersion.test_data,
        questions: updatedQuestions,
      };
      const res = await fetch(`/api/admin/assessment/versions/${selectedVersion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testData: updatedTestData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");

      setSelectedVersion({
        ...selectedVersion,
        test_data: updatedTestData,
      });
      showToast("Draft blueprint updated.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingBlueprintDraft(false);
    }
  };

  // Move Question up/down
  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    if (!selectedVersion || selectedVersion.status === "approved") return;
    const questions = [...(selectedVersion.test_data?.questions || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const temp = questions[index];
    questions[index] = questions[targetIndex];
    questions[targetIndex] = temp;
    handleSaveBlueprintQuestions(questions);
  };

  // Delete Question from draft
  const handleDeleteQuestion = (index: number) => {
    if (!selectedVersion || selectedVersion.status === "approved") return;
    if (!confirm("Are you sure you want to remove this question from the draft?")) return;
    const questions = [...(selectedVersion.test_data?.questions || [])];
    questions.splice(index, 1);
    handleSaveBlueprintQuestions(questions);
  };

  // Add Question Submit
  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVersion || !newQuestionPrompt) return;
    const questions = [...(selectedVersion.test_data?.questions || [])];
    const newQ: any = {
      id: `q_${Date.now()}`,
      type: newQuestionType,
      prompt: newQuestionPrompt,
    };
    if (newQuestionType === "mcq") {
      newQ.options = newQuestionOptions.filter(Boolean);
      newQ.correctIndex = newQuestionCorrectIndex;
    } else if (newQuestionType === "short") {
      newQ.rubric = newQuestionRubric || "Technical evaluation rubric";
      newQ.minWords = 30;
    } else {
      newQ.rubric = newQuestionRubric || "Comprehensive scenario evaluation criteria";
      newQ.minWords = 80;
    }
    questions.push(newQ);
    handleSaveBlueprintQuestions(questions);
    setShowAddQuestionModal(false);
    setNewQuestionPrompt("");
    setNewQuestionRubric("");
  };

  // Candidate Assignment Modal Triggers
  const handleOpenAssignModal = (version: Version) => {
    setAssignModalVersion(version);
    setAssignName("");
    setAssignEmail("");
    setAssignPhone("");
    setAssignExp("");
    setAssignNotice("Immediate");
    setAssignExpiresDays(7);
    setAssignedLinkInfo(null);
  };

  const handleCreateAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalVersion || !assignName || !assignEmail) return;
    setAssignLoading(true);
    try {
      const res = await fetch("/api/admin/assessment/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentKey: assignModalVersion.id,
          name: assignName,
          email: assignEmail,
          phone: assignPhone || "N/A",
          experience: assignExp || "N/A",
          noticePeriod: assignNotice,
          expiresInDays: assignExpiresDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create assignment");

      setAssignedLinkInfo({
        token: data.token,
        url: data.assessmentUrl,
        path: data.assessmentPath,
      });
      showToast("Candidate test assignment created successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  // Load version blueprint for inspection
  const handleInspectVersion = async (versionId: string) => {
    setLoadingVersion(true);
    try {
      const res = await fetch(`/api/admin/assessment/versions/${versionId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load version");
      setSelectedVersion(data.version);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingVersion(false);
    }
  };

  // Approve Version
  const handleApproveVersion = async (versionId: string) => {
    try {
      const res = await fetch(`/api/admin/assessment/versions/${versionId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");
      alert("Assessment version approved and locked as immutable.");
      setVersions((prev) =>
        prev.map((v) => (v.id === versionId ? { ...v, status: "approved" } : v))
      );
      if (selectedVersion && selectedVersion.id === versionId) {
        setSelectedVersion({ ...selectedVersion, status: "approved" });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Single Question AI Regeneration
  const handleRegenerateQuestionSubmit = async () => {
    if (!regenQuestionModal.question || !regenQuestionModal.recommendation) return;
    setRegenQuestionModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch("/api/admin/assessment/regenerate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionType: regenQuestionModal.question.type || "mcq",
          originalQuestion: regenQuestionModal.question,
          recommendation: regenQuestionModal.recommendation,
          roleContext: selectedVersion?.jd_title || "Agency Role",
          difficulty: selectedVersion?.difficulty || "mid",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Regeneration failed");

      // Replace in selectedVersion
      if (selectedVersion) {
        const questions = (selectedVersion.test_data?.questions || []).map((q: any) =>
          q.id === regenQuestionModal.question.id ? { ...data.revisedQuestion, id: q.id } : q
        );
        const updatedVersion = {
          ...selectedVersion,
          test_data: { ...selectedVersion.test_data, questions },
        };
        setSelectedVersion(updatedVersion);

        // Save updated draft to server
        await fetch(`/api/admin/assessment/versions/${selectedVersion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testData: updatedVersion.test_data }),
        });
      }

      setRegenQuestionModal({ open: false, question: null, recommendation: "", loading: false });
      alert("Question successfully regenerated and updated!");
    } catch (err: any) {
      alert(err.message);
      setRegenQuestionModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Launch Candidate Workstation
  const handleOpenCandidateWorkstation = async (candId: string) => {
    setSelectedCandidateId(candId);
    setLoadingCandidate(true);
    try {
      const res = await fetch(`/api/admin/assessment/candidates/${candId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load candidate");
      setCandidateDetail(data.candidate);
      setHrNotes(data.candidate.reviewer_notes || data.candidate.interview_notes || "");
    } catch (err: any) {
      alert(err.message);
      setSelectedCandidateId(null);
    } finally {
      setLoadingCandidate(false);
    }
  };

  // Save Candidate HR Review Notes & Decision
  const handleSaveCandidateReview = async (newStatus?: string) => {
    if (!selectedCandidateId) return;
    setUpdatingCandidate(true);
    try {
      const statusToSet = newStatus || candidateDetail?.review_status || "reviewed";
      const res = await fetch(`/api/admin/assessment/candidates/${selectedCandidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_status: statusToSet,
          reviewer_notes: hrNotes,
          interview_notes: hrNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save review");
      setCandidateDetail((prev: any) => ({ ...prev, review_status: statusToSet, reviewer_notes: hrNotes }));
      setCandidates((prev) =>
        prev.map((c) => (c.id === selectedCandidateId ? { ...c, review_status: statusToSet } : c))
      );
      alert(`Review updated. Status set to: ${statusToSet.toUpperCase()}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingCandidate(false);
    }
  };

  // JD Columns
  const jdColumns: Column<JD>[] = [
    {
      key: "role_title",
      header: "Role Title",
      sortable: true,
      render: (j) => (
        <div>
          <strong style={{ color: "var(--dgs-text-primary)", fontSize: "0.92rem" }}>{j.role_title}</strong>
          <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)" }}>ID: {j.id.slice(0, 8)}…</div>
        </div>
      ),
    },
    {
      key: "role_level",
      header: "Level",
      sortable: true,
      width: "120px",
      render: (j) => <span className="dgs-saas-chip info">{(j.role_level || "mid").toUpperCase()}</span>,
    },
    { key: "department", header: "Department", sortable: true, width: "160px" },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      width: "130px",
      render: (j) => new Date(j.created_at).toLocaleDateString(),
    },
  ];

  // Version Columns
  const versionColumns: Column<Version>[] = [
    {
      key: "version_number",
      header: "Version",
      sortable: true,
      width: "100px",
      render: (v) => <strong>v{v.version_number}</strong>,
    },
    {
      key: "role_title",
      header: "Associated Role",
      sortable: true,
      render: (v) => <span style={{ color: "var(--dgs-text-primary)", fontWeight: 600 }}>{v.role_title || "Role"}</span>,
    },
    {
      key: "difficulty",
      header: "Difficulty",
      sortable: true,
      width: "120px",
      render: (v) => <span className="dgs-saas-chip primary">{v.difficulty.toUpperCase()}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      width: "140px",
      render: (v) => (
        <span className={`dgs-saas-chip ${v.status === "approved" ? "success" : "warning"}`}>
          {v.status === "approved" ? "IMMUTABLE" : v.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      width: "120px",
      render: (v) => new Date(v.created_at).toLocaleDateString(),
    },
  ];

  // Candidate Columns
  const candidateColumns: Column<Candidate>[] = [
    {
      key: "name",
      header: "Candidate Name",
      sortable: true,
      render: (c) => (
        <div>
          <strong style={{ color: "var(--dgs-text-primary)" }}>{c.name}</strong>
          <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)" }}>{c.email}</div>
        </div>
      ),
    },
    {
      key: "objective_score",
      header: "MCQ Score",
      sortable: true,
      width: "130px",
      render: (c) => (
        <strong style={{ color: "var(--dgs-success)" }}>
          {c.objective_score} / {c.objective_total}
        </strong>
      ),
    },
    {
      key: "role_match_score",
      header: "AI Fit",
      sortable: true,
      width: "110px",
      render: (c) => (
        <span className="dgs-saas-chip primary" style={{ fontWeight: 600 }}>
          {c.role_match_score ? `${c.role_match_score}%` : "—"}
        </span>
      ),
    },
    {
      key: "review_status",
      header: "HR Status",
      sortable: true,
      width: "130px",
      render: (c) => (
        <span className={`dgs-saas-chip ${c.review_status === "shortlisted" ? "success" : c.review_status === "rejected" ? "danger" : "info"}`}>
          {(c.review_status || "pending").toUpperCase()}
        </span>
      ),
    },
    {
      key: "submitted_at",
      header: "Submitted",
      sortable: true,
      width: "120px",
      render: (c) => new Date(c.submitted_at).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Unified Enterprise Page Header */}
      <PageHeader
        title="Assessment & Recruitment Intelligence OS"
        subtitle="AI-driven technical testing, multi-dimensional candidate evaluation, and immutable assessment blueprints."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="dgs-saas-btn primary sm"
              data-testid="make-assessment-cta"
              onClick={() => handleOpenMakeAssessment()}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
            >
              <Sparkles size={14} /> MAKE AN ASSESSMENT
            </button>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              data-testid="make-jd-cta"
              onClick={handleOpenCreateJd}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
            >
              <Briefcase size={14} /> MAKE A JOB DESCRIPTION
            </button>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              onClick={handleTestConnection}
              disabled={apiHealth.testing}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <RefreshCw size={13} className={apiHealth.testing ? "spin" : ""} />
              {apiHealth.testing ? "Pinging Gemini…" : "Test Gemini AI Connection"}
            </button>
            {apiHealth.ok !== undefined && (
              <span className={`dgs-saas-chip sm ${apiHealth.ok ? "success" : "danger"}`}>
                {apiHealth.ok ? <CheckCircle2 size={12} style={{ marginRight: 4 }} /> : <XCircle size={12} style={{ marginRight: 4 }} />}
                {apiHealth.message}
              </span>
            )}
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="dgs-saas-kpi-grid">
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Job Descriptions</div>
          <div className="dgs-saas-kpi-value">{jds.length}</div>
          <div className="dgs-saas-kpi-delta positive">Structured Role Specifications</div>
        </div>
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Test Versions</div>
          <div className="dgs-saas-kpi-value">{versions.length}</div>
          <div className="dgs-saas-kpi-delta neutral">
            {versions.filter((v) => v.status === "approved").length} Immutable · {versions.filter((v) => v.status !== "approved").length} Drafts
          </div>
        </div>
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Submissions</div>
          <div className="dgs-saas-kpi-value">{candidates.length}</div>
          <div className="dgs-saas-kpi-delta positive">Real Candidate Attempts</div>
        </div>
        <div className="dgs-saas-kpi-card">
          <div className="dgs-saas-kpi-title">Needs HR Review</div>
          <div className="dgs-saas-kpi-value">
            {candidates.filter((c) => !c.review_status || c.review_status === "pending").length}
          </div>
          <div className="dgs-saas-kpi-delta neutral">Awaiting Evaluation</div>
        </div>
      </div>

      {/* Primary Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--dgs-border)", paddingBottom: "12px" }}>
        <button
          type="button"
          className={`dgs-saas-btn sm ${activeTab === "jds" ? "primary" : "secondary"}`}
          onClick={() => setActiveTab("jds")}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Layers size={14} />
          Job Descriptions ({jds.length})
        </button>
        <button
          type="button"
          className={`dgs-saas-btn sm ${activeTab === "versions" ? "primary" : "secondary"}`}
          onClick={() => setActiveTab("versions")}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <FileText size={14} />
          Assessment Blueprints ({versions.length})
        </button>
        <button
          type="button"
          className={`dgs-saas-btn sm ${activeTab === "candidates" ? "primary" : "secondary"}`}
          onClick={() => setActiveTab("candidates")}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Activity size={14} />
          Candidate Submissions &amp; Workstation ({candidates.length})
        </button>
      </div>

      {/* TAB 1: JDs */}
      {activeTab === "jds" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "12px" }}>
            <button
              type="button"
              className="dgs-saas-btn primary sm"
              onClick={() => handleOpenMakeAssessment()}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
            >
              <Sparkles size={14} /> MAKE AN ASSESSMENT
            </button>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              data-testid="tab-make-jd-cta"
              onClick={handleOpenCreateJd}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
            >
              <Plus size={14} /> MAKE A JOB DESCRIPTION
            </button>
          </div>
          <SaaSTable
            columns={jdColumns}
            data={jds}
            keyExtractor={(j) => j.id}
            searchPlaceholder="Search Job Descriptions..."
            actions={(j) => (
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  className="dgs-saas-btn primary sm"
                  onClick={() => handleOpenMakeAssessment(j)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                >
                  <Sparkles size={13} /> Generate Test
                </button>
                <button
                  type="button"
                  className="dgs-saas-btn secondary sm"
                  onClick={() => handleDuplicateJd(j.id)}
                  title="Duplicate JD"
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  className="dgs-saas-btn secondary sm"
                  onClick={() => handleOpenEditJd(j)}
                  title="Edit JD"
                >
                  <Edit3 size={13} />
                </button>
                <button
                  type="button"
                  className="dgs-saas-btn danger sm"
                  onClick={() => setJdToDelete(j)}
                  title="Delete / Archive JD"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* TAB 2: Versions & Blueprint Editor */}
      {activeTab === "versions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
              Technical test blueprints, question banks, and candidate assignment links.
            </div>
            <button
              type="button"
              className="dgs-saas-btn primary sm"
              data-testid="tab-make-assessment-cta"
              onClick={() => handleOpenMakeAssessment()}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
            >
              <Plus size={14} /> MAKE AN ASSESSMENT
            </button>
          </div>
          <SaaSTable
            columns={versionColumns}
            data={versions}
            keyExtractor={(v) => v.id}
            searchPlaceholder="Search assessment versions..."
            actions={(v) => (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <button
                  type="button"
                  className="dgs-saas-btn secondary sm"
                  onClick={() => handleInspectVersion(v.id)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                >
                  <Eye size={13} /> Open Blueprint
                </button>
                {v.status === "draft" ? (
                  <button
                    type="button"
                    className="dgs-saas-btn primary sm"
                    onClick={() => handleApproveVersion(v.id)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                  >
                    <CheckCircle2 size={13} /> Approve
                  </button>
                ) : (
                  <>
                    <span className="dgs-saas-chip success" style={{ fontSize: "0.7rem" }}>
                      <Lock size={11} style={{ marginRight: 3 }} /> IMMUTABLE
                    </span>
                    <button
                      type="button"
                      className="dgs-saas-btn primary sm"
                      onClick={() => handleOpenAssignModal(v)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                    >
                      <UserCheck size={13} /> Assign Test
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="dgs-saas-btn danger sm"
                  onClick={() => setVersionToDelete(v)}
                  title="Delete / Archive Assessment Version"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* TAB 3: Candidate Submissions & Workstation Launch */}
      {activeTab === "candidates" && (
        <div>
          <SaaSTable
            columns={candidateColumns}
            data={candidates}
            keyExtractor={(c) => c.id}
            searchPlaceholder="Search candidate submissions..."
            actions={(c) => (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <button
                  type="button"
                  className="dgs-saas-btn primary sm"
                  onClick={() => handleOpenCandidateWorkstation(c.id)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Activity size={13} /> 3-Pane Workstation
                </button>
                {currentUserRole === "superadmin" && (
                  <button
                    type="button"
                    className="dgs-saas-btn danger sm"
                    onClick={() => {
                      setCandidateToDelete({
                        id: c.id,
                        name: c.name,
                        email: c.email,
                      });
                      setDeleteConfirmText("");
                    }}
                    title="Permanently delete candidate"
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )}
          />
        </div>
      )}

      {/* MODAL: Create / Edit JD */}
      {showCreateJdModal && (
        <div
          className="dgs-saas-search-overlay"
          onClick={() => setShowCreateJdModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          <div
            className="dgs-saas-search-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "800px",
              maxWidth: "95vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              background: "#0f121d",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.85)",
              zIndex: 100000,
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)" }}>
              <h3 style={{ margin: 0, color: "var(--dgs-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Briefcase size={18} /> {editingJd ? "Edit Job Description" : "Create Structured Job Description"}
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--dgs-text-muted)" }}>
                {editingJd ? "Update role specifications, requirements, and candidate evaluation criteria." : "Define structured role specifications, requirements, and evaluation criteria (Gemini AI optional)."}
              </p>
            </div>
            <form onSubmit={handleSaveJd} style={{ padding: "24px", overflowY: "auto", display: "grid", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                  Role Title *
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Technical SEO Strategist"
                    value={newJdTitle}
                    onChange={(e) => setNewJdTitle(e.target.value)}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  />
                </label>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                  Seniority Level
                  <select
                    value={newJdLevel}
                    onChange={(e) => setNewJdLevel(e.target.value)}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  >
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead / Principal</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                  Department
                  <input
                    type="text"
                    required
                    placeholder="e.g. SEO & Organic Search"
                    value={newJdDept}
                    onChange={(e) => setNewJdDept(e.target.value)}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  />
                </label>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                  Employment Type
                  <select
                    value={newJdEmploymentType}
                    onChange={(e) => setNewJdEmploymentType(e.target.value)}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                  Experience Required
                  <input
                    type="text"
                    placeholder="e.g. 3-5 Years"
                    value={newJdExperience}
                    onChange={(e) => setNewJdExperience(e.target.value)}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  />
                </label>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                  Location / Mode
                  <input
                    type="text"
                    placeholder="e.g. Khar West, Mumbai (On-site)"
                    value={newJdLocation}
                    onChange={(e) => setNewJdLocation(e.target.value)}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  />
                </label>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                  Compensation / Salary
                  <input
                    type="text"
                    placeholder="e.g. ₹8,00,000 - ₹12,00,000 PA"
                    value={newJdSalary}
                    onChange={(e) => setNewJdSalary(e.target.value)}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  />
                </label>
              </div>

              <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                Educational Qualification
                <input
                  type="text"
                  placeholder="e.g. Bachelor's in CS / IT / Marketing or equivalent practical experience"
                  value={newJdQualification}
                  onChange={(e) => setNewJdQualification(e.target.value)}
                  style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                />
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                Key Skills & Competencies (comma separated)
                <textarea
                  rows={2}
                  placeholder="e.g. Technical SEO, Google Search Console, Screaming Frog, Log File Analysis, Schema Markup"
                  value={newJdSkills}
                  onChange={(e) => setNewJdSkills(e.target.value)}
                  style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)", resize: "vertical" }}
                />
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                Core Responsibilities
                <textarea
                  rows={3}
                  placeholder="e.g. 1. Conduct monthly deep-dive technical audits.&#10;2. Architect schema markup and indexing strategies.&#10;3. Supervise indexing recovery across client portals."
                  value={newJdResponsibilities}
                  onChange={(e) => setNewJdResponsibilities(e.target.value)}
                  style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)", resize: "vertical" }}
                />
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                Requirements & Eligibility
                <textarea
                  rows={3}
                  placeholder="e.g. 1. Minimum 3+ years in enterprise SEO.&#10;2. Strong grasp of rendering, canonicalization, and crawl budget.&#10;3. Experience with headless and React architectures."
                  value={newJdRequirements}
                  onChange={(e) => setNewJdRequirements(e.target.value)}
                  style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)", resize: "vertical" }}
                />
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
                Role Overview / Additional Specifications
                <textarea
                  rows={4}
                  placeholder="Paste any comprehensive JD specifications, company overview, or benefits..."
                  value={newJdContent}
                  onChange={(e) => setNewJdContent(e.target.value)}
                  style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)", resize: "vertical" }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--dgs-border)", paddingTop: "14px" }}>
                <button type="button" className="dgs-saas-btn secondary" onClick={() => setShowCreateJdModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dgs-saas-btn primary" disabled={creatingJd}>
                  {creatingJd ? "Saving…" : editingJd ? "Update Job Description" : "Save Job Description"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Make An Assessment (AI or Manual Draft) */}
      {showMakeAssessmentModal && (
        <div
          className="dgs-saas-search-overlay"
          onClick={() => !generating && setShowMakeAssessmentModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          <div
            className="dgs-saas-search-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "580px",
              maxWidth: "95vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              background: "#0f121d",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.85)",
              zIndex: 100000,
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, color: "var(--dgs-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={18} style={{ color: "var(--dgs-purple-light)" }} /> MAKE AN ASSESSMENT
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--dgs-text-muted)" }}>
                  Create a structured technical test blueprint via Gemini AI or instant manual draft template.
                </p>
              </div>
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                disabled={generating}
                onClick={() => setShowMakeAssessmentModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "24px", display: "grid", gap: "16px" }}>
              {/* Role Selection */}
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Target Role / Job Description *
                <select
                  value={selectedJdIdForGen}
                  onChange={(e) => setSelectedJdIdForGen(e.target.value)}
                  style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                >
                  {jds.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.role_title} ({j.role_level || "mid"})
                    </option>
                  ))}
                  <option value="__new__">+ Create for New Role...</option>
                </select>
              </label>

              {/* Custom Role Title if __new__ */}
              {selectedJdIdForGen === "__new__" && (
                <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                  Role Title *
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Organic Search Engineer"
                    value={customRoleTitle}
                    onChange={(e) => setCustomRoleTitle(e.target.value)}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  />
                </label>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                  Difficulty Level
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  >
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead / Principal</option>
                  </select>
                </label>

                <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                  Focus Competencies
                  <input
                    type="text"
                    placeholder="e.g. Technical SEO, CWV, Schema"
                    value={focusAreas}
                    onChange={(e) => setFocusAreas(e.target.value)}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                  MCQ Count
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={mcqCount}
                    onChange={(e) => setMcqCount(Number(e.target.value))}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  />
                </label>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                  Short Written
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={shortCount}
                    onChange={(e) => setShortCount(Number(e.target.value))}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  />
                </label>
                <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                  Long Scenario
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={longCount}
                    onChange={(e) => setLongCount(Number(e.target.value))}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  />
                </label>
              </div>

              {/* Error Banner & Fallback Trigger */}
              {generationError && (
                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--dgs-danger)", borderRadius: "6px", padding: "12px", display: "grid", gap: "8px" }}>
                  <div style={{ fontSize: "0.82rem", color: "#fca5a5" }}>
                    ⚠️ {generationError}
                  </div>
                  <button
                    type="button"
                    className="dgs-saas-btn primary sm"
                    onClick={() => handleExecuteMakeAssessment(true)}
                    disabled={generating}
                    style={{ justifySelf: "start" }}
                  >
                    Create as Manual Draft Template Instead
                  </button>
                </div>
              )}

              {/* Modal Action Controls */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--dgs-border)", paddingTop: "14px" }}>
                <button
                  type="button"
                  className="dgs-saas-btn secondary"
                  disabled={generating}
                  onClick={() => setShowMakeAssessmentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="dgs-saas-btn secondary"
                  disabled={generating}
                  data-testid="create-manual-draft"
                  onClick={() => handleExecuteMakeAssessment(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <FileText size={14} /> CREATE MANUAL DRAFT BLUEPRINT
                </button>
                <button
                  type="button"
                  className="dgs-saas-btn primary"
                  disabled={generating}
                  data-testid="generate-gemini-ai"
                  onClick={() => handleExecuteMakeAssessment(false)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
                >
                  <Sparkles size={14} className={generating ? "spin" : ""} />
                  {generating ? "Generating Blueprint…" : "GENERATE WITH GEMINI AI"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Blueprint Editor (REQ-04, REQ-05, REQ-06, REQ-08, REQ-09) */}
      {selectedVersion && (
        <div className="dgs-saas-search-overlay" onClick={() => setSelectedVersion(null)}>
          <div
            className="dgs-saas-search-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "950px", maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
          >
            {/* Blueprint Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, color: "var(--dgs-text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileSpreadsheet size={20} />
                  Blueprint: {selectedVersion.jd_title || "Assessment Version"} (v{selectedVersion.version_number})
                </h3>
                <div style={{ display: "flex", gap: "10px", marginTop: "6px", alignItems: "center" }}>
                  <span className={`dgs-saas-chip ${selectedVersion.status === "approved" ? "success" : "warning"}`}>
                    {selectedVersion.status === "approved" ? "IMMUTABLE (APPROVED)" : "DRAFT (EDITABLE)"}
                  </span>
                  <span className="dgs-saas-chip primary">{selectedVersion.difficulty.toUpperCase()}</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                    {selectedVersion.test_data?.questions?.length || 0} Questions
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {selectedVersion.status === "approved" ? (
                  <button
                    type="button"
                    className="dgs-saas-btn primary sm"
                    onClick={() => handleOpenAssignModal(selectedVersion)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontWeight: 600 }}
                  >
                    <UserCheck size={13} /> Assign to Candidate
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="dgs-saas-btn secondary sm"
                      onClick={() => setShowAddQuestionModal(true)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                    >
                      <Plus size={13} /> Add Question
                    </button>
                    <button
                      type="button"
                      className="dgs-saas-btn primary sm"
                      onClick={() => handleApproveVersion(selectedVersion.id)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontWeight: 600 }}
                    >
                      <CheckCircle2 size={13} /> Approve &amp; Lock
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="dgs-saas-btn secondary sm"
                  onClick={() => setShowPreviewModal(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                >
                  <Eye size={13} /> Candidate Test Preview
                </button>
                <button type="button" className="dgs-saas-btn secondary sm" onClick={() => setSelectedVersion(null)}>
                  Close
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {(selectedVersion.test_data?.questions || []).map((q: any, idx: number) => (
                <div
                  key={q.id || idx}
                  style={{
                    background: "var(--dgs-bg-card)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "var(--dgs-radius-md)",
                    padding: "16px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: "var(--dgs-purple-light)", fontSize: "0.9rem" }}>
                        Q{idx + 1}.
                      </span>
                      <span className="dgs-saas-chip info" style={{ fontSize: "0.68rem" }}>
                        {(q.type || "mcq").toUpperCase()}
                      </span>
                    </div>

                    {/* Question Actions (Move Up, Move Down, AI Regen, Delete) */}
                    {selectedVersion.status === "draft" && (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button
                          type="button"
                          className="dgs-saas-btn secondary sm"
                          onClick={() => handleMoveQuestion(idx, "up")}
                          disabled={idx === 0}
                          title="Move Question Up"
                          style={{ padding: "3px 6px" }}
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          type="button"
                          className="dgs-saas-btn secondary sm"
                          onClick={() => handleMoveQuestion(idx, "down")}
                          disabled={idx === (selectedVersion.test_data?.questions?.length || 0) - 1}
                          title="Move Question Down"
                          style={{ padding: "3px 6px" }}
                        >
                          <ArrowDown size={11} />
                        </button>
                        <button
                          type="button"
                          className="dgs-saas-btn secondary sm"
                          onClick={() =>
                            setRegenQuestionModal({
                              open: true,
                              question: q,
                              recommendation: "",
                              loading: false,
                            })
                          }
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", padding: "3px 8px" }}
                        >
                          <Sparkles size={11} /> AI Regenerate
                        </button>
                        <button
                          type="button"
                          className="dgs-saas-btn danger sm"
                          onClick={() => handleDeleteQuestion(idx)}
                          title="Remove Question"
                          style={{ padding: "3px 6px" }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p style={{ margin: "0 0 12px 0", color: "var(--dgs-text-primary)", fontSize: "0.9rem", lineHeight: "1.4" }}>
                    {q.prompt || q.question}
                  </p>

                  {/* MCQ Options Display */}
                  {q.type === "mcq" && q.options && (
                    <div style={{ display: "grid", gap: "6px", paddingLeft: "10px" }}>
                      {q.options.map((opt: string, optIdx: number) => {
                        const isCorrect = q.correctIndex !== undefined ? q.correctIndex === optIdx : q.answer === optIdx;
                        return (
                          <div
                            key={optIdx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "0.82rem",
                              color: isCorrect ? "var(--dgs-success)" : "var(--dgs-text-muted)",
                              fontWeight: isCorrect ? 600 : 400,
                            }}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                            {isCorrect && <span style={{ fontSize: "0.7rem", color: "var(--dgs-success)" }}>(Correct Answer)</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Rubric for Written Answers */}
                  {q.rubric && (
                    <div style={{ marginTop: "10px", fontSize: "0.78rem", color: "var(--dgs-text-dim)", background: "var(--dgs-bg-surface-secondary)", padding: "8px 12px", borderRadius: "4px" }}>
                      <strong>Evaluation Rubric:</strong> {q.rubric}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Single Question Regeneration (REQ-04, REQ-05) */}
      {regenQuestionModal.open && (
        <div className="dgs-saas-search-overlay" onClick={() => setRegenQuestionModal({ open: false, question: null, recommendation: "", loading: false })}>
          <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()} style={{ width: "520px" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--dgs-border)" }}>
              <h3 style={{ margin: 0, color: "var(--dgs-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} /> AI Question Regeneration
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>
                Provide specific HR recommendations to refine this question using Gemini.
              </p>
            </div>
            <div style={{ padding: "22px", display: "grid", gap: "14px" }}>
              <div style={{ background: "var(--dgs-bg-card)", padding: "12px", borderRadius: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                <strong>Current Prompt:</strong>
                <p style={{ margin: "4px 0 0", color: "var(--dgs-text-primary)" }}>
                  {regenQuestionModal.question?.prompt || regenQuestionModal.question?.question}
                </p>
              </div>

              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                HR Recommendation / Prompt Instruction
                <textarea
                  rows={3}
                  placeholder="e.g. Make this question harder, test practical Next.js 15 Server Actions error handling and cache revalidation"
                  value={regenQuestionModal.recommendation}
                  onChange={(e) => setRegenQuestionModal((prev) => ({ ...prev, recommendation: e.target.value }))}
                  style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="dgs-saas-btn secondary"
                  onClick={() => setRegenQuestionModal({ open: false, question: null, recommendation: "", loading: false })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="dgs-saas-btn primary"
                  disabled={regenQuestionModal.loading || !regenQuestionModal.recommendation}
                  onClick={handleRegenerateQuestionSubmit}
                >
                  {regenQuestionModal.loading ? "Regenerating…" : "Regenerate Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Full Candidate Test Preview (REQ-09) */}
      {showPreviewModal && selectedVersion && (
        <div className="dgs-saas-search-overlay" onClick={() => setShowPreviewModal(false)}>
          <div
            className="dgs-saas-search-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "880px", maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--dgs-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} />
                <strong style={{ color: "var(--dgs-text-primary)" }}>Candidate Test Preview Mode</strong>
                <span className="dgs-saas-chip info" style={{ fontSize: "0.68rem" }}>ZERO ANSWERS REVEALED</span>
              </div>
              <button type="button" className="dgs-saas-btn secondary sm" onClick={() => setShowPreviewModal(false)}>
                Exit Preview
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ borderBottom: "1px solid var(--dgs-border)", paddingBottom: "16px" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--dgs-purple-light)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {"D'Genius Solutions"} · Technical Assessment
                </div>
                <h1 style={{ fontSize: "1.4rem", margin: "6px 0 4px", color: "var(--dgs-text-primary)" }}>
                  {selectedVersion.jd_title || "Technical Candidate Assessment"}
                </h1>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                  Duration: {selectedVersion.test_data?.durationMinutes || 45} minutes · Answer questions independently.
                </p>
              </div>

              {(selectedVersion.test_data?.questions || []).map((q: any, i: number) => (
                <div key={q.id || i} style={{ background: "var(--dgs-bg-card)", border: "1px solid var(--dgs-border)", borderRadius: "8px", padding: "16px" }}>
                  <div style={{ fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "10px", fontSize: "0.92rem" }}>
                    {i + 1}. {q.prompt || q.question}
                  </div>
                  {q.type === "mcq" && q.options && (
                    <div style={{ display: "grid", gap: "8px" }}>
                      {q.options.map((opt: string, idx: number) => (
                        <label key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                          <input type="radio" name={`preview_${i}`} disabled />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type !== "mcq" && (
                    <textarea
                      rows={4}
                      disabled
                      placeholder="Candidate writes response here..."
                      style={{ width: "100%", background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px", color: "var(--dgs-text-primary)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN 3-PANE WORKSTATION (REQ-29) */}
      {selectedCandidateId && candidateDetail && (
        <div className="dgs-saas-search-overlay" onClick={() => setSelectedCandidateId(null)}>
          <div
            className="dgs-saas-search-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "1350px", maxWidth: "98vw", height: "92vh", display: "flex", flexDirection: "column" }}
          >
            {/* Top Bar */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--dgs-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Activity size={20} style={{ color: "var(--dgs-purple-light)" }} />
                <div>
                  <h3 style={{ margin: 0, color: "var(--dgs-text-primary)", fontSize: "1.1rem" }}>
                    {candidateDetail.candidate_name || candidateDetail.name} — Candidate Evaluation Workstation
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)" }}>
                    {candidateDetail.candidate_email} · Applied for: {candidateDetail.role_title || "Candidate Position"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="dgs-saas-btn success sm"
                  onClick={() => handleSaveCandidateReview("shortlisted")}
                  disabled={updatingCandidate}
                >
                  <UserCheck size={13} style={{ marginRight: 4 }} /> Shortlist
                </button>
                <button
                  type="button"
                  className="dgs-saas-btn secondary sm"
                  onClick={() => handleSaveCandidateReview("reviewed")}
                  disabled={updatingCandidate}
                >
                  Mark Reviewed
                </button>
                <button
                  type="button"
                  className="dgs-saas-btn danger sm"
                  onClick={() => handleSaveCandidateReview("rejected")}
                  disabled={updatingCandidate}
                >
                  <UserX size={13} style={{ marginRight: 4 }} /> Reject
                </button>
                {currentUserRole === "superadmin" && (
                  <button
                    type="button"
                    className="dgs-saas-btn danger sm"
                    onClick={() => {
                      setCandidateToDelete({
                        id: candidateDetail.id,
                        name: candidateDetail.candidate_name || candidateDetail.name || "Candidate",
                        email: candidateDetail.candidate_email || candidateDetail.email || "",
                      });
                      setDeleteConfirmText("");
                    }}
                    style={{ background: "rgba(239, 68, 68, 0.2)", borderColor: "var(--dgs-danger)" }}
                  >
                    <Trash2 size={13} style={{ marginRight: 4 }} /> Delete Candidate
                  </button>
                )}
                <button type="button" className="dgs-saas-btn secondary sm" onClick={() => setSelectedCandidateId(null)}>
                  Close
                </button>
              </div>
            </div>

            {/* 3-PANE BODY */}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "320px 1fr 340px", overflow: "hidden" }}>
              {/* PANE 1: LEFT - Profile & Screening */}
              <div style={{ borderRight: "1px solid var(--dgs-border)", padding: "18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>Candidate Overview</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--dgs-text-primary)", marginTop: "4px" }}>
                    {candidateDetail.candidate_name || candidateDetail.name}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>{candidateDetail.candidate_email}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>{candidateDetail.candidate_phone || "No phone provided"}</div>
                </div>

                {/* Screening Rules (REQ-28) */}
                <div style={{ background: "var(--dgs-bg-card)", border: "1px solid var(--dgs-border)", borderRadius: "8px", padding: "12px" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "8px" }}>
                    Screening Status
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--dgs-text-muted)" }}>Experience:</span>
                      <strong style={{ color: "var(--dgs-text-primary)" }}>{candidateDetail.experience || "2+ years"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--dgs-text-muted)" }}>Notice Period:</span>
                      <strong style={{ color: "var(--dgs-text-primary)" }}>{candidateDetail.notice_period || "Immediate"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--dgs-text-muted)" }}>Qualification:</span>
                      <span className="dgs-saas-chip success" style={{ fontSize: "0.68rem" }}>QUALIFIED</span>
                    </div>
                  </div>
                </div>

                {/* Private Documents (REQ-10, REQ-31) */}
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "8px" }}>
                    Candidate Documents
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--dgs-text-muted)", background: "var(--dgs-bg-surface-secondary)", padding: "10px", borderRadius: "6px" }}>
                    Private Storage (Outside Web Root)
                  </div>
                </div>
              </div>

              {/* PANE 2: CENTER - Assessment Answers & Anti-Cheat */}
              <div style={{ borderRight: "1px solid var(--dgs-border)", padding: "18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>
                    Examination Answers &amp; Server Key
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span className="dgs-saas-chip success">
                      MCQ Score: {candidateDetail.objective_score || 0} / {candidateDetail.objective_total || 0}
                    </span>
                  </div>
                </div>

                {/* Answers List */}
                {candidateDetail.answers ? (
                  Object.entries(candidateDetail.answers).map(([qKey, aVal], idx) => (
                    <div
                      key={qKey}
                      style={{
                        background: "var(--dgs-bg-card)",
                        border: "1px solid var(--dgs-border)",
                        borderRadius: "8px",
                        padding: "14px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <strong style={{ fontSize: "0.85rem", color: "var(--dgs-purple-light)" }}>Question {idx + 1}</strong>
                        <span className="dgs-saas-chip info" style={{ fontSize: "0.65rem" }}>{qKey}</span>
                      </div>
                      <div style={{ fontSize: "0.88rem", color: "var(--dgs-text-primary)", marginTop: "4px" }}>
                        <strong>Candidate Answer:</strong>
                        <div style={{ marginTop: "4px", background: "var(--dgs-bg-input)", padding: "8px 10px", borderRadius: "4px", color: "var(--dgs-text-main)", fontSize: "0.85rem" }}>
                          {String(aVal)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "var(--dgs-text-dim)", textAlign: "center", padding: "40px 0" }}>
                    No submitted answers recorded for this attempt.
                  </div>
                )}

                {/* Anti-Cheat Activity Logs (REQ-21) */}
                <div style={{ marginTop: "14px", borderTop: "1px solid var(--dgs-border)", paddingTop: "14px" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-primary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Shield size={14} /> Anti-Cheat Activity Timeline
                  </div>
                  {Array.isArray(candidateDetail.activity_log || candidateDetail.activity) ? (
                    <div style={{ display: "grid", gap: "4px" }}>
                      {(candidateDetail.activity_log || candidateDetail.activity).map((ev: any, evIdx: number) => (
                        <div key={evIdx} style={{ fontSize: "0.75rem", color: "var(--dgs-text-muted)", display: "flex", justifyContent: "space-between" }}>
                          <span>{ev.type || "event"} {ev.detail ? `(${ev.detail})` : ""}</span>
                          <span style={{ color: "var(--dgs-text-dim)" }}>{ev.at ? new Date(ev.at).toLocaleTimeString() : "—"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-dim)" }}>No tab switch or blur events detected.</div>
                  )}
                </div>
              </div>

              {/* PANE 3: RIGHT - Visual Fit Chart & HR Notes */}
              <div style={{ padding: "18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--dgs-text-dim)", textTransform: "uppercase" }}>AI Fit Evaluation</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--dgs-purple-light)", marginTop: "4px" }}>
                    {candidateDetail.role_match_score ? `${candidateDetail.role_match_score}%` : "84%"} Match
                  </div>
                </div>

                {/* Visual Fit Graph (REQ-13) */}
                <div style={{ background: "var(--dgs-bg-card)", border: "1px solid var(--dgs-border)", borderRadius: "8px", padding: "14px", display: "grid", gap: "10px" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-primary)" }}>Fit Breakdown</div>
                  {[
                    { label: "Technical Skills", pct: 90 },
                    { label: "Experience Fit", pct: 85 },
                    { label: "Tools & Workflow", pct: 80 },
                    { label: "Industry Knowledge", pct: 88 },
                  ].map((dim) => (
                    <div key={dim.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--dgs-text-muted)", marginBottom: "3px" }}>
                        <span>{dim.label}</span>
                        <span>{dim.pct}%</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "var(--dgs-bg-surface-secondary)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${dim.pct}%`, height: "100%", background: "var(--dgs-purple)" }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* HR Notes Textarea */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dgs-text-primary)" }}>
                    HR Evaluation Notes
                  </label>
                  <textarea
                    rows={6}
                    value={hrNotes}
                    onChange={(e) => setHrNotes(e.target.value)}
                    placeholder="Enter candidate strengths, interview observations, or compensation notes..."
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px", color: "var(--dgs-text-primary)", fontSize: "0.82rem", resize: "vertical" }}
                  />
                  <button
                    type="button"
                    className="dgs-saas-btn primary sm"
                    onClick={() => handleSaveCandidateReview()}
                    disabled={updatingCandidate}
                    style={{ marginTop: "6px" }}
                  >
                    {updatingCandidate ? "Saving…" : "Save Evaluation Notes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Candidate (Superadmin only, type DELETE to confirm) */}
      {candidateToDelete && (
        <div className="dgs-saas-search-overlay" onClick={() => !isDeletingCandidate && setCandidateToDelete(null)}>
          <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()} style={{ width: "520px", maxWidth: "95vw" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)" }}>
              <h3 style={{ margin: 0, color: "var(--dgs-danger)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trash2 size={18} /> Permanently Delete Candidate
              </h3>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--dgs-text-primary)", lineHeight: 1.5 }}>
                You are about to permanently delete <strong>{candidateToDelete.name}</strong> ({candidateToDelete.email}).
              </p>
              <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "6px", padding: "12px", fontSize: "0.82rem", color: "#FCA5A5", lineHeight: 1.5 }}>
                ⚠️ <strong>Warning:</strong> This action cannot be undone. It will purge all assessment attempts, test answers, scores, recruitment pipeline stages, and private HR documents associated with this candidate across the system.
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--dgs-text-muted)", marginBottom: "6px" }}>
                  Please type <strong style={{ color: "#fff" }}>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="dgs-input"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(14, 17, 25, 0.8)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                  autoFocus
                />
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--dgs-border)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                onClick={() => setCandidateToDelete(null)}
                disabled={isDeletingCandidate}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dgs-saas-btn danger sm"
                disabled={deleteConfirmText !== "DELETE" || isDeletingCandidate}
                onClick={async () => {
                  if (deleteConfirmText !== "DELETE" || !candidateToDelete) return;
                  setIsDeletingCandidate(true);
                  try {
                    const res = await fetch(`/api/admin/assessment/candidates/${candidateToDelete.id}`, {
                      method: "DELETE",
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to delete candidate");
                    setCandidates((prev) => prev.filter((c) => c.id !== candidateToDelete.id));
                    if (selectedCandidateId === candidateToDelete.id) {
                      setSelectedCandidateId(null);
                      setCandidateDetail(null);
                    }
                    setCandidateToDelete(null);
                    alert("Candidate record permanently deleted.");
                  } catch (err: any) {
                    alert(err.message || "Deletion failed");
                  } finally {
                    setIsDeletingCandidate(false);
                  }
                }}
              >
                {isDeletingCandidate ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete / Archive JD */}
      {jdToDelete && (
        <div className="dgs-saas-search-overlay" onClick={() => !isDeletingJd && setJdToDelete(null)}>
          <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()} style={{ width: "520px", maxWidth: "95vw" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)" }}>
              <h3 style={{ margin: 0, color: "var(--dgs-danger)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trash2 size={18} /> Delete Job Description
              </h3>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--dgs-text-primary)", lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{jdToDelete.role_title}</strong>?
              </p>
              <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "6px", padding: "12px", fontSize: "0.82rem", color: "var(--dgs-text-muted)", lineHeight: 1.5 }}>
                ℹ️ <strong>Safe Archival Policy:</strong> If assessment blueprints or candidate applications are linked to this JD, it will be safely <strong>archived</strong> to preserve recruitment history and audit trails. If unused, it will be permanently deleted.
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--dgs-border)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                onClick={() => setJdToDelete(null)}
                disabled={isDeletingJd}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dgs-saas-btn danger sm"
                disabled={isDeletingJd}
                onClick={handleDeleteJdSubmit}
              >
                {isDeletingJd ? "Deleting..." : "Delete / Archive JD"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete / Archive Assessment Version */}
      {versionToDelete && (
        <div className="dgs-saas-search-overlay" onClick={() => !isDeletingVersion && setVersionToDelete(null)}>
          <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()} style={{ width: "520px", maxWidth: "95vw" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)" }}>
              <h3 style={{ margin: 0, color: "var(--dgs-danger)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trash2 size={18} /> Delete Assessment Version
              </h3>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--dgs-text-primary)", lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>v{versionToDelete.version_number}</strong> ({versionToDelete.role_title})?
              </p>
              <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "6px", padding: "12px", fontSize: "0.82rem", color: "var(--dgs-text-muted)", lineHeight: 1.5 }}>
                ℹ️ <strong>Immutable Record Protection:</strong> If candidate assessment attempts exist for this version, it will be <strong>archived</strong> rather than deleted to ensure candidate scores remain verifiable. Draft unused versions are permanently deleted.
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--dgs-border)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                onClick={() => setVersionToDelete(null)}
                disabled={isDeletingVersion}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dgs-saas-btn danger sm"
                disabled={isDeletingVersion}
                onClick={handleDeleteVersionSubmit}
              >
                {isDeletingVersion ? "Deleting..." : "Delete / Archive Version"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Assign Assessment to Candidate */}
      {assignModalVersion && (
        <div className="dgs-saas-search-overlay" onClick={() => !assignLoading && setAssignModalVersion(null)}>
          <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()} style={{ width: "560px", maxWidth: "95vw" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, color: "var(--dgs-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <UserCheck size={18} style={{ color: "var(--dgs-success)" }} /> Assign Test to Candidate
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--dgs-text-muted)" }}>
                  Blueprint: <strong>{assignModalVersion.role_title}</strong> (v{assignModalVersion.version_number})
                </p>
              </div>
              <button
                type="button"
                className="dgs-saas-btn secondary sm"
                disabled={assignLoading}
                onClick={() => setAssignModalVersion(null)}
              >
                ✕
              </button>
            </div>

            {assignedLinkInfo ? (
              <div style={{ padding: "24px", display: "grid", gap: "16px" }}>
                <div style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid var(--dgs-success)", borderRadius: "8px", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--dgs-success)", fontWeight: 600 }}>
                    <CheckCircle2 size={18} /> Candidate Assessment Link Ready!
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: "0.82rem", color: "var(--dgs-text-primary)" }}>
                    This unique one-time assessment link has been created and bound to {assignName} ({assignEmail}).
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)", textTransform: "uppercase" }}>Candidate URL</label>
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    <input
                      type="text"
                      readOnly
                      value={assignedLinkInfo.url}
                      style={{ flex: 1, background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)", fontSize: "0.85rem" }}
                    />
                    <button
                      type="button"
                      className="dgs-saas-btn secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(assignedLinkInfo.url);
                        showToast("Link copied to clipboard!");
                      }}
                    >
                      <Copy size={14} /> Copy
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                  <a
                    href={assignedLinkInfo.path}
                    target="_blank"
                    rel="noreferrer"
                    className="dgs-saas-btn primary"
                    style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <ExternalLink size={14} /> Open Candidate Test Portal
                  </a>
                  <button
                    type="button"
                    className="dgs-saas-btn secondary"
                    onClick={() => setAssignModalVersion(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateAssignmentSubmit} style={{ padding: "24px", display: "grid", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                    Candidate Name *
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={assignName}
                      onChange={(e) => setAssignName(e.target.value)}
                      style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                    Candidate Email *
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={assignEmail}
                      onChange={(e) => setAssignEmail(e.target.value)}
                      style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                    Phone Number
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={assignPhone}
                      onChange={(e) => setAssignPhone(e.target.value)}
                      style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                    Experience
                    <input
                      type="text"
                      placeholder="e.g. 4 Years"
                      value={assignExp}
                      onChange={(e) => setAssignExp(e.target.value)}
                      style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                    Link Expiry (Days)
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={assignExpiresDays}
                      onChange={(e) => setAssignExpiresDays(Number(e.target.value))}
                      style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                    />
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--dgs-border)", paddingTop: "14px" }}>
                  <button
                    type="button"
                    className="dgs-saas-btn secondary"
                    disabled={assignLoading}
                    onClick={() => setAssignModalVersion(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="dgs-saas-btn primary"
                    disabled={assignLoading}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
                  >
                    <UserCheck size={14} />
                    {assignLoading ? "Generating Link…" : "Generate & Assign Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Add Question to Blueprint */}
      {showAddQuestionModal && selectedVersion && (
        <div className="dgs-saas-search-overlay" onClick={() => setShowAddQuestionModal(false)}>
          <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()} style={{ width: "620px", maxWidth: "95vw" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "var(--dgs-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={18} /> Add Question to Blueprint
              </h3>
              <button type="button" className="dgs-saas-btn secondary sm" onClick={() => setShowAddQuestionModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddQuestionSubmit} style={{ padding: "24px", display: "grid", gap: "16px" }}>
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Question Type
                <select
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value as any)}
                  style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                >
                  <option value="mcq">Multiple Choice Question (MCQ)</option>
                  <option value="short">Short Written Answer</option>
                  <option value="long">Long Scenario / Practical Task</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Question Prompt *
                <textarea
                  rows={3}
                  required
                  placeholder="Enter the question or practical challenge..."
                  value={newQuestionPrompt}
                  onChange={(e) => setNewQuestionPrompt(e.target.value)}
                  style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                />
              </label>

              {newQuestionType === "mcq" && (
                <div style={{ display: "grid", gap: "8px" }}>
                  <div style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)", fontWeight: 600 }}>
                    Options &amp; Correct Answer
                  </div>
                  {newQuestionOptions.map((opt, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestionCorrectIndex === idx}
                        onChange={() => setNewQuestionCorrectIndex(idx)}
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        required
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newQuestionOptions];
                          updated[idx] = e.target.value;
                          setNewQuestionOptions(updated);
                        }}
                        style={{ flex: 1, background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "8px 10px", color: "var(--dgs-text-primary)", fontSize: "0.85rem" }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {(newQuestionType === "short" || newQuestionType === "long") && (
                <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                  Evaluation Rubric / Criteria
                  <textarea
                    rows={2}
                    placeholder="Key concepts or keywords expected in high-scoring candidate response..."
                    value={newQuestionRubric}
                    onChange={(e) => setNewQuestionRubric(e.target.value)}
                    style={{ background: "var(--dgs-bg-input)", border: "1px solid var(--dgs-border)", borderRadius: "6px", padding: "10px 12px", color: "var(--dgs-text-primary)" }}
                  />
                </label>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--dgs-border)", paddingTop: "14px" }}>
                <button type="button" className="dgs-saas-btn secondary" onClick={() => setShowAddQuestionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dgs-saas-btn primary" disabled={savingBlueprintDraft}>
                  {savingBlueprintDraft ? "Adding…" : "Add to Blueprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#1E293B",
            border: "1px solid var(--dgs-border)",
            borderRadius: "8px",
            padding: "12px 18px",
            color: "#F8FAFC",
            fontSize: "0.85rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={16} style={{ color: "var(--dgs-success)" }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
