"use client"

import React from "react"
import {
  getResolvedSocialLinks,
  type SocialNetworkItem,
} from "@/lib/social-links"

export type SocialLinksVariant = "header" | "section" | "banner" | "footer"

interface SocialLinksProps {
  variant?: SocialLinksVariant
  overrides?: Record<string, string | undefined>
  className?: string
  showLabels?: boolean
}

export default function SocialLinks({
  variant = "section",
  overrides,
  className = "",
  showLabels = false,
}: SocialLinksProps) {
  const links = getResolvedSocialLinks(overrides)

  if (links.length === 0) return null

  // Styles selon la variante
  const getContainerClasses = () => {
    switch (variant) {
      case "header":
        return "flex items-center gap-1.5"
      case "banner":
        return "flex items-center justify-center gap-3"
      case "footer":
        return "flex items-center gap-2.5"
      case "section":
      default:
        return "flex items-center gap-2.5"
    }
  }

  const getItemClasses = () => {
    switch (variant) {
      case "header":
        return "w-7 h-7 flex items-center justify-center rounded-full border border-[rgba(0,51,102,0.12)] bg-[#F5F7F9] hover:bg-[#EAF0F4] text-[#003366] hover:text-[#007BFF] transition-all cursor-pointer"
      case "banner":
        return "w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl border border-[#E5EAF0] bg-white hover:border-[#007BFF] hover:bg-[#F0F7FF] text-[#003366] hover:text-[#007BFF] transition-all shadow-xs cursor-pointer hover:-translate-y-0.5"
      case "footer":
        return "w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-[#003366] text-white cursor-pointer"
      case "section":
      default:
        return "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-[#E5EAF0] bg-white hover:border-[#007BFF] hover:bg-[#F0F7FF] text-[#003366] hover:text-[#007BFF] transition-all shadow-xs cursor-pointer hover:-translate-y-0.5"
    }
  }

  const getSvgClasses = () => {
    switch (variant) {
      case "header":
        return "w-3.5 h-3.5"
      case "banner":
        return "w-4.5 h-4.5"
      case "footer":
        return "w-3.5 h-3.5"
      case "section":
      default:
        return "w-4 h-4"
    }
  }

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {links.map((item: SocialNetworkItem) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`APTIC-R sur ${item.label}`}
          title={`APTIC-R sur ${item.label}`}
          className={getItemClasses()}
        >
          <svg
            className={getSvgClasses()}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d={item.iconPath} />
          </svg>
          {showLabels && (
            <span className="text-xs font-semibold ml-2">{item.label}</span>
          )}
        </a>
      ))}
    </div>
  )
}
