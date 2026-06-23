import type { ReactNode } from 'react'
import { Reveal } from '@/components/site/motion'

export function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  id?: string
  eyebrow: string
  title: ReactNode
  subtitle?: string
  align?: 'center' | 'left'
}) {
  const alignment = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start'
  return (
    <Reveal>
      <div className={`flex max-w-xl flex-col ${alignment}`}>
        <span className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold">
          <span className="h-px w-6 bg-gold/60" />
          {eyebrow}
        </span>
        <h2 id={id} className="mt-3 font-display text-[clamp(1.9rem,4.5vw,2.9rem)] font-bold uppercase leading-tight tracking-tight text-white">
          {title}
        </h2>
        {subtitle && <p className="mt-3 text-[0.95rem] leading-relaxed text-white/55">{subtitle}</p>}
      </div>
    </Reveal>
  )
}
