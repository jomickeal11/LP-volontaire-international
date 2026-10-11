export default function BackofficeForbiddenPage() {
  return <main className="mx-auto max-w-xl px-6 py-20 text-center"><h1 className="text-2xl font-bold text-[#003366]">Accès refusé</h1><p className="mt-3 text-slate-600">Votre rôle ne permet pas d’accéder à cette page. Si vous pensez qu’il s’agit d’une erreur, contactez un super-administrateur.</p><a href="/backoffice/dashboard" className="mt-6 inline-flex rounded-lg bg-[#003366] px-4 py-2.5 font-semibold text-white">Retour au tableau de bord</a></main>
}
