import type { Metadata } from "next";
import "./admin.css";
import "./saas.css";
import { getCurrentCmsUser } from "@/lib/cms/auth-db";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DGS CMS Operations OS",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const currentUser = await getCurrentCmsUser();

  return (
    <AdminLayoutClient currentUser={currentUser}>
      {children}
    </AdminLayoutClient>
  );
}
