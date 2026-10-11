import AdministratorInvitationForm from "@/views/admin/AdministratorInvitationForm"

export const dynamic = "force-dynamic"

export default function AdministratorInvitationPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-10"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><img src="/logo-aptic-official.png" alt="APTIC-R" className="mx-auto mb-6 h-16 w-auto"/><h1 className="text-center text-2xl font-bold text-[#003366]">Activer un compte administrateur</h1><AdministratorInvitationForm /></div></main>
}
