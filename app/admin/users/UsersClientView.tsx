"use client";

import React, { useState } from "react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import PageHeader from "@/components/admin/PageHeader";
import { Plus } from "lucide-react";
import type { CmsUser, CmsRole } from "@/lib/cms/auth-db";

type Props = {
  initialUsers: CmsUser[];
  currentRole: CmsRole;
};

export default function UsersClientView({ initialUsers, currentRole }: Props) {
  const [users, setUsers] = useState<CmsUser[]>(initialUsers);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<CmsUser | null>(null);

  // Form states
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createRole, setCreateRole] = useState<CmsRole>("manager");
  const [createPassword, setCreatePassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const refreshUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail,
          display_name: createName,
          role: createRole,
          password: createPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      setShowCreateModal(false);
      setCreateEmail("");
      setCreateName("");
      setCreatePassword("");
      await refreshUsers();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: CmsUser) => {
    const nextActive = user.is_active === 1 || user.is_active === true ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextActive }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to toggle status");
      else await refreshUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (user: CmsUser, newRole: CmsRole) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to update role");
      else await refreshUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal || !newPassword) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${showPasswordModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      alert(`Password successfully updated for ${showPasswordModal.email}`);
      setShowPasswordModal(null);
      setNewPassword("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: CmsUser) => {
    if (!confirm(`Are you sure you want to permanently delete ${user.email}? This will invalidate all their sessions.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to delete user");
      else await refreshUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<CmsUser>[] = [
    {
      key: "display_name",
      header: "User",
      sortable: true,
      render: (u) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="dgs-saas-avatar-mini">
            {u.display_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--dgs-text-primary)" }}>{u.display_name}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--dgs-text-muted)" }}>{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (u) => {
        const canEditRole = currentRole === "superadmin";
        const variant = u.role === "superadmin" ? "primary" : u.role === "admin" ? "info" : "warning";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className={`dgs-saas-chip ${variant}`}>
              {u.role.toUpperCase()}
            </span>
            {canEditRole && u.role !== "superadmin" && (
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u, e.target.value as CmsRole)}
                style={{
                  background: "var(--dgs-bg-input)",
                  border: "1px solid var(--dgs-border)",
                  color: "var(--dgs-text-primary)",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  padding: "2px 6px",
                }}
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            )}
          </div>
        );
      },
    },
    {
      key: "is_active",
      header: "Status",
      sortable: true,
      render: (u) => (
        <span className={`dgs-saas-chip ${u.is_active ? "success" : "danger"}`}>
          {u.is_active ? "ACTIVE" : "DISABLED"}
        </span>
      ),
    },
    {
      key: "last_login_at",
      header: "Last Login",
      sortable: true,
      render: (u) => (
        <span style={{ fontSize: "0.82rem", color: "var(--dgs-text-muted)" }}>
          {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "Never"}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <PageHeader
        title="Users & Access Governance"
        subtitle="Database-backed users, RBAC roles (Superadmin, Admin, Manager), and security sessions."
        actions={
          <button
            type="button"
            className="dgs-saas-btn primary sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={14} />
            <span>Add User</span>
          </button>
        }
      />

      <SaaSTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id}
        searchPlaceholder="Search users by name, email, or role..."
        actions={(u) => (
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="dgs-saas-btn secondary sm"
              onClick={() => setShowPasswordModal(u)}
              title="Reset password"
            >
              Reset Key
            </button>
            <button
              type="button"
              className={`dgs-saas-btn sm ${u.is_active ? "secondary" : "primary"}`}
              onClick={() => handleToggleActive(u)}
            >
              {u.is_active ? "Disable" : "Enable"}
            </button>
            {currentRole === "superadmin" && (
              <button
                type="button"
                className="dgs-saas-btn danger sm"
                onClick={() => handleDeleteUser(u)}
              >
                Delete
              </button>
            )}
          </div>
        )}
      />

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="dgs-saas-search-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()} style={{ width: "480px" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)" }}>
              <h3 style={{ margin: 0, color: "var(--dgs-text-primary)" }}>Add New CMS User</h3>
            </div>
            <form onSubmit={handleCreateUser} style={{ padding: "24px", display: "grid", gap: "16px" }}>
              {errorMsg && (
                <div style={{ color: "var(--dgs-danger)", fontSize: "0.85rem" }}>{errorMsg}</div>
              )}
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Display Name
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "var(--dgs-text-primary)",
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Email Address
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "var(--dgs-text-primary)",
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Role
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as CmsRole)}
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "var(--dgs-text-primary)",
                  }}
                >
                  <option value="manager">Manager (Read &amp; operations)</option>
                  <option value="admin">Administrator (Content &amp; marketing)</option>
                  {currentRole === "superadmin" && (
                    <option value="superadmin">Superadmin (Full platform control)</option>
                  )}
                </select>
              </label>
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                Temporary Password
                <input
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "var(--dgs-text-primary)",
                  }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="dgs-saas-btn secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dgs-saas-btn primary"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="dgs-saas-search-overlay" onClick={() => setShowPasswordModal(null)}>
          <div className="dgs-saas-search-modal" onClick={(e) => e.stopPropagation()} style={{ width: "440px" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dgs-border)" }}>
              <h3 style={{ margin: 0, color: "var(--dgs-text-primary)" }}>Reset Password for {showPasswordModal.email}</h3>
            </div>
            <form onSubmit={handleResetPassword} style={{ padding: "24px", display: "grid", gap: "16px" }}>
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", color: "var(--dgs-text-muted)" }}>
                New Password
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter strong password..."
                  style={{
                    background: "var(--dgs-bg-input)",
                    border: "1px solid var(--dgs-border)",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "var(--dgs-text-primary)",
                  }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="dgs-saas-btn secondary"
                  onClick={() => setShowPasswordModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dgs-saas-btn primary"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
