import { cn } from "../lib/cn"

/**
 * The AI Tamizhaa monogram: "AI" on the brand gradient with a saffron spark.
 * Sized by `size` (px) so the type scales with the tile. Decorative: the
 * product name always sits next to it, so it is hidden from assistive tech.
 */
function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      data-slot="brand-mark"
      className={cn("brand-mark", className)}
      style={{ width: size, height: size, borderRadius: size * 0.28, fontSize: size * 0.4 }}
    >
      AI
    </span>
  )
}

export { BrandMark }
