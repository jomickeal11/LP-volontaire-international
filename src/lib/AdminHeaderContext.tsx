'use client'

import React, { createContext, useContext, useState } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface AdminHeaderContextType {
  breadcrumb: BreadcrumbItem[]
  setBreadcrumb: (items: BreadcrumbItem[]) => void
}

const AdminHeaderContext = createContext<AdminHeaderContextType | undefined>(undefined)

export function AdminHeaderProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([])

  return (
    <AdminHeaderContext.Provider value={{ breadcrumb, setBreadcrumb }}>
      {children}
    </AdminHeaderContext.Provider>
  )
}

export function useAdminHeader() {
  const context = useContext(AdminHeaderContext)
  if (!context) {
    throw new Error('useAdminHeader must be used within an AdminHeaderProvider')
  }
  return context
}