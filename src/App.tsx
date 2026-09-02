import { useState } from "react"
import type { Page, Language } from "./types"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./views/Home"
import ApplyPage from "./views/ApplyPage"
import PartnerPage from "./views/PartnerPage"
import AdminLogin from "./views/admin/AdminLogin"
import AdminLayout from "./views/admin/AdminLayout"
import AdminDashboard from "./views/admin/AdminDashboard"
import AdminApplications from "./views/admin/AdminApplications"
import AdminCandidateDetail from "./views/admin/AdminCandidateDetail"
import AdminAnalytics from "./views/admin/AdminAnalytics"

export default function App() {
  const [page, setPage] = useState<Page>("home")
  const [lang, setLang] = useState<Language>("EN")
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("C001")

  const navigate = (p: Page, opts?: { candidateId?: string }) => {
    setPage(p)
    if (opts?.candidateId) setSelectedCandidateId(opts.candidateId)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const isPublicPage = page === "home" || page === "apply" || page === "partner"
  const isAdminPage = page.startsWith("admin") && page !== "admin-login"

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
    >
      {isPublicPage && (
        <Header
          currentPage={page}
          lang={lang}
          setLang={setLang}
          navigate={navigate}
        />
      )}

      {page === "home" && <Home lang={lang} navigate={navigate} />}
      {page === "apply" && <ApplyPage lang={lang} navigate={navigate} />}
      {page === "partner" && <PartnerPage lang={lang} navigate={navigate} />}
      {page === "admin-login" && (
        <AdminLogin onLogin={() => navigate("admin-dashboard")} />
      )}

      {isAdminPage && (
        <AdminLayout
          currentPage={page}
          navigate={navigate}
          onLogout={() => navigate("admin-login")}
        >
          {page === "admin-dashboard" && <AdminDashboard navigate={navigate} />}
          {page === "admin-applications" && (
            <AdminApplications
              navigate={navigate}
              onSelectCandidate={(id) =>
                navigate("admin-candidate", { candidateId: id })
              }
            />
          )}
          {page === "admin-candidate" && (
            <AdminCandidateDetail
              candidateId={selectedCandidateId}
              navigate={navigate}
            />
          )}
          {page === "admin-analytics" && <AdminAnalytics />}
        </AdminLayout>
      )}

      {isPublicPage && <Footer lang={lang} navigate={navigate} />}
    </div>
  )
}
