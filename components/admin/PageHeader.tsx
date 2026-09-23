import React from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <div className="dgs-page-header-container" style={{ marginBottom: 20 }}>
      <div className="dgs-page-header">
        <div className="dgs-page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: "var(--dgs-text-page-title, 26px)", fontWeight: "var(--dgs-weight-page-title, 650)", color: "var(--dgs-text-primary)", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.25 }}>
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p style={{ fontSize: "var(--dgs-text-page-sub, 14px)", color: "var(--dgs-text-muted)", margin: "4px 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="dgs-page-actions">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
