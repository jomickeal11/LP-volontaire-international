"use client"

import AdminLogin from "@/views/admin/AdminLogin"
import { useRouter } from "next/navigation"

export default function AdminLoginRoute() {
  const router = useRouter()

  return <AdminLogin onLogin={() => router.push("/backoffice/dashboard")} />
}
