import { getPhotoVariant } from "@/lib/photoVariants"

interface OptimizedPhotoProps {
  src: string
  alt: string
  className?: string
  loading?: "lazy" | "eager"
  fetchPriority?: "high" | "low" | "auto"
  decoding?: "async" | "sync" | "auto"
}

/**
 * Rend une photo en proposant les variantes AVIF puis WebP lorsqu'elles existent,
 * avec l'image d'origine en fallback — strictement le même mécanisme que le hero
 * de `/fr/volontariat` (`src/views/Home.tsx`), validé par Lighthouse.
 *
 * Si le chemin n'est pas une photo statique connue (téléversement
 * administrateur, image définie en base), le composant rend un `<img>` simple :
 * le rendu reste identique et aucun format n'est inventé à la volée.
 */
export default function OptimizedPhoto({
  src,
  alt,
  className,
  loading = "lazy",
  fetchPriority,
  decoding = "async",
}: OptimizedPhotoProps) {
  const variant = getPhotoVariant(src)

  const img = (
    <img
      src={src}
      width={variant?.width}
      height={variant?.height}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
    />
  )

  if (!variant) {
    // Add aspect-ratio placeholder to reduce CLS for dynamic CMS images
    return (
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover ${className || ""}`}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
        />
      </div>
    )
  }

  return (
    <picture>
      <source srcSet={variant.avif} type="image/avif" />
      <source srcSet={variant.webp} type="image/webp" />
      {img}
    </picture>
  )
}