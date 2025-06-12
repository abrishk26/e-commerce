import { checkAdminAccess } from "@/lib/checkAdminStatus"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkAdminAccess()
  return <>{children}</>
}