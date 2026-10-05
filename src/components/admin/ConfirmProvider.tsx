"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import ConfirmModal from "./ConfirmModal"

interface ConfirmOptions {
  title?: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmStyle?: React.CSSProperties
}

interface ConfirmContextType {
  confirm: (options: string | ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ message: "" })
  const [resolver, setResolver] = useState<(value: boolean) => void>()

  const confirm = useCallback((opts: string | ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(typeof opts === "string" ? { message: opts } : opts)
      setResolver(() => resolve)
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setIsOpen(false)
    if (resolver) resolver(true)
  }, [resolver])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    if (resolver) resolver(false)
  }, [resolver])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        title={options.title || "Confirmation"}
        message={options.message}
        confirmLabel={options.confirmLabel || "Confirmer"}
        cancelLabel={options.cancelLabel || "Annuler"}
        confirmStyle={options.confirmStyle}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider")
  }
  return context.confirm
}
