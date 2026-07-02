import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  // Defense in depth — middleware already protects this route group,
  // but verify again at the layout level.
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-charcoal-950">
      <AdminSidebar adminName={admin.email} />
      <div className="flex-1 overflow-x-hidden">
        <div className="container-edge max-w-none py-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
