"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminShell from "./AdminShell";
import type { CmsUser } from "@/lib/cms/auth-db";

type Props = {
  children: React.ReactNode;
  currentUser?: CmsUser | null;
};

export default function AdminLayoutClient({ children, currentUser }: Props) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminShell currentUser={currentUser}>
      {children}
    </AdminShell>
  );
}
