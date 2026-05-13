import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession } from "@/app/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("bmm_session")?.value;
  if (!token || !validateSession(token)) redirect("/login");
  return <>{children}</>;
}
