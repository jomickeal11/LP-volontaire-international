import React, { useState, useEffect } from "react"
import type { Page } from "../types"
import { CheckCircleIcon, ArrowRightIcon } from "./Icons"

interface EligibilityModalProps {
  isOpen: boolean
  onClose: () => void
  t: any
  navigate: (p: Page) => void
}

export default function EligibilityModal({ isOpen, onClose, t, navigate }: EligibilityModalProps) {
  const [checks, setChecks] = useState([false, false, false, false, false])

  // Reset checks when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setChecks([false, false, false, false, false])
    }
  }, [isOpen])

  if (!isOpen) return null

  const toggleCheck = (index: number) => {
    const newChecks = [...checks]
    newChecks[index] = !newChecks[index]
    setChecks(newChecks)
  }

  const isAllChecked = checks.every(c => c)
  const questions = [t.q1, t.q2, t.q3, t.q4, t.q5]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col transition-all max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>

        <h3 className="text-2xl font-bold text-[#174F7A] mb-8 pr-8 font-['DM_Serif_Display']">
          {t.title}
        </h3>

        <div className="flex flex-col gap-4 mb-4">
          {questions.map((q, i) => {
            const checked = checks[i]
            return (
              <label 
                key={i} 
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  checked ? "border-[#35A85A] bg-[#35A85A]/5" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleCheck(i)}
                  />
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors border-2 ${
                    checked ? "bg-[#35A85A] border-[#35A85A]" : "border-gray-300 bg-white"
                  }`}>
                    {checked && (
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className={`text-base font-medium leading-snug transition-colors ${
                  checked ? "text-[#174F7A]" : "text-[#5E6B76]"
                }`}>
                  {q}
                </span>
              </label>
            )
          })}
        </div>

        <div className={`transition-all duration-500 overflow-hidden ${
          isAllChecked ? "max-h-64 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        }`}>
          <div className="bg-[#35A85A]/10 p-6 rounded-2xl text-center">
            <div className="flex justify-center mb-3">
              <CheckCircleIcon size={32} color="#35A85A" />
            </div>
            <p className="text-lg font-bold text-[#174F7A] mb-6">
              {t.successMsg}
            </p>
            <button
              onClick={() => {
                onClose()
                navigate("apply")
              }}
              className="w-full inline-flex items-center justify-center gap-3 font-bold text-sm px-8 py-4 rounded-xl text-white transition-all shadow-lg hover:scale-105"
              style={{ backgroundColor: "#35A85A" }}
            >
              <span>{t.cta}</span>
              <ArrowRightIcon size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
