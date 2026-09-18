import React from "react"

interface RequiredAsteriskProps {
  className?: string
}

/**
 * RequiredAsterisk
 * 
 * Composant officiel unifié pour marquer les champs obligatoires sur tous les formulaires d'APTIC-R.
 * Affiche un astérisque rouge accessible et harmonisé : text-red-500 font-bold ml-1
 */
export function RequiredAsterisk({ className = "" }: RequiredAsteriskProps) {
  return (
    <span 
      className={`text-red-500 font-bold ml-1 select-none ${className}`} 
      aria-hidden="true"
      title="Champ obligatoire"
    >
      *
    </span>
  )
}

export default RequiredAsterisk
